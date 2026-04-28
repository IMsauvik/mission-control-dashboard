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

export function getPctColor(pct) {
  if (pct >= 100) return '#22c55e';   // green  — ON FIRE
  if (pct >= 75)  return '#38bdf8';   // sky blue — ON TRACK
  if (pct >= 50)  return '#fb923c';   // bright orange — NEEDS PUSH
  return '#f43f5e';                    // rose red — CRITICAL
}

export function getPctLabel(pct) {
  if (pct >= 100) return 'ON FIRE';
  if (pct >= 75)  return 'ON TRACK';
  if (pct >= 50)  return 'NEEDS PUSH';
  return 'CRITICAL';
}
