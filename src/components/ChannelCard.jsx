import { formatINR, getPctColor, getPctLabel } from '../data/salesData.js';

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
          : 'rgba(10, 22, 40, 0.85)',
        border: `1px solid ${pct >= 100 ? 'rgba(34,197,94,0.25)' : 'rgba(26,45,69,0.8)'}`,
        boxShadow: pct >= 100 ? '0 0 16px rgba(34,197,94,0.08)' : 'none',
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-1">
        <span className="text-white font-bold text-sm leading-tight truncate flex-1">
          {name}
        </span>
        <span
          className="flex-none text-[9px] font-black px-1.5 py-0.5 rounded-md tracking-wider whitespace-nowrap"
          style={{ background: `${color}18`, color }}
        >
          {pct}%
        </span>
      </div>

      {/* Revenue */}
      <div className="mt-1">
        <div className="font-black text-xl leading-none" style={{ color }}>
          {formatINR(actual)}
        </div>
        <div className="text-[#64748b] text-[10px] font-medium mt-0.5">
          of {formatINR(target)} target
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-1.5">
        <div className="progress-bar-track h-1.5">
          <div
            className="progress-bar-fill"
            style={{
              width: `${barWidth}%`,
              background: pct >= 100
                ? 'linear-gradient(90deg, #16a34a, #22c55e, #4ade80)'
                : pct >= 75
                  ? 'linear-gradient(90deg, #d97706, #f59e0b)'
                  : pct >= 50
                    ? 'linear-gradient(90deg, #ea580c, #f97316)'
                    : 'linear-gradient(90deg, #dc2626, #ef4444)',
              boxShadow: `0 0 6px ${color}40`,
            }}
          />
        </div>
        <div className="flex justify-between mt-0.5 text-[9px]">
          <span style={{ color: `${color}80` }}>{label}</span>
          {pct > 100 && (
            <span className="text-[#22c55e] font-bold">+{(pct - 100)}% OVER</span>
          )}
        </div>
      </div>
    </div>
  );
}
