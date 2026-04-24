import Header from './components/Header.jsx';
import KPICard from './components/KPICard.jsx';
import MRRGauge from './components/MRRGauge.jsx';
import MonthlyChart from './components/MonthlyChart.jsx';
import DailyChart from './components/DailyChart.jsx';
import ChannelGrid from './components/ChannelGrid.jsx';
import {
  APRIL_MTD, APRIL_TARGET, APRIL_DAYS_DONE, APRIL_TOTAL_DAYS,
  formatINR,
} from './data/salesData.js';

const achievement = ((APRIL_MTD / APRIL_TARGET) * 100).toFixed(1);
const daysLeft = APRIL_TOTAL_DAYS - APRIL_DAYS_DONE;
const dailyAvg = Math.round(APRIL_MTD / APRIL_DAYS_DONE);
const dailyTarget = Math.round(APRIL_TARGET / APRIL_TOTAL_DAYS);
const projectedMTD = dailyAvg * APRIL_TOTAL_DAYS;

export default function App() {
  return (
    <div className="h-screen flex flex-col bg-imeco-bg bg-grid overflow-hidden" style={{ gap: '8px', padding: '8px' }}>
      {/* Header */}
      <Header />

      {/* KPI Row */}
      <div className="flex-none grid grid-cols-5 gap-2" style={{ height: '152px' }}>
        <KPICard
          label="MTD Revenue"
          value={formatINR(APRIL_MTD)}
          sub={`${daysLeft} days remaining`}
          badge="APRIL 2026"
          badgeColor="#22c55e"
          accent="#22c55e"
        />
        <KPICard
          label="Monthly Target"
          value={formatINR(APRIL_TARGET)}
          sub={`Daily need: ${formatINR(dailyTarget)}`}
          badge="TARGET"
          badgeColor="#f59e0b"
        />
        <KPICard
          label="Achievement"
          value={`${achievement}%`}
          sub={`${APRIL_DAYS_DONE}/${APRIL_TOTAL_DAYS} days done`}
          badge={parseFloat(achievement) >= 80 ? 'ON TRACK' : 'NEEDS PUSH'}
          badgeColor={parseFloat(achievement) >= 80 ? '#22c55e' : '#f97316'}
          accent={parseFloat(achievement) >= 80 ? '#22c55e' : '#f97316'}
        />
        <KPICard
          label="Daily Avg Pace"
          value={formatINR(dailyAvg)}
          sub={`Need ${formatINR(dailyTarget - dailyAvg)} more/day`}
          badge="PACE"
          badgeColor={dailyAvg >= dailyTarget ? '#22c55e' : '#ef4444'}
          accent={dailyAvg >= dailyTarget ? '#22c55e' : '#f8fafc'}
        />
        <KPICard
          label="Apr Projection"
          value={formatINR(projectedMTD)}
          sub={`vs ${formatINR(APRIL_TARGET)} target`}
          badge={projectedMTD >= APRIL_TARGET ? 'WILL HIT' : 'SHORTFALL'}
          badgeColor={projectedMTD >= APRIL_TARGET ? '#22c55e' : '#ef4444'}
        />
      </div>

      {/* Charts Row */}
      <div className="flex-none grid grid-cols-5 gap-2" style={{ height: '230px' }}>
        <div className="col-span-3">
          <MonthlyChart />
        </div>
        <div className="col-span-1">
          <DailyChart />
        </div>
        <div className="col-span-1">
          <MRRGauge />
        </div>
      </div>

      {/* Channel Grid */}
      <div className="flex-1 min-h-0">
        <ChannelGrid />
      </div>
    </div>
  );
}
