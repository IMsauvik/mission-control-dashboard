import { listSheets as listSheetsShared, fetchSheetValues } from './sheetsClient.js';

const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID;
const AD_SPEND_SHEET_ID = import.meta.env.VITE_AD_SPEND_SPREADSHEET_ID;
const D2C_AD_SPEND_SHEET_ID = import.meta.env.VITE_D2C_AD_SPEND_SPREADSHEET_ID;
const MEESHO_AD_SPEND_SHEET_ID = import.meta.env.VITE_MEESHO_AD_SPEND_SPREADSHEET_ID;

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
const LONG_MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function parseSheetMeta(name) {
  const stripped = name.replace(/^dsr[_ ]*/i, '').toLowerCase().trim();
  const yearMatch = stripped.match(/(\d{2})\s*$/);
  const year = yearMatch ? 2000 + parseInt(yearMatch[1]) : null;
  const monthMatch = stripped.match(/([a-z]+)/i);
  const monthWord = monthMatch ? monthMatch[1].toLowerCase() : null;
  const month = monthWord !== null ? MONTH_MAP[monthWord] : undefined;
  if (year === null || month === undefined) return null;
  return { month, year, sortKey: year * 12 + month };
}

function getMonthLabel(meta) {
  return `${MONTH_LABELS[meta.month]} ${meta.year}`;
}

function getDaysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

function parseNum(val) {
  if (val === null || val === undefined || val === '') return 0;
  const n = parseFloat(String(val).replace(/[₹,%\s]/g, '').replace(/,/g, ''));
  return isNaN(n) ? 0 : n;
}

const listSheets = () => listSheetsShared(SPREADSHEET_ID);

const fetchSheetRows = (sheetName, spreadsheetId = SPREADSHEET_ID, range = 'A1:Z65') =>
  fetchSheetValues(sheetName, spreadsheetId, range);

// Ad-spend sources. Each entry says: which DSR-side channel name to populate,
// which spreadsheet to fetch, and how to extract the spend total.
//   - `tab` (string)            → fixed-tab source (e.g. AZ, FK). Daily rows
//                                  in col F are summed; rows filtered by the
//                                  current month name in col A.
//   - `tabFor` (meta → string)  → per-month-tab source (e.g. May'26). Tab name
//                                  encodes the month; sum logic same as above.
//   - `cell` (string)           → single-cell source (e.g. B1). Reads that one
//                                  cell directly. Use when the sheet keeps the
//                                  pre-computed total in a header cell.
const AD_SPEND_SOURCES = [
  { spreadsheetId: AD_SPEND_SHEET_ID,     channel: 'Amazon (SC & VC)',   tab: 'AZ',         cell: 'F1', roasCell: 'L1' },
  { spreadsheetId: AD_SPEND_SHEET_ID,     channel: 'Flipkart',           tab: 'FK',         cell: 'F1', roasCell: 'L1' },
  { spreadsheetId: AD_SPEND_SHEET_ID,     channel: 'Blinkit',            tab: 'Blinkit',    cell: 'F1', roasCell: 'L1' },
  { spreadsheetId: AD_SPEND_SHEET_ID,     channel: 'Myntra (incl. SJIT)', tab: 'Myntra',    cell: 'F1', roasCell: 'L1' },
  { spreadsheetId: AD_SPEND_SHEET_ID,     channel: 'Instamart',          tab: 'Instamart',  cell: 'F1', roasCell: 'L1' },
  { spreadsheetId: AD_SPEND_SHEET_ID,     channel: 'Bigbasket',          tab: 'Big Basket', cell: 'F1', roasCell: 'L1' },
  {
    spreadsheetId: D2C_AD_SPEND_SHEET_ID,
    channel: 'D2C Website & Bulk',
    tabFor: (meta) => `${LONG_MONTH_NAMES[meta.month]}'${String(meta.year).slice(-2)}`,
    roasCell: 'L1',
  },
  {
    spreadsheetId: MEESHO_AD_SPEND_SHEET_ID,
    channel: 'Meesho (incl. B2B)',
    tabFor: (meta) => `${LONG_MONTH_NAMES[meta.month].toUpperCase()}-${meta.year}`,
    cell: 'B1',
  },
];

