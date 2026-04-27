import ChannelCard from './ChannelCard.jsx';

export default function ChannelGrid({ channelData, currentMonthLabel, daysDone, totalDays }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-2 flex-none">
        <span className="text-[12px] font-bold tracking-widest uppercase text-[#94a3b8]">
          Channel Performance — {currentMonthLabel} MTD (Day {daysDone}/{totalDays})
        </span>
        <div className="flex-1 h-px bg-[#1a2d45]" />
        <div className="flex items-center gap-3 text-[11px] font-bold">
          {[['#22c55e', '≥100% ON FIRE'], ['#38bdf8', '75–99% ON TRACK'], ['#fb923c', '50–74% NEEDS PUSH'], ['#f43f5e', '<50% CRITICAL']].map(([color, lbl]) => (
            <span key={lbl} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />
              <span style={{ color }}>{lbl}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-2 min-h-0">
        {[...channelData].sort((a, b) => b.actual - a.actual).map((ch) => (
          <ChannelCard key={ch.name} channel={ch} />
        ))}
      </div>
    </div>
  );
}
