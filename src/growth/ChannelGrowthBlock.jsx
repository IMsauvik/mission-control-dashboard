import { formatINR, formatINRShort, formatPct, formatCr, dirColor, dirArrow } from './format.js';

// One channel's detailed block: compact header (color dot + name + trend + overall verdict),
// a highlighted FY 26-27 target band (if `fy` is supplied), then the 5 MoM chips.
// `channel` = { key, color }, `analysis` = analyzeChannel(...) output,
// `fy` = { achievedCr, targetCr, pct } | null.
// Stretches to fill its slot (flex-1 from the parent) so the right column has no dead space.
// Headline overall-growth color: a distinct Amazon-orange highlight so the big verdict
// number pops out from the green/red month chips (downturns stay rose for clarity).
const OVERALL_HIGHLIGHT = '#ff9900';

export default function ChannelGrowthBlock({ channel, analysis, fy }) {
  const overallColor = analysis.overallDir === 'down' ? dirColor('down') : OVERALL_HIGHLIGHT;
  const c = channel.color;

  return (
    <div className="card-glass rounded-lg px-3 py-1.5 flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-sm" style={{ background: c }} />
        <span className="text-sm lg:text-lg font-black leading-none" style={{ color: c }}>{channel.key}</span>
        <span className="text-[9px] lg:text-[11px] font-semibold text-[#94a3b8] leading-none">
          {formatINR(analysis.first)} → {formatINR(analysis.last)}
        </span>
        <span className="text-base lg:text-2xl font-black ml-auto leading-none" style={{ color: overallColor }}>
          {dirArrow(analysis.overallDir)} {formatPct(analysis.overallPct)}
        </span>
      </div>

      {/* FY 26-27 target band — the highlight */}
      {fy && (
        <div
          className="rounded-md px-2 py-1 mt-1"
          style={{ background: `${c}1f`, border: `1px solid ${c}55` }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[9px] lg:text-[11px] font-black tracking-widest uppercase leading-none" style={{ color: c }}>
              FY 26-27
            </span>
            <span className="ml-auto text-[11px] lg:text-sm font-bold text-white leading-none">
              {formatCr(fy.achievedCr)} <span className="text-[#94a3b8] font-semibold">/ {formatCr(fy.targetCr)}</span>
            </span>
            <span className="text-sm lg:text-lg font-black w-12 text-right leading-none" style={{ color: c }}>
              {Math.round(fy.pct)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden mt-1" style={{ background: 'rgba(15,22,38,0.7)' }}>
            <div className="h-full rounded-full" style={{ width: `${Math.min(100, fy.pct)}%`, background: c }} />
          </div>
        </div>
      )}

      {/* Month-over-month chips */}
      <div className="grid grid-cols-5 gap-1 mt-1">
        {analysis.steps.map((s) => {
          const cc = dirColor(s.dir);
          return (
            <div
              key={s.label}
              className="rounded-md px-1 py-0.5 border text-center"
              style={{ background: `${cc}14`, borderColor: `${cc}3a` }}
            >
              <div className="text-[8px] lg:text-[9px] font-bold text-[#94a3b8] leading-none">{s.label}</div>
              <div className="text-xs lg:text-sm font-black leading-tight" style={{ color: cc }}>
                {s.pct === null ? '—' : formatPct(s.pct)}
              </div>
              <div className="text-[8px] lg:text-[10px] font-semibold leading-none" style={{ color: cc }}>
                {s.abs >= 0 ? '+' : '−'}{formatINRShort(Math.abs(s.abs))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
