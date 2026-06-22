import { useMemo } from 'react';
import { CHANNELS } from './growthApi.js';
import { analyzeChannel } from './analysis.js';
import { useFYData } from './useFYData.js';
import { FY_ANNUAL_TARGET_CR, FY_MONTHLY_TARGETS, FY_CHANNEL_TARGETS } from './fyTargets.js';
import { formatCr, formatPct, UP_COLOR, DOWN_COLOR } from './format.js';
import AllChannelsChart from './AllChannelsChart.jsx';
import MonthlyTargetChart from './MonthlyTargetChart.jsx';
import ChannelGrowthBlock from './ChannelGrowthBlock.jsx';
import OthersFYCard from './OthersFYCard.jsx';
import VideoCard from '../components/VideoCard.jsx';

function KpiTile({ label, value, valueColor = '#f1f5f9', sub }) {
  return (
    <div className="card-glass rounded-lg px-3 py-1 flex items-center gap-2.5">
      <span className="text-[9px] lg:text-[10px] font-bold tracking-widest uppercase text-[#94a3b8] leading-none shrink-0">
        {label}
      </span>
      <span className="text-base lg:text-xl font-black leading-none ml-auto" style={{ color: valueColor }}>
        {value}
      </span>
      {sub && <span className="text-[9px] lg:text-[10px] text-[#64748b] font-semibold leading-none shrink-0 w-[72px] lg:w-[88px] text-right">{sub}</span>}
    </div>
  );
}

// Body of the Channel Growth page. The shared mission-control <Header> is rendered by App.
// One screen, no sub-tabs: a top FY-target KPI strip, the 6-month trend line chart with the
// FY monthly target-vs-achieved chart stacked beneath it, and the per-channel cards (each with
// an FY 26-27 target progress bar). Trend data is lifted from App; FY data is fetched here.
export default function ChannelGrowthPage({ data, loading, error }) {
  const { data: fy } = useFYData();

  const view = useMemo(() => {
    if (!data) return null;
    const chartData = data.months.map((month, i) => {
      const row = { month };
      for (const ch of CHANNELS) row[ch.key] = data.series[ch.key]?.[i] ?? 0;
      return row;
    });
    const blocks = CHANNELS.map((ch) => ({
      channel: ch,
      analysis: analyzeChannel(data.months, data.series[ch.key] || []),
    }))
      // Highest overall growth at the top, lowest at the bottom (nulls last).
      .sort((a, b) => (b.analysis.overallPct ?? -Infinity) - (a.analysis.overallPct ?? -Infinity));
    return { chartData, blocks };
  }, [data]);

  // FY target progress per channel + annual KPI roll-up (live achieved, hardcoded targets).
  const fyView = useMemo(() => {
    if (!fy) return null;
    const byChannel = {};
    for (const ch of CHANNELS) {
      const targetCr = FY_CHANNEL_TARGETS[ch.key] ?? 0;
      const achievedCr = fy.channelAchievedCr?.[ch.key] ?? 0;
      byChannel[ch.key] = {
        achievedCr,
        targetCr,
        pct: targetCr > 0 ? (achievedCr / targetCr) * 100 : 0,
      };
    }
    const othersTarget = FY_CHANNEL_TARGETS.Others ?? 0;
    const othersAchieved = fy.channelAchievedCr?.Others ?? 0;
    const others = {
      achievedCr: othersAchieved,
      targetCr: othersTarget,
      pct: othersTarget > 0 ? (othersAchieved / othersTarget) * 100 : 0,
    };
    const targetByMonth = Object.fromEntries(FY_MONTHLY_TARGETS.map((m) => [m.month, m.cr]));
    const ytdTarget = (fy.monthly || []).reduce((s, m) => s + (targetByMonth[m.month] ?? 0), 0);
    const achieved = fy.totalAchievedCr || 0;
    return {
      byChannel,
      others,
      othersChannels: fy.othersChannels || [],
      ytdTarget,
      achieved,
      shortfall: ytdTarget - achieved,
      attainPct: ytdTarget > 0 ? (achieved / ytdTarget) * 100 : null,
    };
  }, [fy]);

  if (!view) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-0">
        {error ? (
          <div className="card-glass rounded-xl p-6 max-w-md text-center">
            <div className="text-red-400 text-sm font-bold mb-2">Couldn't load channel growth</div>
            <div className="text-[#94a3b8] text-xs break-words">{error}</div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-[#94a3b8] text-sm font-medium tracking-widest uppercase">
              {loading ? 'Loading channel growth…' : 'No data'}
            </div>
          </div>
        )}
      </div>
    );
  }

  const attainColor = !fyView || fyView.attainPct == null
    ? '#f1f5f9'
    : fyView.attainPct >= 100 ? UP_COLOR : DOWN_COLOR;

  return (
    <main
      className="relative flex-1 flex flex-col gap-2 min-h-0"
      style={{ animation: 'fadeInUp 0.4s ease-out 120ms both' }}
    >
      {/* FY 26-27 annual KPI strip */}
      {fyView && (
        <div className="flex-none grid grid-cols-2 lg:grid-cols-4 gap-2">
          <KpiTile label="FY 26-27 Target" value={formatCr(FY_ANNUAL_TARGET_CR)} sub="Apr '26 — Mar '27" />
          <KpiTile label="Achieved YTD" value={formatCr(fyView.achieved)} valueColor={UP_COLOR} sub={`of ${formatCr(fyView.ytdTarget)} due`} />
          <KpiTile label="Shortfall YTD" value={formatCr(fyView.shortfall)} valueColor={fyView.shortfall > 0 ? DOWN_COLOR : UP_COLOR} sub="target due − achieved" />
          <KpiTile label="Attainment" value={formatPct(fyView.attainPct)} valueColor={attainColor} sub="vs YTD target" />
        </div>
      )}

      {/* Main grid: left = trend chart + FY monthly pacing; right = channel cards */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="flex flex-col gap-3 lg:min-h-0">
          <div className="h-[280px] lg:h-auto lg:flex-[3] lg:min-h-0">
            <AllChannelsChart data={view.chartData} />
          </div>
          <div className="h-[220px] lg:h-auto lg:flex-[2] lg:min-h-0">
            <MonthlyTargetChart monthly={fy?.monthly} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5 lg:min-h-0">
          {view.blocks.map(({ channel, analysis }) => (
            <ChannelGrowthBlock
              key={channel.key}
              channel={channel}
              analysis={analysis}
              fy={fyView?.byChannel[channel.key]}
            />
          ))}
          {fyView && (
            <OthersFYCard fy={fyView.others} channels={fyView.othersChannels} />
          )}
        </div>
      </div>

      {/* Tiny floating video — keeps the TV awake (no input = sleep mode) */}
      <div
        className="absolute bottom-1 right-1 hidden lg:block"
        style={{
          width: 150,
          height: 84,
          borderRadius: 8,
          overflow: 'hidden',
          border: '1px solid rgba(34,197,94,0.2)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          opacity: 0.85,
          zIndex: -10,
        }}
      >
        <VideoCard />
      </div>
    </main>
  );
}
