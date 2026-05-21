import { formatINR, formatINRShort, formatPct, dirColor, dirArrow } from './format.js';

// One channel's detailed block: header (color dot + name + overall verdict) + 5 MoM chips.
// `channel` = { key, color }, `analysis` = analyzeChannel(...) output.
// Stretches to fill its slot (flex-1 from the parent) so the right column has no dead space.
// Headline overall-growth color: a distinct Amazon-orange highlight so the big verdict
// number pops out from the green/red month chips (downturns stay rose for clarity).
const OVERALL_HIGHLIGHT = '#ff9900';

export default function ChannelGrowthBlock({ channel, analysis }) {
  const overallColor = analysis.overallDir === 'down' ? dirColor('down') : OVERALL_HIGHLIGHT;

  return (
    <div className="card-glass rounded-xl px-4 py-3 lg:px-5 lg:py-4 flex-1 min-h-0 flex flex-col justify-between">
      {/* Header row */}
      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="w-3.5 h-3.5 lg:w-4 lg:h-4 rounded" style={{ background: channel.color }} />
          <span className="text-lg lg:text-2xl font-black" style={{ color: channel.color }}>{channel.key}</span>
          <span className="text-2xl lg:text-4xl font-black ml-auto" style={{ color: overallColor }}>
            {dirArrow(analysis.overallDir)} {formatPct(analysis.overallPct)}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs lg:text-sm text-[#94a3b8]">
          <span className="font-semibold">{formatINR(analysis.first)} → {formatINR(analysis.last)}</span>
          <span className="font-bold" style={{ color: overallColor }}>
            ({analysis.overallAbs >= 0 ? '+' : '−'}{formatINR(Math.abs(analysis.overallAbs))})
          </span>
        </div>
      </div>

      {/* Month-over-month chips */}
      <div className="grid grid-cols-5 gap-2 mt-3 lg:mt-4">
        {analysis.steps.map((s) => {
          const c = dirColor(s.dir);
          return (
            <div
              key={s.label}
              className="rounded-lg px-2 py-2 lg:py-3 border text-center flex flex-col justify-center"
              style={{ background: `${c}14`, borderColor: `${c}3a` }}
            >
              <div className="text-[10px] lg:text-xs font-bold text-[#94a3b8] leading-tight">{s.label}</div>
              <div className="text-base lg:text-xl font-black leading-tight mt-0.5" style={{ color: c }}>
                {s.pct === null ? '—' : formatPct(s.pct)}
              </div>
              <div className="text-[10px] lg:text-sm font-semibold leading-tight" style={{ color: c }}>
                {s.abs >= 0 ? '+' : '−'}{formatINRShort(Math.abs(s.abs))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
