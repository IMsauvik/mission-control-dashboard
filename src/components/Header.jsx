import LiveClock from './LiveClock.jsx';
import logo from '../../assets/imeco_logo_white.png';

export default function Header({ currentMonthLabel, daysDone, totalDays }) {
  return (
    <header className="flex-none flex items-center justify-between px-5 py-2.5 card-glass border-b border-[#1a2d45]">
      {/* Logo + Brand */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="Imeco" className="h-8 w-auto" />
        <div className="w-px h-8 bg-[#1a2d45]" />
        <div>
          <div className="text-[10px] text-[#64748b] font-medium uppercase tracking-widest leading-none">
            from the house of Amwoodo
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center">
        <h1 className="text-white font-black text-lg tracking-[0.2em] uppercase leading-none">
          Mission Control
        </h1>
        <div className="flex items-center justify-center gap-2 mt-1">
          <div className="pulse-dot" />
          <span className="text-[#22c55e] text-[10px] font-bold tracking-widest uppercase">
            Live Dashboard
          </span>
          <div className="w-px h-3 bg-[#1a2d45]" />
          <span className="text-[#64748b] text-[10px] font-medium tracking-widest uppercase">
            {currentMonthLabel} — Day {daysDone} of {totalDays}
          </span>
        </div>
      </div>

      {/* Clock */}
      <LiveClock />
    </header>
  );
}
