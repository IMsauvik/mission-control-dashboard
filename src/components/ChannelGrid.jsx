import ChannelCard from './ChannelCard.jsx';

export default function ChannelGrid({ channelData, currentMonthLabel, daysDone, totalDays, videoSlot }) {
  const sorted = [...channelData].sort((a, b) => b.actual - a.actual);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-2 flex-none">
        <span className="text-[12px] font-bold tracking-widest uppercase text-[#94a3b8]">
          Channel Performance — {currentMonthLabel} MTD (Day {daysDone}/{totalDays})
        </span>
        <div className="flex-1 h-px bg-[#1a2d45]" />
        <div className="flex items-center gap-3 text-[11px] font-bold">
          {[
            ['#22c55e', '≥100% ON FIRE'],
            ['#38bdf8', '75–99% ON TRACK'],
            ['#fb923c', '50–74% NEEDS PUSH'],
            ['#f43f5e', '<50% CRITICAL'],
          ].map(([color, lbl]) => (
            <span key={lbl} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />
              <span style={{ color }}>{lbl}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Grid is relative so the video can be absolutely positioned inside it */}
      <div
        className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 min-h-0 relative"
        style={{ gridAutoRows: '1fr' }}
      >
        {sorted.map((ch) => (
          <ChannelCard key={ch.name} channel={ch} totalDays={totalDays} />
        ))}

        {/* Floating video — sits over the empty 3-column space in the last row */}
        {videoSlot && (
          <div
            className="absolute bottom-0 right-0 hidden lg:block"
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
            {videoSlot}
          </div>
        )}
      </div>
    </div>
  );
}
