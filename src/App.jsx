import Header from './components/Header.jsx';
import KPICard from './components/KPICard.jsx';
import AchievementCard from './components/AchievementCard.jsx';
import MRRGauge from './components/MRRGauge.jsx';
import MonthlyChart from './components/MonthlyChart.jsx';
import DailyChart from './components/DailyChart.jsx';
import ChannelGrid from './components/ChannelGrid.jsx';
import ChannelPieChart from './components/ChannelPieChart.jsx';
import VideoCard from './components/VideoCard.jsx';
import { useSalesData } from './hooks/useSalesData.js';
import { useKioskMode } from './hooks/useKioskMode.js';
import { formatINR } from './data/salesData.js';

export default function App() {
  const { data, syncing, error } = useSalesData();
  useKioskMode();

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-imeco-bg">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-[#94a3b8] text-sm font-medium tracking-widest uppercase">
            Loading dashboard…
          </div>
        </div>
      </div>
    );
  }

  const {
    currentMTD, currentTarget, daysDone, totalDays, dailyTarget,
    monthlyData, channelData, dailyData,
    currentMonthLabel,
  } = data;

  const achievement  = ((currentMTD / currentTarget) * 100).toFixed(1);
  const daysLeft     = totalDays - daysDone;
  const dailyAvg     = daysDone > 0 ? Math.round(currentMTD / daysDone) : 0;
  const projectedMTD = dailyAvg * totalDays;
  const monthShort   = currentMonthLabel.split(' ')[0];

  return (
    <div
      className="min-h-screen lg:h-screen flex flex-col bg-imeco-bg bg-grid overflow-y-auto lg:overflow-hidden"
      style={{ gap: '8px', padding: '8px' }}
    >
      {/* Status badges */}
      {error && (
        <div className="fixed top-2 right-2 z-50 text-[9px] bg-red-900/80 text-red-300 px-2 py-1 rounded-md border border-red-800/50">
          ⚠ Using cached data
        </div>
      )}
      {syncing && !error && (
        <div className="fixed top-2 right-2 z-50 text-[9px] bg-[#1a2d45]/80 text-[#64748b] px-2 py-1 rounded-md">
          ↻ Syncing…
        </div>
      )}

      {/* Header */}
      <div style={{ animation: 'fadeInUp 0.4s ease-out 0ms both' }}>
        <Header currentMonthLabel={currentMonthLabel} daysDone={daysDone} totalDays={totalDays} />
      </div>

      {/* KPI Row */}
      <div
        className="flex-none grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 lg:h-[152px]"
        style={{ animation: 'fadeInUp 0.4s ease-out 80ms both' }}
      >
        <KPICard
          label="MTD Revenue"
          value={formatINR(currentMTD)}
          sub={`${daysLeft} days remaining`}
          badge={currentMonthLabel.toUpperCase()}
          badgeColor="#22c55e"
          accent="#22c55e"
        />
        <KPICard
          label="Monthly Target"
          value={formatINR(currentTarget)}
          sub={`Daily need: ${formatINR(dailyTarget)}`}
          badge="TARGET"
          badgeColor="#f59e0b"
        />
        <AchievementCard
          achievement={`${achievement}%`}
          daysDone={daysDone}
          totalDays={totalDays}
          dailyData={dailyData}
          currentTarget={currentTarget}
        />
        <KPICard
          label="Daily Avg Pace"
          value={formatINR(dailyAvg)}
          sub={`Need ${formatINR(Math.max(0, dailyTarget - dailyAvg))} more/day`}
          badge="PACE"
          badgeColor={dailyAvg >= dailyTarget ? '#22c55e' : '#fb923c'}
          accent={dailyAvg >= dailyTarget ? '#22c55e' : '#f1f5f9'}
        />
        <KPICard
          label={`${monthShort} Projection`}
          value={formatINR(projectedMTD)}
          sub={`vs ${formatINR(currentTarget)} target`}
          badge={projectedMTD >= currentTarget ? 'WILL HIT' : 'SHORTFALL'}
          badgeColor={projectedMTD >= currentTarget ? '#22c55e' : '#ef4444'}
        />
      </div>

      {/* Charts Row — DailyChart gets 2 cols, VideoCard removed (now floating) */}
      <div
        className="flex-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2"
        style={{ animation: 'fadeInUp 0.4s ease-out 180ms both' }}
      >
        <div className="col-span-1 sm:col-span-2 lg:col-span-3 h-[220px] lg:h-[260px]">
          <MonthlyChart monthlyData={monthlyData} />
        </div>
        <div className="col-span-1 sm:col-span-2 lg:col-span-2 h-[220px] lg:h-[260px]">
          <DailyChart
            dailyData={dailyData}
            dailyTarget={dailyTarget}
            monthShort={monthShort}
            daysDone={daysDone}
          />
        </div>
        <div className="col-span-1 h-[200px] lg:h-[260px]">
          <ChannelPieChart channelData={channelData} monthShort={monthShort} />
        </div>
        <div className="col-span-1 h-[200px] lg:h-[260px]">
          <MRRGauge mrrGoal={currentTarget} currentMRR={currentMTD} />
        </div>
      </div>

      {/* Channel Grid */}
      <div
        className="flex-1 min-h-0 lg:min-h-0"
        style={{ animation: 'fadeInUp 0.4s ease-out 280ms both' }}
      >
        <ChannelGrid
          channelData={channelData}
          currentMonthLabel={currentMonthLabel}
          daysDone={daysDone}
          totalDays={totalDays}
          videoSlot={<VideoCard />}
        />
      </div>
    </div>
  );
}