const AD_TRACKED_CHANNELS = new Set(AD_SPEND_SOURCES.map(s => s.channel));

async function fetchAdSpendForSource(src, meta) {
  if (!src.spreadsheetId) return null;
  const tab = src.tabFor ? src.tabFor(meta) : src.tab;
  if (!tab) return null;

  // Single-cell mode (e.g. Meesho's B1 pre-computed total).
  if (src.cell) {
    try {
      const [spendRows, roasRows] = await Promise.all([
        fetchSheetRows(tab, src.spreadsheetId, src.cell),
        src.roasCell
          ? fetchSheetRows(tab, src.spreadsheetId, src.roasCell).catch(() => null)
          : Promise.resolve(null),
      ]);
      const spend = parseNum(spendRows[0]?.[0]);
      const roas = roasRows ? parseNum(roasRows[0]?.[0]) : null;
      return { spend, roas: roas && roas > 0 ? roas : null };
    } catch (err) {
      console.warn(`[AdSpend ${src.channel}/${tab}!${src.cell}]`, err.message);
      return null;
    }
  }

  // Daily-rows mode: sum col F where col A starts with the current month name.
  const monthShort = MONTH_LABELS[meta.month]?.toLowerCase();
  if (!monthShort) return null;
  try {
    const rows = await fetchSheetRows(tab, src.spreadsheetId, 'A1:F65');
    let sum = 0;
    for (let i = 2; i < rows.length; i++) {
      const dateCell = String(rows[i]?.[0] || '').trim();
      const match = dateCell.match(/^([A-Za-z]+)[-\s]\d{1,2}$/);
      if (!match) continue;
      if (match[1].toLowerCase() !== monthShort) continue;
      sum += parseNum(rows[i][5]); // Column F = "Spends Ach"
    }
    let roas = null;
    if (src.roasCell) {
      try {
        const roasRows = await fetchSheetRows(tab, src.spreadsheetId, src.roasCell);
        const v = parseNum(roasRows[0]?.[0]);
        if (v > 0) roas = v;
      } catch {
        // leave null
      }
    }
    return { spend: sum, roas };
  } catch (err) {
    console.warn(`[AdSpend ${src.channel}/${tab}]`, err.message);
    return null;
  }
}

async function fetchAdSpendForMonth(meta) {
  const entries = await Promise.all(
    AD_SPEND_SOURCES.map(async (src) => {
      const result = await fetchAdSpendForSource(src, meta);
      return [src.channel, result];
    })
  );
  const out = new Map();
  for (const [name, result] of entries) {
    if (result && result.spend > 0) out.set(name, result);
  }
  return out;
}

