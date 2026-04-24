import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import { monthlyData, formatINRShort } from '../data/salesData.js';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-glass rounded-lg p-3 text-xs border border-[#1a2d45]">
      <div className="font-bold text-white mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[#64748b] capitalize">{p.name}:</span>
          <span className="text-white font-semibold">{formatINRShort(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function MonthlyChart() {
  return (
    <div className="card-glass rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold tracking-widest uppercase text-[#64748b]">
          Monthly Revenue Trend
        </span>
        <div className="flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#22c55e]" />
            <span className="text-[#64748b]">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1.5 rounded-sm" style={{ background: 'linear-gradient(90deg, #f59e0b, #fcd34d)', opacity: 0.7 }} />
            <span className="text-[#64748b]">Target</span>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={monthlyData} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={1} />
                <stop offset="100%" stopColor="#16a34a" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,45,69,0.6)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatINRShort}
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(34,197,94,0.05)' }} />
            <Bar dataKey="revenue" name="Revenue" fill="url(#barGrad)" radius={[4, 4, 0, 0]} maxBarSize={52}>
              {monthlyData.map((entry) => (
                <Cell
                  key={entry.month}
                  fill={entry.partial ? 'url(#barGrad)' : 'url(#barGrad)'}
                  opacity={entry.partial ? 0.7 : 1}
                />
              ))}
            </Bar>
            <Line
              dataKey="target"
              name="Target"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={{ fill: '#f59e0b', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
