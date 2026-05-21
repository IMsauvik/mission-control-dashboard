// Turns a channel's 6-month value series into the headline + crisp month-over-month
// commentary shown under the chart.

import { formatINR, formatPct } from './format.js';

function dirOf(pct) {
  if (pct === null) return 'flat';
  if (pct > 1.5) return 'up';
  if (pct < -1.5) return 'down';
  return 'flat';
}

function pctChange(prev, curr) {
  if (!prev || prev === 0) return null; // can't express growth from a zero base
  return ((curr - prev) / prev) * 100;
}

// months: ['Nov 25', ...]   values: [n0, ...]  (same length)
export function analyzeChannel(months, values) {
  // Month-over-month steps: Nov→Dec, Dec→Jan, ...
  const steps = [];
  for (let i = 1; i < values.length; i++) {
    const prev = values[i - 1];
    const curr = values[i];
    const pct = pctChange(prev, curr);
    const abs = curr - prev;
    const dir = dirOf(pct);
    steps.push({
      from: months[i - 1].split(' ')[0],
      to: months[i].split(' ')[0],
      prev,
      curr,
      pct,
      abs,
      dir,
      label: `${months[i - 1].split(' ')[0]}→${months[i].split(' ')[0]}`,
    });
  }

  // Overall: first → last
  const first = values[0];
  const last = values[values.length - 1];
  const overallPct = pctChange(first, last);
  const overallAbs = last - first;
  const overallDir = dirOf(overallPct);

  // Best / worst month-step (by %), ignoring steps we couldn't compute.
  const computable = steps.filter((s) => s.pct !== null);
  let best = null;
  let worst = null;
  for (const s of computable) {
    if (best === null || s.pct > best.pct) best = s;
    if (worst === null || s.pct < worst.pct) worst = s;
  }

  return { steps, first, last, overallPct, overallAbs, overallDir, best, worst };
}

// One short, crisp sentence summarising the whole 6 months.
export function headlineSentence(channelKey, a) {
  const verb = a.overallDir === 'up' ? 'grew' : a.overallDir === 'down' ? 'fell' : 'was roughly flat';
  if (a.overallPct === null) {
    return `${channelKey} ${verb} from ${formatINR(a.first)} to ${formatINR(a.last)} over the 6 months.`;
  }
  let s = `${channelKey} ${verb} ${formatPct(a.overallPct)} over 6 months — ${formatINR(a.first)} → ${formatINR(a.last)}`;
  if (a.best && a.best.dir === 'up') s += `; strongest jump ${a.best.label} (${formatPct(a.best.pct)})`;
  if (a.worst && a.worst.dir === 'down') s += `; biggest dip ${a.worst.label} (${formatPct(a.worst.pct)})`;
  return s + '.';
}
