// Shared Google Sheets fetch layer used by every data hook (mission-control sales,
// channel growth, and FY performance). It exists to keep the dashboard under Google's
// per-minute read quota, because all three hooks read the SAME spreadsheet — and largely
// the same DSR month tabs — on overlapping schedules.
//
// Two mechanisms:
//   1. Retry with exponential backoff + jitter on 429 / 5xx, so a momentary quota spike
//      (e.g. the startup burst when all hooks fetch at once) recovers instead of failing.
//   2. A short-TTL request cache keyed by URL. When two hooks ask for the same sheet within
//      the window — or the same render fires twice — they share one network call instead of
//      each hitting the API. In-flight promises are cached too, so simultaneous identical
//      requests are de-duplicated.

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

// How long a fetched result (or in-flight request) is reused. Kept well under the fastest
// hook's 5-min (300s) refresh so a scheduled poll always lands after expiry and gets fresh
// data — 150s leaves a comfortable margin while covering the startup burst and any
// near-simultaneous reads across the three hooks.
const TTL_MS = 150 * 1000;
const MAX_RETRIES = 4;

const cache = new Map(); // url -> { t: timestamp, p: Promise<json> }

async function sheetsFetch(url, label) {
  let lastErr;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    let res;
    try {
      res = await fetch(url);
    } catch (e) {
      lastErr = e;
    }
    if (res) {
      if (res.ok) return res.json();
      // 4xx other than 429 are permanent (bad range, bad key) — don't retry.
      if (res.status !== 429 && res.status < 500) {
        throw new Error(`${label} ${res.status}`);
      }
      lastErr = new Error(`${label} ${res.status}`);
    }
    if (attempt < MAX_RETRIES) {
      const backoff = Math.min(8000, 600 * 2 ** attempt) + Math.random() * 400;
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw lastErr;
}

// Drop all cached results so the next fetch goes to the network. Used by the manual
// "refresh" (logo click) so a just-edited sheet is picked up immediately instead of
// being served the still-valid cached copy.
export function clearSheetsCache() {
  cache.clear();
}

function cachedGet(url, label) {
  const now = Date.now();
  const hit = cache.get(url);
  if (hit && now - hit.t < TTL_MS) return hit.p;
  // Cache the promise immediately so concurrent callers share one request.
  const p = sheetsFetch(url, label).catch((err) => {
    cache.delete(url); // don't cache failures — let the next call retry
    throw err;
  });
  cache.set(url, { t: now, p });
  return p;
}

export async function listSheets(spreadsheetId) {
  if (!API_KEY) throw new Error('VITE_GOOGLE_API_KEY not configured');
  if (!spreadsheetId) throw new Error('Spreadsheet ID not configured');
  const url = `${BASE}/${spreadsheetId}?fields=sheets.properties.title&key=${API_KEY}`;
  const data = await cachedGet(url, 'Sheets API');
  return data.sheets.map((s) => s.properties.title);
}

export async function fetchSheetValues(sheetName, spreadsheetId, range = 'A1:Z65') {
  if (!API_KEY) throw new Error('VITE_GOOGLE_API_KEY not configured');
  if (!spreadsheetId) throw new Error('Spreadsheet ID not configured');
  const encoded = encodeURIComponent(`'${sheetName}'!${range}`);
  const url = `${BASE}/${spreadsheetId}/values/${encoded}?key=${API_KEY}`;
  const data = await cachedGet(url, `Range fetch for "${sheetName}"`);
  return data.values || [];
}
