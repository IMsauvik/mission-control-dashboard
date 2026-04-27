import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { formatINRShort } from '../data/salesData.js';

const CustomTooltip = ({ active, payload, label, dailyTarget, monthShort }) => {
  if (!active || !payload?.length) return null;
  const rev = payload.find(p => p.dataKey === 'revenue')?.value ?? 0;
  const above = rev >= dailyTarget;
  return (
    <div className="card-glass rounded-lg p-2.5 text-xs border border-[#1a2d45]">
      <div className="font-bold text-white mb-1">{monthShort} {label}</div>
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full" style={{ background: above ? '#22c55e' : '#f97316' }} />
        <span className="text-[#64748b]">Sales:</span>
        <span className="font-semibold" style={{ color: above ? '#22c55e' : '#f97316' }}>
          {formatINRShort(rev)}
        </span>
      </div>
    </div>
  );
};

export default function DailyChart({ dailyData, dailyTarget, monthShort }) {
  return (
    <div className="card-glass rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold tracking-widest uppercase text-[#94a3b8]">
          {monthShort} Daily Sales
        </span>
        <span className="text-[11px] text-[#94a3b8]">
          Target: <span className="text-[#f59e0b] font-semibold">{formatINRShort(dailyTarget)}/day</span>
        </span>
      </div>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dailyData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,45,69,0.6)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={3}
            />
            <YAxis
              tickFormatter={formatINRShort}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={46}
            />
            <Tooltip
              content={(props) => (
                <CustomTooltip {...props} dailyTarget={dailyTarget} monthShort={monthShort} />
              )}
              cursor={{ stroke: 'rgba(34,197,94,0.2)', strokeWidth: 1 }}
            />
            <ReferenceLine
              y={dailyTarget}
              stroke="#f59e0b"
              strokeDasharray="4 3"
              strokeWidth={1.5}
              strokeOpacity={0.7}
            />
            <Area
              dataKey="revenue"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#areaGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