function parseSheet(rows, meta) {
  // Find the row where col A = "Date" — that is the column header row
  let headerIdx = -1;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i]?.[0]?.toString().trim().toLowerCase() === 'date') {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx < 2) return null;

  const header = rows[headerIdx];
  const targetRow = rows[headerIdx - 2] || [];
  const actualRow = rows[headerIdx - 1] || [];
  const dailyRows = rows.slice(headerIdx + 1);

  // "Total" column = exact match (not "AZ Total" etc.)
  const totalIdx = header.findIndex(h => h?.toString().trim().toLowerCase() === 'total');
  if (totalIdx === -1) return null;

  const channels = [];
  for (let i = 1; i < totalIdx; i++) {
    if (!header[i]) continue;
    const target = parseNum(targetRow[i]);
    const actual = parseNum(actualRow[i]);
    // Skip completely empty channels (no target and no sales)
    if (target === 0 && actual === 0) continue;
    channels.push({
      name: header[i].toString().trim(),
      target,
      actual,
      pct: target > 0 ? Math.round((actual / target) * 100) : 0,
      colIdx: i,
      daily: [],
    });
  }

  // Monthly target = sum of all channel targets (more robust than reading Total column)
  const monthActual = parseNum(actualRow[totalIdx]);
  const daysInMonth = getDaysInMonth(meta.month, meta.year);

  const dailyData = [];
  for (const row of dailyRows) {
    if (!row[0]) continue;
    const d = new Date(row[0]);
    if (isNaN(d.getTime())) continue;
    const revenue = parseNum(row[totalIdx]);
    if (revenue <= 0) continue;
    dailyData.push({ day: String(d.getDate()), revenue });
    for (const ch of channels) {
      ch.daily.push(parseNum(row[ch.colIdx]));
    }
  }

  // Merge Meesho + Meesho B2B into one combined card (sum daily arrays element-wise)
  const meesho = channels.find(c => c.name.toLowerCase() === 'meesho');
  const meeshob2b = channels.find(c => c.name.toLowerCase() === 'meesho b2b');
  if (meesho && meeshob2b) {
    meesho.name = 'Meesho (incl. B2B)';
    meesho.target += meeshob2b.target;
    meesho.actual += meeshob2b.actual;
    meesho.pct = meesho.target > 0 ? Math.round((meesho.actual / meesho.target) * 100) : 0;
    meesho.daily = meesho.daily.map((v, i) => v + (meeshob2b.daily[i] || 0));
    channels.splice(channels.indexOf(meeshob2b), 1);
  }

  // Merge Myntra + Myntra SJIT into one combined card (sum daily arrays element-wise).
  // SJIT is a newer column, so older months may lack it — still rename Myntra to the
  // combined label so month-over-month comparison matches by name.
  const myntra = channels.find(c => c.name.toLowerCase() === 'myntra');
  const myntraSjit = channels.find(c => c.name.toLowerCase() === 'myntra sjit');
  if (myntra) {
    myntra.name = 'Myntra (incl. SJIT)';
    if (myntraSjit) {
      myntra.target += myntraSjit.target;
      myntra.actual += myntraSjit.actual;
      myntra.pct = myntra.target > 0 ? Math.round((myntra.actual / myntra.target) * 100) : 0;
      myntra.daily = myntra.daily.map((v, i) => v + (myntraSjit.daily[i] || 0));
      channels.splice(channels.indexOf(myntraSjit), 1);
    }
  }

  // Merge RK World + Clicktech + Amazon SC → Amazon (SC & VC)
  function isAmazonChannel(name) {
    const n = name.toLowerCase();
    return n.includes('rk world') || n.includes('clicktech') || n.includes('amazon sc');
  }
  const amazonChannels = channels.filter(c => isAmazonChannel(c.name));
  if (amazonChannels.length >= 2) {
    const dailyLen = amazonChannels[0]?.daily?.length || 0;
    const combined = {
      name: 'Amazon (SC & VC)',
      target: amazonChannels.reduce((s, c) => s + c.target, 0),
      actual: amazonChannels.reduce((s, c) => s + c.actual, 0),
      pct: 0,
      daily: Array.from({ length: dailyLen }, (_, i) =>
        amazonChannels.reduce((s, c) => s + (c.daily[i] || 0), 0)
      ),
    };
    combined.pct = combined.target > 0 ? Math.round((combined.actual / combined.target) * 100) : 0;
    const firstIdx = channels.indexOf(amazonChannels[0]);
    channels.splice(firstIdx, 0, combined);
    amazonChannels.forEach(c => channels.splice(channels.indexOf(c), 1));
  }

  const monthTarget = channels.reduce((sum, ch) => sum + ch.target, 0);
  const dailyTarget = monthTarget > 0 ? Math.round(monthTarget / daysInMonth) : 0;
  for (const d of dailyData) d.target = dailyTarget;

  const dataRowsDone = dailyData.length;
  const dayFrac = daysInMonth > 0 ? dataRowsDone / daysInMonth : 0;
  for (const ch of channels) {
    ch.expected = Math.round(ch.target * dayFrac);
    ch.pacePct = ch.expected > 0
      ? Math.round((ch.actual / ch.expected) * 100)
      : (ch.actual > 0 ? 999 : 0);
    ch.delta = ch.actual - ch.expected;
  }

  return {
    meta,
    label: getMonthLabel(meta),
    monthTarget,
    monthActual,
    channels,
    dailyData,
    dataRowsDone: dailyData.length,
    daysInMonth,
    dailyTarget,
  };
}

