import { useMemo } from 'react';
import { CHANNELS } from './growthApi.js';
import { analyzeChannel } from './analysis.js';
import AllChannelsChart from './AllChannelsChart.jsx';
import ChannelGrowthBlock from './ChannelGrowthBlock.jsx';
import VideoCard from '../components/VideoCard.jsx';

// Body of the Channel Growth page. The shared mission-control <Header> is rendered by App;
// this component is just the chart + per-channel stack. Receives the growth data (lifted to
// App so the header can show the month range).
export default function ChannelGrowthPage({ data, loading, error }) {
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

  return (
    <main
      className="relative flex-1 grid grid-cols-1 lg:grid-cols-5 gap-3 min-h-0"
      style={{ animation: 'fadeInUp 0.4s ease-out 120ms both' }}
    >
      <div className="lg:col-span-3 h-[340px] lg:h-auto lg:min-h-0">
        <AllChannelsChart data={view.chartData} />
      </div>
      <div className="lg:col-span-2 flex flex-col gap-2.5 lg:min-h-0">
        {view.blocks.map(({ channel, analysis }) => (
          <ChannelGrowthBlock key={channel.key} channel={channel} analysis={analysis} />
        ))}
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
