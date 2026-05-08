function Sparkline({ values, color }) {
  if (!values || values.length < 2) return null;
  const W = 200, H = 26;
  const max = Math.max(...values, 100);
  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * W,
    y: H - (v / max) * (H - 2) - 1,
  }));
  const polyline = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = [
    `M ${pts[0].x.toFixed(1)},${H}`,
    ...pts.map(p => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`),
    `L ${pts[pts.length - 1].x.toFixed(1)},${H} Z`,
  ].join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparkFill)" />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Target pace line (diagonal from 0 to 100%) */}
      <line
        x1="0" y1={H - 1} x2={W} y2="1"
        stroke={color} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.35"
      />
    </svg>
  );
}

export default function AchievementCard({ achievement, daysDone, totalDays, dailyData, currentTarget }) {
  // Cumulative achievement % per day
  const sparkline = dailyData.map((_, i) => {
    const cum = dailyData.slice(0, i + 1).reduce((s, d) => s + d.revenue, 0);
    return currentTarget > 0 ? (cum / currentTarget) * 100 : 0;
  });

  // Today's contribution vs ideal daily pace
  const lastRevenue = dailyData.length > 0 ? dailyData[dailyData.length - 1].revenue : 0;
  const todayDeltaPct = currentTarget > 0 ? (lastRevenue / currentTarget) * 100 : 0;
  const idealDailyPct = 100 / totalDays;
  const trendUp = todayDeltaPct >= idealDailyPct * 0.85;
  const trendColor = trendUp ? '#22c55e' : '#f97316';
  const trendArrow = trendUp ? '↑' : '↓';

  const pct = parseFloat(achievement);
  const accentColor = pct >= 100 ? '#22c55e' : pct >= 75 ? '#38bdf8' : '#fb923c';
  const badgeLabel = pct >= 100 ? 'ON FIRE' : pct >= 75 ? 'ON TRACK' : 'NEEDS PUSH';

  return (
    <div
      className="card-glass rounded-xl px-3 py-2 flex flex-col justify-between overflow-hidden min-h-[88px] lg:min-h-0"
      style={{ borderColor: `${accentColor}33`, boxShadow: `0 0 20px ${accentColor}10` }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-bold tracking-widest uppercase text-[#64748b]">
          Achievement
        </span>
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-md tracking-wide"
          style={{ background: `${accentColor}20`, color: accentColor }}
        >
          {badgeLabel}
        </span>
      </div>

      {/* Value + sub */}
      <div>
        <div className="font-black text-[22px] leading-none tracking-tight" style={{ color: accentColor }}>
          {achievement}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-medium text-[#64748b]">
            {daysDone}/{totalDays} days done
          </span>
          <span className="text-[10px] font-bold" style={{ color: trendColor }}>
            {trendArrow} {todayDeltaPct.toFixed(1)}% today
          </span>
        </div>
      </div>

      {/* Sparkline */}
      <div className="mt-0.5 -mx-1">
        <Sparkline values={sparkline} color={accentColor} />
      </div>
    </div>
  );
}