export async function fetchAllSalesData() {
  const allNames = await listSheets();

  const dsrSheets = allNames
    .map(name => ({ name, meta: parseSheetMeta(name) }))
    .filter(({ name, meta }) =>
      meta !== null &&
      name.toLowerCase().startsWith('dsr') &&
      !(name.toLowerCase().includes('oct') && name.toLowerCase().includes('nov')) &&
      !name.toLowerCase().includes('daily report')
    )
    .sort((a, b) => a.meta.sortKey - b.meta.sortKey);

  if (dsrSheets.length === 0) throw new Error('No DSR monthly sheets found');

  const parsed = await Promise.all(
    dsrSheets.map(({ name, meta }) =>
      fetchSheetRows(name).then(rows => parseSheet(rows, meta))
    )
  );

  const valid = parsed.filter(Boolean);
  if (valid.length === 0) throw new Error('Could not parse any DSR sheets');

  const current = valid[valid.length - 1];
  const lastComplete = valid.length >= 2 ? valid[valid.length - 2] : null;

  const N = current.dataRowsDone;
  const lastByName = lastComplete
    ? new Map(lastComplete.channels.map(c => [c.name, c]))
    : null;
  for (const ch of current.channels) {
    const prev = lastByName?.get(ch.name);
    if (!prev || !prev.daily) {
      ch.lastSameDays = null;
      ch.prevDailySlice = null;
      ch.vsLastPct = null;
      continue;
    }
    const slice = prev.daily.slice(0, N);
    const sum = slice.reduce((s, v) => s + v, 0);
    ch.lastSameDays = sum;
    ch.prevDailySlice = slice;
    ch.vsLastPct = sum > 0
      ? Math.round(((ch.actual - sum) / sum) * 100)
      : (ch.actual > 0 ? null : 0);
  }

  const lastMonthSameDays = lastComplete
    ? lastComplete.dailyData.slice(0, N).reduce((s, d) => s + (d.revenue || 0), 0)
    : null;

  // Ads data hidden for now — the badges it fed are commented out in
  // src/components/ChannelCard.jsx. Skipping the fetch avoids the Sheets
  // calls to the ad-spend spreadsheets on every refresh.
  // const adSpendByName = await fetchAdSpendForMonth(current.meta);
  // for (const ch of current.channels) {
  //   const entry = adSpendByName.get(ch.name);
  //   ch.adSpend = entry?.spend ?? null;
  //   ch.adRoas = entry?.roas ?? null;
  //   ch.adTracked = AD_TRACKED_CHANNELS.has(ch.name);
  // }

  return {
    monthlyData: valid.map((m, i) => ({
      month: m.label,
      revenue: m.monthActual,
      target: m.monthTarget,
      partial: i === valid.length - 1 && m.dataRowsDone < m.daysInMonth,
    })),
    channelData: current.channels,
    dailyData: current.dailyData,
    currentMTD: current.monthActual,
    currentTarget: current.monthTarget,
    daysDone: current.dataRowsDone,
    totalDays: current.daysInMonth,
    dailyTarget: current.dailyTarget,
    currentMRR: lastComplete ? lastComplete.monthActual : current.monthActual,
    lastMonthSameDays,
    currentMonthLabel: current.label,
  };
}
