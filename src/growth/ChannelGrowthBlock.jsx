import { formatINR, formatINRShort, formatPct, dirColor, dirArrow } from './format.js';

// One channel's detailed block: header (color dot + name + overall verdict) + 5 MoM chips.
// `channel` = { key, color }, `analysis` = analyzeChannel(...) output.
// Stretches to fill its slot (flex-1 from the parent) so the right column has no dead space.
export default function ChannelGrowthBlock({ channel, analysis }) {
  const overallColor = dirColor(analysis.overallDir);

  return (
    <div className="card-glass rounded-xl px-4 py-3 flex-1 min-h-0 flex flex-col justify-between">
      {/* Header row */}
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-3.5 h-3.5 rounded" style={{ background: channel.color }} />
          <span className="text-lg font-black text-white">{channel.key}</span>
          <span className="text-2xl font-black ml-auto" style={{ color: overallColor }}>
            {dirArrow(analysis.overallDir)} {formatPct(analysis.overallPct)}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-[#94a3b8]">
          <span className="font-semibold">{formatINR(analysis.first)} → {formatINR(analysis.last)}</span>
          <span className="font-bold" style={{ color: overallColor }}>
            ({analysis.overallAbs >= 0 ? '+' : '−'}{formatINR(Math.abs(analysis.overallAbs))})
          </span>
        </div>
      </div>

      {/* Month-over-month chips */}
      <div className="grid grid-cols-5 gap-2 mt-3">
        {analysis.steps.map((s) => {
          const c = dirColor(s.dir);
          return (
            <div
              key={s.label}
              className="rounded-lg px-2 py-2 border text-center flex flex-col justify-center"
              style={{ background: `${c}14`, borderColor: `${c}3a` }}
            >
              <div className="text-[10px] font-bold text-[#94a3b8] leading-tight">{s.label}</div>
              <div className="text-base font-black leading-tight mt-0.5" style={{ color: c }}>
                {s.pct === null ? '—' : formatPct(s.pct)}
              </div>
              <div className="text-[10px] font-semibold leading-tight" style={{ color: c }}>
                {s.abs >= 0 ? '+' : '−'}{formatINRShort(Math.abs(s.abs))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
