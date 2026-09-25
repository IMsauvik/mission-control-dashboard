export const MRR_GOAL = 40000000; // ₹4 Crore

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

// No ₹ symbol — used in compact chip labels (e.g. filter bar) where the
// currency is implied by context.
export function formatCompactINR(amount) {
  if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000)   return `${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000)     return `${(amount / 1000).toFixed(1)}K`;
  return `${Math.round(amount).toLocaleString('en-IN')}`;
}

export function formatAgo(date) {
  if (!date) return '—';
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function getPctColor(pct) {
  if (pct >= 100) return '#22c55e';   // green  — ON FIRE
  if (pct >= 75)  return '#38bdf8';   // sky blue — ON TRACK
  if (pct >= 50)  return '#fb923c';   // bright orange — NEEDS PUSH
  return '#f43f5e';                    // rose red — CRITICAL
}

// Status gradient for progress bars / fills — same bands as getPctColor.
export function getPctGradient(pct) {
  if (pct >= 100) return 'linear-gradient(90deg, #16a34a, #22c55e, #4ade80)';
  if (pct >= 75) return 'linear-gradient(90deg, #0284c7, #38bdf8)';
  if (pct >= 50) return 'linear-gradient(90deg, #ea580c, #fb923c)';
  return 'linear-gradient(90deg, #be123c, #f43f5e)';
}

export function getPctLabel(pct) {
  if (pct >= 100) return 'ON FIRE';
  if (pct >= 75)  return 'ON TRACK';
  if (pct >= 50)  return 'NEEDS PUSH';
  return 'CRITICAL';
}
