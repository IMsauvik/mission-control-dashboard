// Fetches per-channel monthly totals for the last 6 COMPLETED months (a rolling window
// that advances automatically as new month tabs are added) from the same Google Sheet
// used by the mission-control dashboard.
//
// The DSR tabs come in two layouts, but one rule holds for every month:
//   - there is a channel-name HEADER row (col A = "Date" / "DATE" / "Daily Gross Sales")
//   - the row DIRECTLY ABOVE it is the per-channel monthly "Total Sales" row
// We read those two rows and ignore everything else (targets, daily rows, pace).

import { listSheets as listSheetsShared, fetchSheetValues } from '../data/sheetsClient.js';
import { resolveFYPlan, fyStartYearOf } from './fyTargets.js';

const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID;

const MONTH_MAP = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Display order = the order requested by the user. (Myntra removed per revision.)
// 5 well-separated hues — orange / blue / purple / pink / green — chosen to avoid the
// orange↔yellow and blue↔cyan look-alike pairs.
export const CHANNELS = [
  { key: 'Amazon', match: (n) => /amazon|rk world|clicktech/i.test(n), color: '#ff9900' },
  { key: 'Flipkart', match: (n) => /flipkart/i.test(n), color: '#3b82f6' },
  { key: 'Blinkit', match: (n) => /blinkit/i.test(n), color: '#ff2828' },
  { key: 'Meesho', match: (n) => /meesho/i.test(n), color: '#ffffff' },
  { key: 'Cred', match: (n) => /cred/i.test(n), color: '#22c55e' },
];

export const CHANNEL_KEYS = CHANNELS.map((c) => c.key);

// How many completed months to show in the rolling window.
const WINDOW = 6;

// sortKey of the current (in-progress) calendar month — anything >= this is excluded,
// so the in-progress month and any future tabs never enter the window.
function currentMonthKey() {
  const now = new Date();
  return now.getFullYear() * 12 + now.getMonth();
}

function parseSheetMeta(name) {
  const stripped = name.replace(/^dsr[_ ]*/i, '').toLowerCase().trim();
  const yearMatch = stripped.match(/(\d{2})\s*$/);
  const year = yearMatch ? 2000 + parseInt(yearMatch[1], 10) : null;
  const monthMatch = stripped.match(/([a-z]+)/i);
  const monthWord = monthMatch ? monthMatch[1].toLowerCase() : null;
  const month = monthWord !== null ? MONTH_MAP[monthWord] : undefined;
  if (year === null || month === undefined) return null;
  return { month, year, sortKey: year * 12 + month };
}

function monthLabel(meta) {
  return `${MONTH_LABELS[meta.month]} ${String(meta.year).slice(-2)}`;
}

function parseNum(val) {
  if (val === null || val === undefined || val === '') return 0;
  const n = parseFloat(String(val).replace(/[₹,%\s]/g, '').replace(/,/g, ''));
  return isNaN(n) ? 0 : n;
}

const listSheets = () => listSheetsShared(SPREADSHEET_ID);

const fetchSheetRows = (sheetName, range = 'A1:Z65') =>
  fetchSheetValues(sheetName, SPREADSHEET_ID, range);

const HEADER_LABELS = new Set(['date', 'daily gross sales']);

// Returns { Amazon, Flipkart, Blinkit, Meesho, Cred } monthly totals,
// or null if the sheet layout couldn't be recognised.
function parseMonthlyTotals(rows) {
  let headerIdx = -1;
  for (let i = 0; i < rows.length; i++) {
    const a = rows[i]?.[0]?.toString().trim().toLowerCase();
    if (a && HEADER_LABELS.has(a)) { headerIdx = i; break; }
  }
  if (headerIdx < 1) return null;

  const header = rows[headerIdx];
  const totalRow = rows[headerIdx - 1] || []; // "Total Sales" — full-month per-channel totals
  const totalIdx = header.findIndex((h) => h?.toString().trim().toLowerCase() === 'total');
  const lastCol = totalIdx === -1 ? header.length : totalIdx;

  const out = {};
  for (const ch of CHANNELS) out[ch.key] = 0;

  for (let i = 1; i < lastCol; i++) {
    const name = header[i]?.toString().trim();
    if (!name) continue;
    const ch = CHANNELS.find((c) => c.match(name));
    if (!ch) continue;
    out[ch.key] += parseNum(totalRow[i]);
  }
  return out;
}

