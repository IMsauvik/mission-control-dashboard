import FYHero from './FYHero.jsx';
import FYCumulativeChart from './FYCumulativeChart.jsx';
import FYMonthTable from './FYMonthTable.jsx';
import FYChannelMatrix from './FYChannelMatrix.jsx';

const CR = 10000000;

// Derived FY-to-date figures shared by the hero strip and the cumulative chart.
function computeFYStats(scope) {
  const { dailyData, months, currentMTD, currentTarget } = scope;

  let cumActual = 0;
  let cumTarget = 0;
  const series = dailyData.map((d) => {
    cumActual += d.revenue;
    cumTarget += d.monthTarget ?? d.target;
    return { ...d, cumActual, cumTarget };
  });

  const daysDone = dailyData.length;
  const bestDay = dailyData.reduce((best, d) => (!best || d.revenue > best.revenue ? d : best), null);
  const bestMonth = months.reduce((best, m) => (!best || m.actual > best.actual ? m : best), null);
  const daysOnTarget = dailyData.filter((d) => d.revenue >= (d.monthTarget ?? d.target)).length;
  const avgDaily = daysDone > 0 ? currentMTD / daysDone : 0;

  // Target due by now: whole target for finished months, pro-rated for the running one
  const dueToDate = months.reduce(
    (s, m) => s + (m.partial ? m.target * (m.daysDone / m.daysInMonth) : m.target),
    0
  );
  const pacePct = dueToDate > 0 ? Math.round((currentMTD / dueToDate) * 100) : 0;

  // FY runs Apr 1 → Mar 31 of the following year
  const fyStartYear = scope.fyPlan.startYear;
  const fyDays = Math.round((new Date(fyStartYear + 1, 3, 1) - new Date(fyStartYear, 3, 1)) / 86400000);
  const elapsed = months.reduce((s, m) => s + (m.partial ? m.daysDone : m.daysInMonth), 0);
  const daysLeftFY = Math.max(0, fyDays - elapsed);
  const annual = scope.fyPlan.annualCr * CR;

  return {
    series,
    daysDone,
    bestDay,
    bestMonth,
    daysOnTarget,
    avgDaily,
    pacePct,
    runRate: avgDaily * fyDays,
    daysLeftFY,
    requiredDaily: daysLeftFY > 0 ? Math.max(0, annual - currentMTD) / daysLeftFY : 0,
    currentTarget,
  };
}

// ALL TIME view — FY-to-date overview with its own layout, distinct from the month views.
export default function FYOverview({ scope, videoSlot }) {
  const stats = computeFYStats(scope);

  return (
    <>
      <div
        className="flex-none lg:h-[112px]"
        style={{ animation: 'fadeInUp 0.4s ease-out 80ms both' }}
      >
        <FYHero scope={scope} stats={stats} />
      </div>

      <div
        className="flex-none grid grid-cols-1 lg:grid-cols-5 gap-2"
        style={{ animation: 'fadeInUp 0.4s ease-out 180ms both' }}
      >
        <div className="lg:col-span-3 h-[240px] lg:h-[250px]">
          <FYCumulativeChart series={stats.series} />
        </div>
        <div className="lg:col-span-2 h-[240px] lg:h-[250px]">
          <FYMonthTable
            months={scope.months}
            fyActual={scope.currentMTD}
            fyTarget={scope.currentTarget}
            daysDone={stats.daysDone}
          />
        </div>
      </div>

      <div
        className="flex-1 min-h-[420px] lg:min-h-0"
        style={{ animation: 'fadeInUp 0.4s ease-out 280ms both' }}
      >
        <FYChannelMatrix scope={scope} videoSlot={videoSlot} />
      </div>
    </>
  );
}
