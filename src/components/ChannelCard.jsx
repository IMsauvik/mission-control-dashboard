import { formatINR, getPctColor, getPctLabel } from '../data/salesData.js';

function badgeStyle(pct, color) {
  if (pct >= 100) return { background: 'rgba(34,197,94,0.18)', color, border: '1px solid rgba(34,197,94,0.35)' };
  if (pct >= 75) return { background: 'rgba(56,189,248,0.18)', color, border: '1px solid rgba(56,189,248,0.35)' };
  if (pct >= 50) return { background: 'rgba(251,146,60,0.25)', color, border: '1px solid rgba(251,146,60,0.55)', boxShadow: '0 0 8px rgba(251,146,60,0.3)' };
  return { background: 'rgba(244,63,94,0.25)', color, border: '1px solid rgba(244,63,94,0.55)', boxShadow: '0 0 8px rgba(244,63,94,0.35)' };
}

function barGradient(pct) {
  if (pct >= 100) return 'linear-gradient(90deg, #16a34a, #22c55e, #4ade80)';
  if (pct >= 75) return 'linear-gradient(90deg, #0284c7, #38bdf8)';
  if (pct >= 50) return 'linear-gradient(90deg, #ea580c, #fb923c)';
  return 'linear-gradient(90deg, #be123c, #f43f5e)';
}

function cumulative(arr) {
  const out = [];
  let s = 0;
  for (const v of arr) { s += v; out.push(s); }
  return out;
}

const CHART_W = 200, CHART_H = 36, CHART_PAD_X_L = 6, CHART_PAD_X_R = 4, CHART_PAD_Y = 3;

