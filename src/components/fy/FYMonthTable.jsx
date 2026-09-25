import { formatINR, getPctColor, getPctGradient } from '../../data/salesData.js';
import { UP_COLOR, DOWN_COLOR } from '../../growth/format.js';

const COLS = '64px 1fr 1fr 1.3fr 64px 70px';

// Up to this many months the rows use the roomy layout; beyond it (Nov → Mar) they
// switch to a compact layout so all 12 months still fit in the same card.
const ROOMY_MAX = 7;

// Month-by-month scorecard: actual vs target, achievement, growth (daily-average
// based, so a part-done month compares fairly) and average per day.
export default function FYMonthTable({ months, fyActual, fyTarget, daysDone }) {
  const rows = months.map((m, i) => {
    const avg = m.daysDone > 0 ? m.actual / m.daysDone : 0;
    const prev = months[i - 1];
    const prevAvg = prev && prev.daysDone > 0 ? prev.actual / prev.daysDone : null;
    const mom = prevAvg ? ((avg - prevAvg) / prevAvg) * 100 : null;
    const ach = m.target > 0 ? (m.actual / m.target) * 100 : 0;
    // Part-done month: colour by pace against the target due so far, not the full month
    const due = m.partial ? m.target * (m.daysDone / m.daysInMonth) : m.target;
    const pace = due > 0 ? (m.actual / due) * 100 : 0;
    return { ...m, avg, mom, ach, pace };
  });
  const fyAch = fyTarget > 0 ? (fyActual / fyTarget) * 100 : 0;
  const compact = rows.length > ROOMY_MAX;
  const rowText = compact ? 'text-[11px]' : 'text-[12px]';

  return (
    <div
      className={`card-glass rounded-xl h-full flex flex-col ${compact ? 'px-4 py-2.5' : 'p-4'}`}
      style={{ borderColor: 'rgba(56,189,248,0.3)', boxShadow: '0 0 20px rgba(56,189,248,0.08)' }}
    >
      <div className={`flex items-center justify-between ${compact ? 'mb-1' : 'mb-2'}`}>
        <span className="text-[11px] font-bold tracking-widest uppercase text-[#94a3b8]">
          Month Scorecard
        </span>
        <span className="text-[10px] text-[#64748b]">Growth = avg/day vs previous month</span>
      </div>

      <div
        className="grid text-[9px] font-bold tracking-widest uppercase text-[#64748b] pb-1 border-b border-[#1a2d45]"
        style={{ gridTemplateColumns: COLS }}
      >
        <span>Month</span>
        <span className="text-right">Actual</span>
        <span className="text-right">Target</span>
        <span className="pl-3">Achieved</span>
        <span className="text-right">Growth</span>
        <span className="text-right">Avg/Day</span>
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {rows.map((r) => {
          const color = getPctColor(r.pace);
          return (
            <div
              key={r.key}
              className={`grid items-center flex-1 min-h-0 ${rowText} leading-none border-b border-[#1a2d45]/50`}
              style={{
                gridTemplateColumns: COLS,
                background: `linear-gradient(90deg, ${color}14, transparent 40%)`,
                boxShadow: `inset 3px 0 0 ${color}`,
              }}
            >
              <span className="font-bold text-white pl-2 whitespace-nowrap">
                {r.label}
                {r.partial && <span className="ml-1 text-[8px] font-black text-[#a78bfa]">MTD</span>}
              </span>
              <span className="text-right font-black" style={{ color }}>{formatINR(r.actual)}</span>
              <span className="text-right font-semibold text-[#94a3b8]">{formatINR(r.target)}</span>
              <span className="flex items-center gap-1.5 pl-3">
                <span className={`flex-1 progress-bar-track ${compact ? 'h-1.5' : 'h-2'}`}>
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${Math.min(100, r.ach)}%`, background: getPctGradient(r.pace) }}
                  />
                </span>
                <span className="text-[10px] font-black w-8 text-right" style={{ color }}>
                  {Math.round(r.ach)}%
                </span>
              </span>
              <span
                className="text-right text-[11px] font-black"
                style={{ color: r.mom === null ? '#475569' : r.mom >= 0 ? UP_COLOR : DOWN_COLOR }}
              >
                {r.mom === null ? '—' : `${r.mom >= 0 ? '▲' : '▼'}${Math.abs(Math.round(r.mom))}%`}
              </span>
              <span className="text-right font-semibold text-[#cbd5e1]">{formatINR(r.avg)}</span>
            </div>
          );
        })}

        {/* FY total */}
        <div
          className={`grid items-center ${compact ? 'min-h-[18px]' : 'min-h-[22px] mt-1'} text-[12px] pt-1 border-t border-[#a78bfa]/40 flex-none`}
          style={{ gridTemplateColumns: COLS }}
        >
          <span className="font-black text-[#a78bfa] pl-2">FYTD</span>
          <span className="text-right font-black text-[13px] text-gradient-green">{formatINR(fyActual)}</span>
          <span className="text-right font-bold text-[#94a3b8]">{formatINR(fyTarget)}</span>
          <span className="pl-3 text-[11px] font-black" style={{ color: getPctColor(fyAch) }}>
            {fyAch.toFixed(1)}%
          </span>
          <span />
          <span className="text-right font-bold text-[#cbd5e1]">
            {formatINR(daysDone > 0 ? fyActual / daysDone : 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
