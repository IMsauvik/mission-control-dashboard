import { formatINR, getPctColor, getPctLabel } from '../data/salesData.js';

function badgeStyle(pct, color) {
  if (pct >= 100) return { background: 'rgba(34,197,94,0.18)',  color, border: '1px solid rgba(34,197,94,0.35)' };
  if (pct >= 75)  return { background: 'rgba(56,189,248,0.18)', color, border: '1px solid rgba(56,189,248,0.35)' };
  if (pct >= 50)  return { background: 'rgba(251,146,60,0.25)', color, border: '1px solid rgba(251,146,60,0.55)', boxShadow: '0 0 8px rgba(251,146,60,0.3)' };
  return           { background: 'rgba(244,63,94,0.25)',  color, border: '1px solid rgba(244,63,94,0.55)', boxShadow: '0 0 8px rgba(244,63,94,0.35)' };
}

function barGradient(pct) {
  if (pct >= 100) return 'linear-gradient(90deg, #16a34a, #22c55e, #4ade80)';
  if (pct >= 75)  return 'linear-gradient(90deg, #0284c7, #38bdf8)';
  if (pct >= 50)  return 'linear-gradient(90deg, #ea580c, #fb923c)';
  return 'linear-gradient(90deg, #be123c, #f43f5e)';
}

export default function ChannelCard({ channel }) {
  const { name, target, actual, pct } = channel;
  const color = getPctColor(pct);
  const label = getPctLabel(pct);
  const barWidth = Math.min(pct, 100);

  return (
    <div
      className="rounded-xl p-3 flex flex-col justify-between h-full"
      style={{
        background: pct >= 100
          ? 'rgba(34, 197, 94, 0.07)'
          : pct < 50
            ? 'rgba(244, 63, 94, 0.04)'
            : 'rgba(10, 22, 40, 0.85)',
        border: `1px solid ${
          pct >= 100 ? 'rgba(34,197,94,0.25)'
          : pct < 50 ? 'rgba(244,63,94,0.2)'
          : 'rgba(26,45,69,0.8)'}`,
        boxShadow: pct >= 100 ? '0 0 16px rgba(34,197,94,0.08)'
          : pct < 50 ? '0 0 12px rgba(244,63,94,0.06)'
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
          style={badgeStyle(pct, color)}
        >
          {pct}%
        </span>
      </div>

      {/* Revenue */}
      <div className="mt-1">
        <div className="font-black text-[22px] leading-none" style={{ color }}>
          {formatINR(actual)}
        </div>
        <div className="text-[#94a3b8] text-[10px] font-medium mt-0.5">
          of {formatINR(target)} target
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2">
        <div className="progress-bar-track h-2">
          <div
            className="progress-bar-fill"
            style={{
              width: `${barWidth}%`,
              background: barGradient(pct),
              boxShadow: `0 0 8px ${color}50`,
            }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[9px]">
          <span className="font-bold tracking-wider" style={{ color }}>
            {label}
          </span>
          {pct > 100 && (
            <span className="text-[#22c55e] font-bold">+{pct - 100}% OVER</span>
          )}
        </div>
      </div>
    </div>
  );
}
