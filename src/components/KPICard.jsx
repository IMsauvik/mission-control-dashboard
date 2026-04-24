export default function KPICard({ label, value, sub, subColor, accent, icon, badge, badgeColor }) {
  return (
    <div
      className="card-glass rounded-xl p-4 flex flex-col justify-between"
      style={accent ? { borderColor: `${accent}33`, boxShadow: `0 0 20px ${accent}10` } : {}}
    >
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-bold tracking-widest uppercase text-[#64748b]">
          {label}
        </span>
        {badge && (
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md tracking-wide"
            style={{ background: `${badgeColor || '#22c55e'}20`, color: badgeColor || '#22c55e' }}
          >
            {badge}
          </span>
        )}
      </div>

      <div>
        <div
          className="font-black text-3xl leading-none tracking-tight"
          style={{ color: accent || '#f8fafc' }}
        >
          {value}
        </div>
        {sub && (
          <div
            className="text-xs font-medium mt-1.5"
            style={{ color: subColor || '#64748b' }}
          >
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}
