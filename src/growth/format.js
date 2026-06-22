// Indian-rupee formatting + growth color helpers.
// Self-contained for the growth feature (kept separate from data/salesData.js).

export function formatINR(amount) {
  const v = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (v >= 10000000) return `${sign}₹${(v / 10000000).toFixed(2)}Cr`;
  if (v >= 100000)   return `${sign}₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000)     return `${sign}₹${(v / 1000).toFixed(0)}K`;
  return `${sign}₹${v.toLocaleString('en-IN')}`;
}

export function formatINRShort(amount) {
  const v = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (v >= 10000000) return `${sign}₹${(v / 10000000).toFixed(1)}Cr`;
  if (v >= 100000)   return `${sign}₹${(v / 100000).toFixed(0)}L`;
  return `${sign}₹${(v / 1000).toFixed(0)}K`;
}

// ₹ Crore label, e.g. "₹3.38 Cr". Input is already in Crore.
export function formatCr(cr) {
  if (cr === null || cr === undefined || !isFinite(cr)) return '—';
  const sign = cr < 0 ? '-' : '';
  return `${sign}₹${Math.abs(cr).toFixed(2)} Cr`;
}

// Signed percentage label, e.g. "+222%" / "-28%".
export function formatPct(pct) {
  if (pct === null || pct === undefined || !isFinite(pct)) return '—';
  const sign = pct >= 0 ? '+' : '-';
  return `${sign}${Math.abs(Math.round(pct))}%`;
}

// Direction → accent color (green up, rose down, slate flat).
export const UP_COLOR = '#22c55e';
export const DOWN_COLOR = '#f43f5e';
export const FLAT_COLOR = '#94a3b8';

export function dirColor(dir) {
  if (dir === 'up') return UP_COLOR;
  if (dir === 'down') return DOWN_COLOR;
  return FLAT_COLOR;
}

export function dirArrow(dir) {
  if (dir === 'up') return '▲';
  if (dir === 'down') return '▼';
  return '▬';
}
