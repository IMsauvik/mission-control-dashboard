import LiveClock from './LiveClock.jsx';
import logo from '../../assets/imeco_logo_white.png';

export default function Header({ currentMonthLabel, daysDone, totalDays, view = 'mission', onToggleView, growthRange, onRefresh, syncing = false }) {
  const isGrowth = view === 'growth';

  return (
    <header className="flex-none flex flex-col items-center gap-2 px-4 py-2.5 card-glass border-b border-[#1a2d45] sm:flex-row sm:flex-wrap sm:justify-between">
      {/* Logo + Brand + Nav */}
      <div className="flex items-center gap-3 w-full justify-between sm:w-auto sm:justify-start">
        <button
          type="button"
          onClick={onRefresh}
          disabled={!onRefresh || syncing}
          title="Refresh data from the sheet"
          aria-label="Refresh dashboard data"
          className="shrink-0 rounded-md transition-transform hover:scale-105 active:scale-95 disabled:cursor-wait focus:outline-none focus:ring-2 focus:ring-[#22c55e]/40"
        >
          <img
            src={logo}
            alt="Imeco"
            className={`h-7 sm:h-8 w-auto ${syncing ? 'animate-pulse' : ''}`}
          />
        </button>
        <div className="w-px h-7 bg-[#1a2d45] hidden sm:block" />
        <div className="hidden md:block">
          <div className="text-[11px] text-[#94a3b8] font-medium uppercase tracking-widest leading-none">
            from the house of Amwoodo
          </div>
        </div>
        {onToggleView && (
          <button
            onClick={onToggleView}
            className="ml-1 px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-widest uppercase border border-[#22c55e]/40 bg-[#22c55e]/10 text-[#22c55e] hover:bg-[#22c55e]/20 transition-colors"
          >
            {isGrowth ? '← Mission Control' : 'Channel Growth'}
          </button>
        )}
      </div>

      {/* Title */}
      <div className="text-center w-full sm:w-auto">
        <h1 className="text-white font-black text-base sm:text-lg tracking-[0.2em] uppercase leading-none">
          {isGrowth ? 'Channel Growth' : 'Mission Control'}
        </h1>
        <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
          <div className="pulse-dot" />
          <span className="text-[#22c55e] text-[10px] font-bold tracking-widest uppercase">
            {isGrowth ? '6-Month Trend' : 'Live Dashboard'}
          </span>
          {(isGrowth ? growthRange : true) && (
            <div className="w-px h-3 bg-[#1a2d45] hidden sm:block" />
          )}
          <span className="text-[#94a3b8] text-[10px] sm:text-[11px] font-medium tracking-widest uppercase">
            {isGrowth ? growthRange : `${currentMonthLabel} — Day ${daysDone} of ${totalDays}`}
          </span>
        </div>
      </div>

      {/* Clock */}
      <LiveClock />
    </header>
  );
}
