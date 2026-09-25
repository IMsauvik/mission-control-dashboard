import { formatINR, getPctColor, getPctGradient } from '../../data/salesData.js';

const CR = 10000000;
const crLabel = (cr) => `₹${Number(cr.toFixed(2))}Cr`;
export const FY_ACCENT = '#a78bfa';   // violet — marks the FY overview apart from month views
export const FY_GOLD = '#f59e0b';

function Stat({ label, value, sub, color = '#f1f5f9' }) {
  return (
    <div
      className="flex flex-col justify-center min-w-0 px-2.5 rounded-lg leading-tight"
      style={{
        background: `linear-gradient(135deg, ${color}1f, ${color}08)`,
        border: `1px solid ${color}33`,
        boxShadow: `inset 3px 0 0 ${color}`,
      }}
    >
      <span className="text-[9px] font-bold tracking-widest uppercase text-[#64748b] truncate">{label}</span>
      <span className="font-black text-[17px] leading-none my-0.5 tracking-tight truncate" style={{ color }}>
        {value}
      </span>
      {sub && <span className="text-[9px] font-semibold text-[#94a3b8] truncate">{sub}</span>}
    </div>
  );
}

// Annual target track: one segment per FY month, width ∝ that month's target, fill =
// achieved share of it. Targets come from the sheet (each tab's Target row); months
// without a tab yet fall back to the typed plan and are labelled "plan".
function AnnualTrack({ months, fyActual, plan }) {
  const byLabel = new Map(months.map((m) => [m.label, m]));
  const annual = plan.annualCr * CR;
  const knownCrs = plan.monthly.filter((p) => p.cr).map((p) => p.cr);
  const fallbackFlex = knownCrs.length ? knownCrs.reduce((s, v) => s + v, 0) / knownCrs.length : 1;
  const overallPct = (fyActual / annual) * 100;
  const current = months[months.length - 1];

  return (
    <div className="flex flex-col justify-center min-w-0 flex-1 px-4">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[10px] font-bold tracking-widest uppercase text-[#94a3b8]">
          Annual Target · {crLabel(plan.annualCr)}
          {plan.planMonths > 0 && (
            <span className="ml-1.5 normal-case tracking-normal font-semibold text-[#64748b]">
              (sheet {plan.sheetMonths} mo + plan {plan.planMonths} mo)
            </span>
          )}
        </span>
        <span className="text-[11px] font-bold text-[#94a3b8]">
          <span className="font-black text-[15px]" style={{ color: FY_ACCENT }}>{overallPct.toFixed(1)}%</span>
          {' '}of year · {formatINR(Math.max(0, annual - fyActual))} to go
        </span>
      </div>

      <div className="flex gap-[3px] h-[22px]">
        {plan.monthly.map(({ month, cr, source }) => {
          const m = byLabel.get(month);
          const fill = m && m.target > 0 ? Math.min(100, (m.actual / m.target) * 100) : 0;
          const isCurrent = m && current && m.key === current.key;
          const pace = m ? (m.partial
            ? (m.actual / Math.max(1, m.target * (m.daysDone / m.daysInMonth))) * 100
            : (m.actual / Math.max(1, m.target)) * 100) : 0;
          const color = getPctColor(pace);
          return (
            <div
              key={month}
              className="relative rounded-[4px] overflow-hidden"
              style={{
                flex: cr || fallbackFlex,
                background: m ? 'rgba(26,45,69,0.7)' : 'rgba(26,45,69,0.35)',
                border: m ? `1px solid ${color}55` : '1px dashed rgba(100,116,139,0.35)',
                outline: isCurrent ? `1px solid ${FY_ACCENT}` : 'none',
                outlineOffset: 1,
              }}
              title={m
                ? `${month}: ${formatINR(m.actual)} / ${formatINR(m.target)}`
                : cr ? `${month}: ${crLabel(cr)} (${source === 'sheet' ? 'sheet target' : 'typed plan'})` : `${month}: no target yet`}
            >
              <div
                className="absolute inset-y-0 left-0"
                style={{ width: `${fill}%`, background: m ? getPctGradient(pace) : 'none' }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex gap-[3px] mt-1">
        {plan.monthly.map(({ month, cr, source }) => {
          const m = byLabel.get(month);
          const isCurrent = m && current && m.key === current.key;
          return (
            <div key={month} className="text-center leading-none" style={{ flex: cr || fallbackFlex }}>
              <div
                className="text-[9px] font-bold tracking-wide"
                style={{ color: isCurrent ? FY_ACCENT : m ? '#e2e8f0' : '#64748b' }}
              >
                {month.toUpperCase()}{isCurrent ? ' ◂' : ''}
              </div>
              <div className="text-[8px] text-[#64748b] mt-0.5">
                {cr ? crLabel(cr) : '—'}
                {source === 'plan' && <span className="italic text-[#475569]"> plan</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FYHero({ scope, stats }) {
  const { currentMTD, currentTarget, currentMonthLabel, months } = scope;
  const achPct = currentTarget > 0 ? (currentMTD / currentTarget) * 100 : 0;
  const paceColor = getPctColor(stats.pacePct);

  return (
    <div
      className="relative rounded-xl overflow-hidden flex items-stretch h-full"
      style={{
        background: 'linear-gradient(135deg, rgba(167,139,250,0.10), rgba(10,22,40,0.95) 35%, rgba(245,158,11,0.06))',
        border: '1px solid rgba(167,139,250,0.28)',
        boxShadow: '0 0 28px rgba(167,139,250,0.08)',
      }}
    >
      {/* FYTD headline */}
      <div className="flex flex-col justify-center px-4 py-2 flex-none">
        <div className="flex items-center gap-2">
          <span
            className="text-[9px] font-black px-1.5 py-0.5 rounded-md tracking-widest"
            style={{ background: `${FY_ACCENT}22`, color: FY_ACCENT, border: `1px solid ${FY_ACCENT}44` }}
          >
            FY OVERVIEW
          </span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#94a3b8]">
            {currentMonthLabel} · Year to date
          </span>
        </div>
        <div className="flex items-baseline gap-3 mt-1">
          <span className="font-black text-[38px] leading-none tracking-tight text-gradient-green">
            {formatINR(currentMTD)}
          </span>
          <span className="font-black text-[20px] leading-none" style={{ color: getPctColor(achPct) }}>
            {achPct.toFixed(1)}%
          </span>
        </div>
        <div className="text-[10px] font-semibold text-[#94a3b8] mt-1">
          of {formatINR(currentTarget)} target ({months[0]?.label}–{months[months.length - 1]?.label}) ·{' '}
          <span style={{ color: paceColor }}>{stats.pacePct}% of due-to-date</span>
        </div>
      </div>

      <AnnualTrack months={months} fyActual={currentMTD} plan={scope.fyPlan} />

      {/* Stat grid */}
      <div className="grid grid-cols-3 grid-rows-2 gap-1.5 py-2 pr-2 flex-none w-[46%] max-w-[580px]">
        <Stat label="Avg / Day" value={formatINR(stats.avgDaily)} sub={`${stats.daysDone} selling days`} color={FY_ACCENT} />
        <Stat
          label="Best Month"
          value={stats.bestMonth ? formatINR(stats.bestMonth.actual) : '—'}
          sub={stats.bestMonth ? `${stats.bestMonth.label} ${stats.bestMonth.year}` : ''}
          color="#22c55e"
        />
        <Stat
          label="Best Day"
          value={stats.bestDay ? formatINR(stats.bestDay.revenue) : '—'}
          sub={stats.bestDay ? `${stats.bestDay.monthDay} ${stats.bestDay.month}` : ''}
          color={FY_GOLD}
        />
        <Stat
          label="Days On Target"
          value={`${stats.daysOnTarget}/${stats.daysDone}`}
          sub={`${Math.round((stats.daysOnTarget / Math.max(1, stats.daysDone)) * 100)}% hit rate`}
          color="#38bdf8"
        />
        <Stat
          label="FY Run-Rate"
          value={formatINR(stats.runRate)}
          sub={`${Math.round((stats.runRate / Math.max(1, scope.fyPlan.annualCr * CR)) * 100)}% of ${crLabel(scope.fyPlan.annualCr)} target`}
          color={getPctColor((stats.runRate / Math.max(1, scope.fyPlan.annualCr * CR)) * 100)}
        />
        <Stat
          label="Required / Day"
          value={formatINR(stats.requiredDaily)}
          sub={`${stats.daysLeftFY} days left in FY`}
          color="#fb923c"
        />
      </div>
    </div>
  );
}
