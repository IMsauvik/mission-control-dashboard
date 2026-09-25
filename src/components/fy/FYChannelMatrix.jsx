import { formatINR, formatCompactINR, getPctColor, getPctGradient } from '../../data/salesData.js';
import { FY_ACCENT } from './FYHero.jsx';

const LEGEND = [
  ['#22c55e', '≥100%'],
  ['#38bdf8', '75–99%'],
  ['#fb923c', '50–74%'],
  ['#f43f5e', '<50%'],
];

// Trend of avg revenue/day per month (so a part-done month isn't read as a drop).
function Trend({ values, color }) {
  const pts = values.filter((v) => v !== null);
  if (pts.length < 2) return <span className="text-[9px] text-[#475569]">—</span>;
  const W = 64, H = 16;
  const max = Math.max(...pts, 1);
  const min = Math.min(...pts);
  const span = max - min || 1;
  const coords = pts.map((v, i) => `${((i / (pts.length - 1)) * W).toFixed(1)},${(H - 1 - ((v - min) / span) * (H - 2)).toFixed(1)}`);
  const lastY = coords[coords.length - 1].split(',')[1];
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" style={{ overflow: 'visible' }}>
      <polygon points={`0,${H} ${coords.join(' ')} ${W},${H}`} fill={color} opacity="0.18" />
      <polyline points={coords.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={W} cy={lastY} r="2.5" fill={color} />
    </svg>
  );
}

