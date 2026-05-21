import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { CHANNELS } from './growthApi.js';
import { formatINR, formatINRShort } from './format.js';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  // Highest first, so the tooltip reads top-to-bottom by size.
  const rows = [...payload].sort((a, b) => b.value - a.value);
  return (
    <div className="card-glass rounded-lg p-3 text-xs">
      <div className="font-bold text-white mb-1.5">{label}</div>
      <div className="flex flex-col gap-1">
        {rows.map((p) => (
          <div key={p.name} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
            <span className="text-[#94a3b8] w-16">{p.name}</span>
            <span className="text-white font-semibold ml-auto">{formatINR(p.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// data = [{ month, Amazon, Flipkart, Blinkit, Meesho, Cred }]
export default function AllChannelsChart({ data }) {
  return (
    <div className="card-glass rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <span className="text-[11px] font-bold tracking-widest uppercase text-[#94a3b8]">
          Channel Revenue — All Channels
        </span>
        <div className="flex items-center gap-4 flex-wrap">
          {CHANNELS.map((ch) => (
            <div key={ch.key} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ background: ch.color }} />
              <span className="text-sm sm:text-base font-semibold text-[#cbd5e1]">{ch.key}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,45,69,0.6)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatINRShort}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeOpacity: 0.2 }} />
            {CHANNELS.map((ch) => (
              <Line
                key={ch.key}
                type="monotone"
                dataKey={ch.key}
                name={ch.key}
                stroke={ch.color}
                strokeWidth={2.5}
                dot={{ fill: ch.color, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
