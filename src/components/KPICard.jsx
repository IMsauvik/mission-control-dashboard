export default function KPICard({ label, value, sub, subColor, accent, icon, badge, badgeColor }) {
  return (
    <div
      className="card-glass rounded-xl px-3 py-2 flex flex-col justify-between min-h-[88px] lg:min-h-0"
      style={accent ? { borderColor: `${accent}33`, boxShadow: `0 0 20px ${accent}10` } : {}}
    >
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-bold tracking-widest uppercase text-[#94a3b8]">
          {label}
        </span>
        {badge && (
          <span
            className="text-[9px] font-black px-1.5 py-0.5 rounded-md tracking-wide border"
            style={{
              background: `${badgeColor || '#22c55e'}22`,
              color: badgeColor || '#22c55e',
              borderColor: `${badgeColor || '#22c55e'}44`,
            }}
          >
            {badge}
          </span>
        )}
      </div>

      <div>
        <div
          className="font-black text-[22px] leading-none tracking-tight"
          style={{ color: accent || '#f1f5f9' }}
        >
          {value}
        </div>
        {sub && (
          <div
            className="text-[10px] font-semibold mt-1"
            style={{ color: subColor || '#94a3b8' }}
          >
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}