// --- FY performance (target vs achieved) -----------------------------------------
// Reuses the same DSR tabs and channel matching. For each FY month tab we read:
//   - the "Total" column of the "Total Sales" row  -> month achieved total
//   - the "Total" column of the "Target" row       -> month target total (from the sheet)
//   - per-channel "Total Sales" / "Target"          -> channel achieved / target
// Returns figures in ₹ Crore. "Others" = everything beyond the 5 mapped channels.
// The FY itself follows the latest completed month, so it rolls over on its own.
const TO_CR = 1e7;

function parseMonthFY(rows) {
  let headerIdx = -1;
  for (let i = 0; i < rows.length; i++) {
    const a = rows[i]?.[0]?.toString().trim().toLowerCase();
    if (a && HEADER_LABELS.has(a)) { headerIdx = i; break; }
  }
  if (headerIdx < 2) return null; // need a Target row two above the header

  const header = rows[headerIdx];
  const totalRow = rows[headerIdx - 1] || [];   // "Total Sales"
  const targetRow = rows[headerIdx - 2] || [];  // "Target"
  const totalIdx = header.findIndex((h) => h?.toString().trim().toLowerCase() === 'total');
  if (totalIdx === -1) return null;

  const channelAchieved = {};
  const channelTarget = { Others: 0 };
  for (const ch of CHANNELS) {
    channelAchieved[ch.key] = 0;
    channelTarget[ch.key] = 0;
  }
  let othersTotal = 0;
  const otherNames = new Set();
  for (let i = 1; i < totalIdx; i++) {
    const name = header[i]?.toString().trim();
    if (!name) continue;
    const ch = CHANNELS.find((c) => c.match(name));
    const val = parseNum(totalRow[i]);
    channelTarget[ch ? ch.key : 'Others'] += parseNum(targetRow[i]);
    if (ch) {
      channelAchieved[ch.key] += val;
    } else {
      // Everything beyond the 5 named channels rolls up into "Others".
      othersTotal += val;
      // D2C Website / D2C Website & Bulk are one channel under two column names
      otherNames.add(/^d2c website/i.test(name) ? 'D2C Website & Bulk' : name);
    }
  }

  return {
    achievedTotal: parseNum(totalRow[totalIdx]),
    targetTotal: parseNum(targetRow[totalIdx]),
    channelAchieved,
    channelTarget,
    othersTotal,
    otherNames: [...otherNames],
  };
}

