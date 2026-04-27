import LiveClock from './LiveClock.jsx';
import logo from '../../assets/imeco_logo_white.png';

export default function Header({ currentMonthLabel, daysDone, totalDays }) {
  return (
    <header className="flex-none flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 card-glass border-b border-[#1a2d45]">
      {/* Logo + Brand */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="Imeco" className="h-7 sm:h-8 w-auto" />
        <div className="w-px h-7 bg-[#1a2d45] hidden sm:block" />
        <div className="hidden sm:block">
          <div className="text-[11px] text-[#94a3b8] font-medium uppercase tracking-widest leading-none">
            from the house of Amwoodo
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="text-center order-last sm:order-none w-full sm:w-auto">
        <h1 className="text-white font-black text-base sm:text-lg tracking-[0.2em] uppercase leading-none">
          Mission Control
        </h1>
        <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
          <div className="pulse-dot" />
          <span className="text-[#22c55e] text-[10px] font-bold tracking-widest uppercase">
            Live Dashboard
          </span>
          <div className="w-px h-3 bg-[#1a2d45] hidden sm:block" />
          <span className="text-[#94a3b8] text-[10px] sm:text-[11px] font-medium tracking-widest uppercase">
            {currentMonthLabel} — Day {daysDone} of {totalDays}
          </span>
        </div>
      </div>

      {/* Clock */}
      <LiveClock />
    </header>
  );
}
