export const MRR_GOAL = 40000000; // ₹4 Crore

export const CURRENT_MRR = 11236447; // March 2026 (last complete month)

export const APRIL_TARGET = 17300000;
export const APRIL_MTD = 11039520;
export const APRIL_DAYS_DONE = 23;
export const APRIL_TOTAL_DAYS = 30;

export const monthlyData = [
  { month: "Dec '25", revenue: 6391785, target: 6970000 },
  { month: "Jan '26", revenue: 9988747, target: 11270000 },
  { month: "Feb '26", revenue: 9166641, target: 13050000 },
  { month: "Mar '26", revenue: 11236447, target: 14000000 },
  { month: "Apr '26", revenue: 11039520, target: 17300000, partial: true },
];

export const channelData = [
  { name: 'Flipkart',          target: 4000000, actual: 3007410, pct: 75 },
  { name: 'Blinkit',           target: 3500000, actual: 2187775, pct: 63 },
  { name: 'RK World',          target: 2500000, actual: 1546468, pct: 62 },
  { name: 'D2C (Web + Bulk)',  target: 2150000, actual: 1075000, pct: 50 },
  { name: 'Meesho',            target: 1700000, actual: 1695625, pct: 100 },
  { name: 'Cred',              target: 1200000, actual: 756000,  pct: 63 },
  { name: 'Amazon SC',         target: 1000000, actual: 1153893, pct: 115 },
  { name: 'Myntra',            target: 200000,  actual: 218000,  pct: 109 },
  { name: 'Meesho B2B',        target: 300000,  actual: 153000,  pct: 51 },
  { name: 'POP',               target: 150000,  actual: 91500,   pct: 61 },
  { name: 'Snapdeal',          target: 150000,  actual: 45580,   pct: 30 },
  { name: 'Firstcry',          target: 100000,  actual: 60000,   pct: 60 },
  { name: 'Shopclues',         target: 100000,  actual: 57000,   pct: 57 },
  { name: 'JioMart',           target: 100000,  actual: 3456,    pct: 3  },
  { name: 'First Club',        target: 100000,  actual: 35899,   pct: 36 },
  { name: 'Slikk',             target: 50000,   actual: 9964,    pct: 20 },
];

export const aprDailyData = [
  { day: '1',  revenue: 493453,  target: 576667 },
  { day: '2',  revenue: 487741,  target: 576667 },
  { day: '3',  revenue: 843758,  target: 576667 },
  { day: '4',  revenue: 679117,  target: 576667 },
  { day: '5',  revenue: 581587,  target: 576667 },
  { day: '6',  revenue: 522998,  target: 576667 },
  { day: '7',  revenue: 632219,  target: 576667 },
  { day: '8',  revenue: 523654,  target: 576667 },
  { day: '9',  revenue: 490827,  target: 576667 },
  { day: '10', revenue: 472998,  target: 576667 },
  { day: '11', revenue: 418688,  target: 576667 },
  { day: '12', revenue: 503482,  target: 576667 },
  { day: '13', revenue: 489483,  target: 576667 },
  { day: '14', revenue: 416360,  target: 576667 },
  { day: '15', revenue: 403091,  target: 576667 },
  { day: '16', revenue: 399837,  target: 576667 },
  { day: '17', revenue: 380714,  target: 576667 },
  { day: '18', revenue: 381980,  target: 576667 },
  { day: '19', revenue: 430667,  target: 576667 },
  { day: '20', revenue: 408194,  target: 576667 },
  { day: '21', revenue: 392581,  target: 576667 },
  { day: '22', revenue: 365854,  target: 576667 },
  { day: '23', revenue: 320237,  target: 576667 },
];

export function formatINR(amount) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000)   return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000)     return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatINRShort(amount) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000)   return `₹${(amount / 100000).toFixed(0)}L`;
  return `₹${(amount / 1000).toFixed(0)}K`;
}

export function getPctColor(pct) {
  if (pct >= 100) return '#22c55e';
  if (pct >= 75)  return '#f59e0b';
  if (pct >= 50)  return '#f97316';
  return '#ef4444';
}

export function getPctLabel(pct) {
  if (pct >= 100) return 'ON FIRE';
  if (pct >= 75)  return 'ON TRACK';
  if (pct >= 50)  return 'NEEDS PUSH';
  return 'CRITICAL';
}