export async function fetchFYPerformance() {
  const names = await listSheets();
  const cutoff = currentMonthKey(); // achieved figures: completed months only

  const dsrTabs = names
    .map((name) => ({ name, meta: parseSheetMeta(name) }))
    .filter(({ name, meta }) =>
      meta !== null &&
      name.toLowerCase().startsWith('dsr') &&
      !(name.toLowerCase().includes('oct') && name.toLowerCase().includes('nov')) &&
      !name.toLowerCase().includes('daily report')
    )
    .sort((a, b) => a.meta.sortKey - b.meta.sortKey);

  // The FY is the one the latest completed month belongs to (Apr → Mar).
  const completedTabs = dsrTabs.filter(({ meta }) => meta.sortKey < cutoff);
  if (completedTabs.length === 0) throw new Error('No completed DSR month sheets found');
  const anchor = completedTabs[completedTabs.length - 1].meta;
  const fyStartYear = fyStartYearOf(anchor.month, anchor.year);
  const fyStartKey = fyStartYear * 12 + 3;
  const fyEndKey = fyStartKey + 11;

  // Every tab in this FY — including the running month — for its sheet Target row.
  const fyTabs = dsrTabs.filter(({ meta }) => meta.sortKey >= fyStartKey && meta.sortKey <= fyEndKey);
  const parsedAll = await Promise.all(
    fyTabs.map(async ({ name, meta }) => {
      const rows = await fetchSheetRows(name);
      return { meta, fy: parseMonthFY(rows) };
    })
  );
  const parsedTabs = parsedAll.filter((p) => p.fy !== null);
  const valid = parsedTabs.filter((p) => p.meta.sortKey < cutoff);

  // Sheet target wins for every month that has a tab; typed plan fills the rest.
  const plan = resolveFYPlan(
    fyStartYear,
    parsedTabs.map((p) => ({
      month: MONTH_LABELS[p.meta.month],
      targetCr: p.fy.targetTotal / TO_CR,
      channelTargetCr: Object.fromEntries(
        Object.entries(p.fy.channelTarget).map(([k, v]) => [k, v / TO_CR])
      ),
    }))
  );

  const months = valid.map((p) => monthLabel(p.meta));
  const monthly = valid.map((p) => ({
    month: MONTH_LABELS[p.meta.month],
    achievedCr: p.fy.achievedTotal / TO_CR,
    sheetTargetCr: p.fy.targetTotal / TO_CR,
  }));

  // Cumulative per-channel achieved across completed FY months.
  const channelAchievedCr = {};
  for (const ch of CHANNELS) channelAchievedCr[ch.key] = 0;
  let othersRaw = 0;
  let grandTotal = 0;
  const otherNames = new Set();
  for (const p of valid) {
    for (const ch of CHANNELS) {
      channelAchievedCr[ch.key] += (p.fy.channelAchieved[ch.key] || 0) / TO_CR;
    }
    othersRaw += p.fy.othersTotal || 0;
    grandTotal += p.fy.achievedTotal;
    (p.fy.otherNames || []).forEach((n) => otherNames.add(n));
  }
  channelAchievedCr.Others = othersRaw / TO_CR;

  return {
    months,
    monthly,
    channelAchievedCr,
    othersChannels: [...otherNames],
    totalAchievedCr: grandTotal / TO_CR,
    plan,
  };
}

export async function fetchChannelGrowth() {
  const names = await listSheets();
  const cutoff = currentMonthKey(); // exclude the in-progress month and the future

  // All valid, COMPLETED DSR month tabs, oldest → newest.
  const completed = names
    .map((name) => ({ name, meta: parseSheetMeta(name) }))
    .filter(({ name, meta }) =>
      meta !== null &&
      name.toLowerCase().startsWith('dsr') &&
      meta.sortKey < cutoff &&
      !(name.toLowerCase().includes('oct') && name.toLowerCase().includes('nov')) &&
      !name.toLowerCase().includes('daily report')
    )
    .sort((a, b) => a.meta.sortKey - b.meta.sortKey);

  if (completed.length === 0) throw new Error('No completed DSR month sheets found');

  // Rolling window: the most recent WINDOW completed months.
  const windowMeta = completed.slice(-WINDOW);

  const parsed = await Promise.all(
    windowMeta.map(async ({ name, meta }) => {
      const rows = await fetchSheetRows(name);
      return { meta, totals: parseMonthlyTotals(rows) };
    })
  );

  const valid = parsed.filter((p) => p.totals !== null);
  if (valid.length === 0) throw new Error('Could not parse any DSR sheet');

  const months = valid.map((p) => monthLabel(p.meta));
  const series = {};
  for (const ch of CHANNELS) {
    series[ch.key] = valid.map((p) => Math.round(p.totals[ch.key] || 0));
  }

  // e.g. "Nov '25 — Apr '26" for the header subline.
  const toApos = (lbl) => lbl.replace(' ', " '"); // "Nov 25" → "Nov '25"
  const rangeLabel = months.length
    ? `${toApos(months[0])} — ${toApos(months[months.length - 1])}`
    : '';

  return { months, series, rangeLabel };
}
