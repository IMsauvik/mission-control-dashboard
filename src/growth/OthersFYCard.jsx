import { formatCr } from './format.js';
import { OTHERS_COLOR } from './fyTargets.js';

// Compact FY-only card for "Others" = every marketplace beyond the 5 named channels.
// There is no 6-month trend series for Others, so this card shows just the FY 26-27 target band
// plus the list of contributing marketplaces. `fy` = { achievedCr, targetCr, pct }.
export default function OthersFYCard({ fy, channels }) {
  if (!fy) return null;
  const c = OTHERS_COLOR;
  const list = (channels || []).join(' · ');

  return (
    <div className="card-glass rounded-lg px-3 py-1.5 flex-none">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-sm" style={{ background: c }} />
        <span className="text-sm lg:text-lg font-black leading-none text-[#cbd5e1]">Others</span>
        {list && (
          <span className="text-[9px] lg:text-[11px] font-semibold text-[#64748b] leading-none truncate">{list}</span>
        )}
      </div>

      <div className="rounded-md px-2 py-1 mt-1" style={{ background: `${c}22`, border: `1px solid ${c}55` }}>
        <div className="flex items-center gap-2">
          <span className="text-[9px] lg:text-[11px] font-black tracking-widest uppercase leading-none text-[#94a3b8]">
            FY 26-27
          </span>
          <span className="ml-auto text-[11px] lg:text-sm font-bold text-white leading-none">
            {formatCr(fy.achievedCr)} <span className="text-[#94a3b8] font-semibold">/ {formatCr(fy.targetCr)}</span>
          </span>
          <span className="text-sm lg:text-lg font-black w-12 text-right leading-none text-[#cbd5e1]">
            {Math.round(fy.pct)}%
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden mt-1" style={{ background: 'rgba(15,22,38,0.7)' }}>
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, fy.pct)}%`, background: c }} />
        </div>
      </div>
    </div>
  );
}
