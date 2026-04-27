import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatINRShort } from '../data/salesData.js';

const COLORS = [
  '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444',
  '#06b6d4', '#f97316', '#ec4899', '#84cc16', '#14b8a6',
  '#6366f1', '#a78bfa', '#fbbf24', '#34d399',
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="card-glass rounded-lg px-3 py-2 text-xs border border-[#1a2d45] z-50">
      <div className="font-bold text-white leading-tight">{d.name}</div>
      <div className="text-[#22c55e] font-semibold">{formatINRShort(d.actual)}</div>
      <div className="text-[#64748b]">{d.pct}% of total</div>
    </div>
  );
};

export default function ChannelPieChart({ channelData, monthShort }) {
  const total = channelData.reduce((s, c) => s + c.actual, 0);
  if (total === 0) return null;

  // Top 6 channels by actual; rest merged into "Others"
  const sorted = [...channelData].sort((a, b) => b.actual - a.actual);
  const top = sorted.slice(0, 6);
  const rest = sorted.slice(6);
  const othersActual = rest.reduce((s, c) => s + c.actual, 0);

  const slices = top.map(c => ({
    name: c.name,
    actual: c.actual,
    pct: Math.round((c.actual / total) * 100),
  }));
  if (othersActual > 0) {
    slices.push({
      name: 'Others',
      actual: othersActual,
      pct: Math.round((othersActual / total) * 100),
    });
  }

  return (
    <div className="card-glass rounded-xl p-3 h-full flex flex-col">
      <span className="text-[10px] font-bold tracking-widest uppercase text-[#64748b] mb-1 flex-none">
        {monthShort} Sales Mix
      </span>

      <div className="flex flex-1 min-h-0 gap-2 items-center">
        {/* Donut */}
        <div className="flex-none" style={{ width: 100, height: 100 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                cx="50%"
                cy="50%"
                innerRadius={28}
                outerRadius={46}
                paddingAngle={2}
                dataKey="actual"
                strokeWidth={0}
              >
                {slices.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-[3px] flex-1 min-w-0">
          {slices.map((s, i) => (
            <div key={s.name} className="flex items-center gap-1.5 min-w-0">
              <div
                className="flex-none rounded-sm"
                style={{ width: 6, height: 6, background: COLORS[i % COLORS.length] }}
              />
              <span className="text-[9px] text-[#94a3b8] truncate flex-1 leading-tight">
                {s.name}
              </span>
              <span
                className="text-[9px] font-bold flex-none"
                style={{ color: COLORS[i % COLORS.length] }}
              >
                {s.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