export default function ChannelCard({ channel, totalDays = 31 }) {
  const {
    name, target, actual, pct,
    pacePct = pct, expected = 0, delta = 0,
    lastSameDays = null, vsLastPct = null,
    daily = [], prevDailySlice = null,
    // Ads data hidden for now — re-enable with the badge block below.
    // adSpend = null, adRoas = null, adTracked = false,
  } = channel;
  const color = getPctColor(pacePct);
  const label = getPctLabel(pacePct);
  const barWidth = Math.min(pct, 100);
  const ahead = delta >= 0;
  const hasPrev = lastSameDays !== null && lastSameDays !== undefined;
  const vsColor = vsLastPct === null || vsLastPct === undefined
    ? '#94a3b8'
    : vsLastPct > 0 ? '#22c55e'
      : vsLastPct < 0 ? '#f43f5e'
        : '#94a3b8';

  // Chart geometry
  const N = prevDailySlice ? prevDailySlice.length : 0;
  const thisDaily = N > 0 ? daily.slice(0, N) : [];
  const showChart = N >= 2 && thisDaily.length >= 2;
  let thisPoints = '', lastPoints = '', lastDot = null, baselineY = 0, yMax = 1;
  if (showChart) {
    const thisCum = cumulative(thisDaily);
    const lastCum = cumulative(prevDailySlice);
    yMax = Math.max(...thisCum, ...lastCum, 1);
    baselineY = CHART_H - CHART_PAD_Y;
    const innerW = CHART_W - CHART_PAD_X_L - CHART_PAD_X_R;
    const innerH = CHART_H - 2 * CHART_PAD_Y;
    const xDenom = Math.max(totalDays - 1, 1);
    const px = (i) => CHART_PAD_X_L + (i * innerW) / xDenom;
    const py = (v) => baselineY - (v / yMax) * innerH;
    thisPoints = thisCum.map((v, i) => `${px(i)},${py(v)}`).join(' ');
    lastPoints = lastCum.map((v, i) => `${px(i)},${py(v)}`).join(' ');
    lastDot = { x: px(thisCum.length - 1), y: py(thisCum[thisCum.length - 1]) };
  }

  return (
    <div
      className="rounded-xl p-2.5 flex flex-col h-full"
      style={{
        background: pacePct >= 100
          ? 'rgba(34, 197, 94, 0.07)'
          : pacePct < 50
            ? 'rgba(244, 63, 94, 0.04)'
            : 'rgba(10, 22, 40, 0.85)',
        border: `1px solid ${pacePct >= 100 ? 'rgba(34,197,94,0.25)'
          : pacePct < 50 ? 'rgba(244,63,94,0.2)'
            : 'rgba(26,45,69,0.8)'}`,
        boxShadow: pacePct >= 100 ? '0 0 16px rgba(34,197,94,0.08)'
          : pacePct < 50 ? '0 0 12px rgba(244,63,94,0.06)'
            : 'none',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-1">
        <span className="text-white font-bold text-[13px] leading-tight truncate flex-1">
          {name}
        </span>
        <span
          className="flex-none text-[10px] font-black px-1.5 py-0.5 rounded-md tracking-wider whitespace-nowrap"
          style={badgeStyle(pacePct, color)}
        >
          {pct}%
        </span>
      </div>

      {/* Revenue + inline chart */}
      <div className="mt-1 flex-1 flex items-center gap-3 min-h-0">
        <div className="flex-none min-w-0">
          <div className="font-black text-[22px] leading-none" style={{ color }}>
            {formatINR(actual)}
          </div>
          <div className="text-[#94a3b8] text-[10px] font-medium mt-0.5 whitespace-nowrap">
            of {formatINR(target)} target
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {hasPrev && (
            <div className="flex justify-between items-baseline text-[8px] leading-none mb-1 px-0.5 gap-1">
              <span className="font-medium" style={{ color }}>
                {showChart ? formatINR(yMax) : ''}
              </span>
              <span className="text-white font-semibold tracking-wide truncate">
                {formatINR(actual)} · {formatINR(lastSameDays)} last mo
              </span>
              <span className="text-[#64748b] font-medium whitespace-nowrap">
                Day {N || 0}/{totalDays}
              </span>
            </div>
          )}

          {showChart ? (
            <svg
              width="100%"
              height={CHART_H}
              viewBox={`0 0 ${CHART_W} ${CHART_H}`}
              preserveAspectRatio="none"
              aria-hidden="true"
              style={{ pointerEvents: 'none' }}
            >
              {/* Y-axis */}
              <line
                x1={CHART_PAD_X_L - 2} x2={CHART_PAD_X_L - 2}
                y1={CHART_PAD_Y - 2} y2={baselineY}
                stroke="rgba(148,163,184,0.3)" strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              {/* X-axis baseline */}
              <line
                x1={CHART_PAD_X_L - 2} x2={CHART_W - CHART_PAD_X_R + 2}
                y1={baselineY} y2={baselineY}
                stroke="rgba(148,163,184,0.3)" strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              {/* Mid gridline */}
              <line
                x1={CHART_PAD_X_L} x2={CHART_W - CHART_PAD_X_R}
                y1={(baselineY + CHART_PAD_Y) / 2} y2={(baselineY + CHART_PAD_Y) / 2}
                stroke="rgba(148,163,184,0.08)" strokeWidth="1"
                strokeDasharray="2 3" vectorEffect="non-scaling-stroke"
              />
              {/* Last month — dashed muted */}
              <polyline
                points={lastPoints}
                fill="none"
                stroke="rgba(148,163,184,0.7)"
                strokeWidth="1.4"
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
              {/* This month — solid status color */}
              <polyline
                points={thisPoints}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {lastDot && (
                <circle cx={lastDot.x} cy={lastDot.y} r="2.4" fill={color} />
              )}
            </svg>
          ) : (
            <div className="text-[9px] text-[#64748b] text-center opacity-70 tracking-wider">
              {hasPrev ? 'AWAITING DAY 2' : 'NEW · NO LAST-MO DATA'}
            </div>
          )}
        </div>
      </div>

      {/* Progress bar + status strip */}
      <div className="mt-2">
        <div className="progress-bar-track h-2">
          <div
            className="progress-bar-fill"
            style={{
              width: `${barWidth}%`,
              background: barGradient(pacePct),
              boxShadow: `0 0 8px ${color}50`,
            }}
          />
        </div>
        <div className="flex justify-between items-center mt-1 text-[9px] gap-2">
          {expected > 0 ? (
            <span
              className="font-bold whitespace-nowrap"
              style={{ color: ahead ? '#22c55e' : color }}
            >
              {formatINR(Math.abs(delta))} {ahead ? 'ahead' : 'behind'}
            </span>
          ) : <span />}
          <div className="flex items-center gap-2 whitespace-nowrap">
            {/* Ads data hidden for now. Restoring this also needs the
                `adSpend`/`adRoas`/`adTracked` destructure above and the
                ad-spend fetch in src/data/sheetsApi.js.
            {adSpend !== null && adSpend > 0 ? (
              <>
                <span
                  className="font-black text-[10px] px-2 py-0.5 rounded-md tracking-wider"
                  style={{
                    background: 'rgba(250,204,21,0.18)',
                    color: '#fde047',
                    border: '1px solid rgba(250,204,21,0.55)',
                    textShadow: '0 0 6px rgba(250,204,21,0.45)',
                    boxShadow: '0 0 10px rgba(250,204,21,0.18)',
                  }}
                >
                  AD {formatINR(adSpend)}
                </span>
                <span
                  className="font-black text-[10px] px-2 py-0.5 rounded-md tracking-wider"
                  style={{
                    background: 'rgba(168,85,247,0.18)',
                    color: '#d8b4fe',
                    border: '1px solid rgba(168,85,247,0.55)',
                    textShadow: adRoas !== null && adRoas > 0 ? '0 0 6px rgba(168,85,247,0.45)' : 'none',
                    boxShadow: adRoas !== null && adRoas > 0 ? '0 0 10px rgba(168,85,247,0.18)' : 'none',
                    opacity: adRoas !== null && adRoas > 0 ? 1 : 0.6,
                  }}
                  title="Return on Ad Spend"
                >
                  Ad ROAS : {adRoas !== null && adRoas > 0 ? adRoas.toFixed(1) : '—'}
                </span>
              </>
            ) : adTracked ? (
              <span
                className="font-bold text-[9px] px-1.5 py-0.5 rounded-md tracking-wider"
                style={{
                  background: 'rgba(251,146,60,0.12)',
                  color: '#fb923c',
                  border: '1px solid rgba(251,146,60,0.35)',
                }}
                title="No ad spend data for this month yet"
              >
                AD —
              </span>
            ) : null}
            */}
            <span className="font-bold tracking-wider" style={{ color }}>
              {label}
            </span>
            {vsLastPct !== null && vsLastPct !== undefined ? (
              <span className="font-bold" style={{ color: vsColor }}>
                {vsLastPct > 0 ? '+' : ''}{vsLastPct}%
              </span>
            ) : hasPrev ? null : (
              <span className="font-bold text-[#94a3b8]">NEW</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
