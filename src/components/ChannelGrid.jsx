import { channelData } from '../data/salesData.js';
import ChannelCard from './ChannelCard.jsx';

export default function ChannelGrid() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-2 flex-none">
        <span className="text-[10px] font-bold tracking-widest uppercase text-[#64748b]">
          Channel Performance — April 2026 MTD (Day 23/30)
        </span>
        <div className="flex-1 h-px bg-[#1a2d45]" />
        <div className="flex items-center gap-3 text-[9px] font-bold">
          {[['#22c55e', '≥100% ON FIRE'], ['#f59e0b', '75–99%'], ['#f97316', '50–74%'], ['#ef4444', '<50%']].map(([color, lbl]) => (
            <span key={lbl} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />
              <span style={{ color }}>{lbl}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-2 min-h-0">
        {channelData.map((ch) => (
          <ChannelCard key={ch.name} channel={ch} />
        ))}
      </div>
    </div>
  );
}
