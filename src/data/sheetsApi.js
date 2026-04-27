const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

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
  return `${MONTH_LABELS[meta.month]} '${String(meta.year).slice(2)}`;
}

function getDaysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

function parseNum(val) {
  if (val === null || val === undefined || val === '') return 0;
  const n = parseFloat(String(val).replace(/[₹,%\s]/g, '').replace(/,/g, ''));
  return isNaN(n) ? 0 : n;
}

async function listSheets() {
  if (!API_KEY) throw new Error('VITE_GOOGLE_API_KEY not configured');
  if (!SPREADSHEET_ID) throw new Error('VITE_SPREADSHEET_ID not configured');
  const res = await fetch(`${BASE}/${SPREADSHEET_ID}?fields=sheets.properties.title&key=${API_KEY}`);
  if (!res.ok) throw new Error(`Sheets API ${res.status}`);
  const data = await res.json();
  return data.sheets.map(s => s.properties.title);
}

async function fetchSheetRows(sheetName) {
  const encoded = encodeURIComponent(`'${sheetName}'!A1:Z50`);
  const res = await fetch(`${BASE}/${SPREADSHEET_ID}/values/${encoded}?key=${API_KEY}`);
  if (!res.ok) throw new Error(`Range fetch ${res.status} for "${sheetName}"`);
  const data = await res.json();
  return data.values || [];
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
    });
  }

  // Merge Meesho + Meesho B2B into one combined card
  const meesho = channels.find(c => c.name.toLowerCase() === 'meesho');
  const meeshob2b = channels.find(c => c.name.toLowerCase() === 'meesho b2b');
  if (meesho && meeshob2b) {
    meesho.name = 'Meesho (incl. B2B)';
    meesho.target += meeshob2b.target;
    meesho.actual += meeshob2b.actual;
    meesho.pct = meesho.target > 0 ? Math.round((meesho.actual / meesho.target) * 100) : 0;
    channels.splice(channels.indexOf(meeshob2b), 1);
  }

  // Merge RK World + Clicktech + Amazon SC → Amazon (SC & VC)
  function isAmazonChannel(name) {
    const n = name.toLowerCase();
    return n.includes('rk world') || n.includes('clicktech') || n.includes('amazon sc');
  }
  const amazonChannels = channels.filter(c => isAmazonChannel(c.name));
  if (amazonChannels.length >= 2) {
    const combined = {
      name: 'Amazon (SC & VC)',
      target: amazonChannels.reduce((s, c) => s + c.target, 0),
      actual: amazonChannels.reduce((s, c) => s + c.actual, 0),
      pct: 0,
    };
    combined.pct = combined.target > 0 ? Math.round((combined.actual / combined.target) * 100) : 0;
    const firstIdx = channels.indexOf(amazonChannels[0]);
    channels.splice(firstIdx, 0, combined);
    amazonChannels.forEach(c => channels.splice(channels.indexOf(c), 1));
  }

  // Monthly target = sum of all channel targets (more robust than reading Total column)
  const monthTarget = channels.reduce((sum, ch) => sum + ch.target, 0);
  const monthActual = parseNum(actualRow[totalIdx]);
  const daysInMonth = getDaysInMonth(meta.month, meta.year);
  const dailyTarget = monthTarget > 0 ? Math.round(monthTarget / daysInMonth) : 0;

  const dailyData = [];
  for (const row of dailyRows) {
    if (!row[0]) continue;
    const d = new Date(row[0]);
    if (isNaN(d.getTime())) continue;
    const revenue = parseNum(row[totalIdx]);
    if (revenue <= 0) continue;
    dailyData.push({ day: String(d.getDate()), revenue, target: dailyTarget });
  }

  return {
    label: getMonthLabel(meta),
    monthTarget,
    monthActual,
    channels,
    dailyData,
    daysDone: dailyData.length,
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
      !name.toLowerCase().includes('oct') &&
      !name.toLowerCase().includes('nov') &&
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

  return {
    monthlyData: valid.map((m, i) => ({
      month: m.label,
      revenue: m.monthActual,
      target: m.monthTarget,
      partial: i === valid.length - 1 && m.daysDone < m.daysInMonth,
    })),
    channelData: current.channels,
    dailyData: current.dailyData,
    currentMTD: current.monthActual,
    currentTarget: current.monthTarget,
    daysDone: current.daysDone,
    totalDays: current.daysInMonth,
    dailyTarget: current.dailyTarget,
    currentMRR: lastComplete ? lastComplete.monthActual : current.monthActual,
    currentMonthLabel: current.label,
  };
}