// Channel × month heatmap. Each cell is that channel's revenue for the month, tinted
// by how it did against its own monthly target (pace-adjusted for the running month).
export default function FYChannelMatrix({ scope, videoSlot }) {
  const { channelData, months, currentMTD } = scope;
  const monthByKey = new Map(months.map((m) => [m.key, m]));
  const channels = [...channelData].sort((a, b) => b.actual - a.actual);
  const topActual = channels[0]?.actual || 1;
  const cols = `minmax(130px,1.4fr) repeat(${months.length}, minmax(52px,1fr)) 80px 72px 88px minmax(90px,1.1fr) 72px`;

  const cellPct = (entry) => {
    const m = monthByKey.get(entry.key);
    const due = m?.partial ? entry.target * (m.daysDone / m.daysInMonth) : entry.target;
    return due > 0 ? (entry.actual / due) * 100 : null;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-2 flex-none">
        <span className="text-[12px] font-bold tracking-widest uppercase text-[#94a3b8]">
          Channel × Month — {scope.currentMonthLabel} ({channels.length} channels)
        </span>
        <div className="flex-1 h-px bg-[#1a2d45]" />
        <div className="flex items-center gap-3 text-[11px] font-bold">
          <span className="text-[#64748b]">Cell = revenue · colour = vs monthly target</span>
          {LEGEND.map(([color, lbl]) => (
            <span key={lbl} className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: color }} />
              <span style={{ color }}>{lbl}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        {/* Opaque panel — the keep-awake video sits behind it (z-index -10) */}
        <div
          className="h-full rounded-xl flex flex-col overflow-hidden"
          style={{ background: '#0a1628', border: '1px solid rgba(167,139,250,0.3)', boxShadow: '0 0 24px rgba(167,139,250,0.08)' }}
        >
          {/* Header row */}
          <div
            className="grid items-center gap-1 px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase text-[#64748b] border-b border-[#1a2d45] flex-none"
            style={{ gridTemplateColumns: cols, background: 'linear-gradient(90deg, rgba(167,139,250,0.14), rgba(34,197,94,0.06) 60%, rgba(245,158,11,0.10))' }}
          >
            <span>Channel</span>
            {months.map((m) => (
              <span key={m.key} className="text-center" style={{ color: m.partial ? FY_ACCENT : undefined }}>
                {m.label}{m.partial ? '·MTD' : ''}
              </span>
            ))}
            <span className="text-right text-[#cbd5e1]">FY Total</span>
            <span className="text-right">Target</span>
            <span className="text-center">Ach · Pace</span>
            <span className="pl-2">Share</span>
            <span className="text-center">Trend</span>
          </div>

          {/* Channel rows */}
          <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
            {channels.map((ch, idx) => {
              const byKey = new Map((ch.monthly || []).map((e) => [e.key, e]));
              const share = currentMTD > 0 ? (ch.actual / currentMTD) * 100 : 0;
              const paceColor = getPctColor(ch.pacePct);
              const trend = months.map((m) => {
                const e = byKey.get(m.key);
                return e && m.daysDone > 0 ? e.actual / m.daysDone : null;
              });
              return (
                <div
                  key={ch.name}
                  className="grid items-center gap-1 px-3 flex-1 min-h-[20px] max-h-[34px] border-b border-[#1a2d45]/60"
                  style={{
                    gridTemplateColumns: cols,
                    background: `linear-gradient(90deg, ${paceColor}${ch.pacePct >= 100 || ch.pacePct < 50 ? '1f' : '14'}, ${idx % 2 ? 'rgba(26,45,69,0.22)' : 'transparent'} 45%)`,
                    boxShadow: `inset 3px 0 0 ${paceColor}`,
                  }}
                >
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[9px] font-bold text-[#64748b] w-4 text-right flex-none">{idx + 1}</span>
                    <span className="text-[12px] font-bold text-white truncate">{ch.name}</span>
                  </span>

                  {months.map((m) => {
                    const e = byKey.get(m.key);
                    if (!e || (e.actual === 0 && e.target === 0)) {
                      return <span key={m.key} className="text-center text-[10px] text-[#334155]">—</span>;
                    }
                    const pct = cellPct(e);
                    const color = pct === null ? '#64748b' : getPctColor(pct);
                    return (
                      <span
                        key={m.key}
                        className="h-[calc(100%-4px)] min-h-[16px] rounded-[4px] flex items-center justify-center text-[12px] font-extrabold"
                        style={{
                          background: pct === null
                            ? `${color}22`
                            : `linear-gradient(180deg, ${color}4d, ${color}1f)`,
                          color: pct === null ? '#94a3b8' : color,
                          boxShadow: `inset 0 0 0 1px ${color}${pct !== null && pct >= 100 ? 'aa' : '77'}`,
                        }}
                        title={`${ch.name} · ${m.label}: ${formatINR(e.actual)} of ${formatINR(e.target)}${pct !== null ? ` (${Math.round(pct)}%${m.partial ? ' of due' : ''})` : ''}`}
                      >
                        {formatCompactINR(e.actual)}
                      </span>
                    );
                  })}

                  <span className="text-right text-[13px] font-black" style={{ color: paceColor }}>
                    {formatINR(ch.actual)}
                  </span>
                  <span className="text-right text-[11px] font-semibold text-[#94a3b8]">
                    {ch.target > 0 ? formatINR(ch.target) : '—'}
                  </span>
                  <span className="flex items-center justify-center gap-1 text-[10px] font-black">
                    <span className="text-[#cbd5e1]">{ch.target > 0 ? `${ch.pct}%` : '—'}</span>
                    <span
                      className="px-1 py-px rounded"
                      style={{ background: `${paceColor}22`, color: paceColor }}
                    >
                      {ch.pacePct >= 999 ? 'NEW' : `${ch.pacePct}%`}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 pl-2">
                    <span className="flex-1 progress-bar-track h-1.5">
                      <span
                        className="block h-full rounded-full"
                        style={{ width: `${(ch.actual / topActual) * 100}%`, background: getPctGradient(ch.pacePct) }}
                      />
                    </span>
                    <span className="text-[10px] font-bold text-[#cbd5e1] w-9 text-right">
                      {share >= 1 ? share.toFixed(0) : share.toFixed(1)}%
                    </span>
                  </span>
                  <span className="flex justify-center">
                    <Trend values={trend} color={paceColor} />
                  </span>
                </div>
              );
            })}
          </div>

          {/* Totals row */}
          <div
            className="grid items-center gap-1 px-3 py-1.5 border-t border-[#a78bfa]/40 flex-none"
            style={{ gridTemplateColumns: cols, background: 'linear-gradient(90deg, rgba(167,139,250,0.18), rgba(245,158,11,0.10))' }}
          >
            <span className="text-[11px] font-black tracking-widest uppercase" style={{ color: FY_ACCENT }}>
              Total
            </span>
            {months.map((m) => (
              <span
                key={m.key}
                className="text-center text-[12px] font-black"
                style={{ color: getPctColor(cellPct(m)) }}
              >
                {formatCompactINR(m.actual)}
              </span>
            ))}
            <span className="text-right text-[14px] font-black text-gradient-green">{formatINR(currentMTD)}</span>
            <span className="text-right text-[11px] font-bold text-[#94a3b8]">{formatINR(scope.currentTarget)}</span>
            <span className="text-center text-[10px] font-black" style={{ color: getPctColor((currentMTD / Math.max(1, scope.currentTarget)) * 100) }}>
              {((currentMTD / Math.max(1, scope.currentTarget)) * 100).toFixed(1)}%
            </span>
            <span className="pl-2 text-[10px] font-bold text-[#cbd5e1]">100%</span>
            <span />
          </div>
        </div>

        {videoSlot && (
          <div
            className="absolute bottom-0 right-0 hidden lg:block"
            style={{
              width: 150,
              height: 84,
              borderRadius: 8,
              overflow: 'hidden',
              opacity: 0.85,
              zIndex: -10,
            }}
          >
            {videoSlot}
          </div>
        )}
      </div>
    </div>
  );
}
