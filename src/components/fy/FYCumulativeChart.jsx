import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { formatINR, formatINRShort } from '../../data/salesData.js';
import { FY_GOLD } from './FYHero.jsx';

const ACTUAL = '#22c55e';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const gap = d.cumActual - d.cumTarget;
  return (
    <div className="card-glass rounded-lg p-3 text-xs border border-[#1a2d45]">
      <div className="font-bold text-white mb-1">{d.monthDay} {d.month} · Day {d.day}</div>
      <div className="text-[#94a3b8]">Cumulative: <span className="text-white font-semibold">{formatINR(d.cumActual)}</span></div>
      <div className="text-[#94a3b8]">Target: <span className="text-white font-semibold">{formatINR(d.cumTarget)}</span></div>
      <div className="font-bold" style={{ color: gap >= 0 ? '#22c55e' : '#f43f5e' }}>
        {gap >= 0 ? 'Ahead' : 'Behind'} {formatINR(Math.abs(gap))}
      </div>
    </div>
  );
};

// Running FY revenue vs running target, day by day. Month boundaries are marked so
// the reader can see in which months the gap opened up or closed.
export default function FYCumulativeChart({ series }) {
  const monthStarts = series.filter((d, i) => i === 0 || d.month !== series[i - 1].month);
  const last = series[series.length - 1];
  const gap = last ? last.cumActual - last.cumTarget : 0;
  const gapColor = gap >= 0 ? '#22c55e' : '#f43f5e';

  return (
    <div className="card-glass-green rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold tracking-widest uppercase text-[#94a3b8]">
          Cumulative Revenue vs Target
        </span>
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#22c55e]" />
            <span className="text-[#94a3b8]">Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5" style={{ background: FY_GOLD }} />
            <span className="text-[#94a3b8]">Target</span>
          </div>
          {last && (
            <span
              className="text-[10px] font-black px-1.5 py-0.5 rounded-md tracking-wide border"
              style={{ background: `${gapColor}22`, color: gapColor, borderColor: `${gapColor}44` }}
            >
              {gap >= 0 ? 'AHEAD' : 'GAP'} {formatINR(Math.abs(gap))}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={series} margin={{ top: 14, right: 12, bottom: 0, left: -6 }}>
            <defs>
              <linearGradient id="fyCumGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACTUAL} stopOpacity={0.6} />
                <stop offset="70%" stopColor="#16a34a" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#16a34a" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,45,69,0.6)" vertical={false} />
            <XAxis dataKey="day" hide />
            <YAxis
              tickFormatter={formatINRShort}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(34,197,94,0.4)' }} />
            {monthStarts.map((d) => (
              <ReferenceLine
                key={d.day}
                x={d.day}
                stroke="rgba(148,163,184,0.22)"
                strokeDasharray="2 4"
                label={{ value: d.month.toUpperCase(), position: 'insideTopLeft', fill: '#cbd5e1', fontSize: 11, fontWeight: 800 }}
              />
            ))}
            <Area
              type="monotone"
              dataKey="cumActual"
              name="Actual"
              stroke="#4ade80"
              strokeWidth={3}
              fill="url(#fyCumGrad)"
              dot={false}
              activeDot={{ r: 5, fill: '#4ade80', stroke: '#0a1628', strokeWidth: 2 }}
              isAnimationActive={false}
            />
            <Line
              type="linear"
              dataKey="cumTarget"
              name="Target"
              stroke={FY_GOLD}
              strokeWidth={2.5}
              strokeDasharray="6 3"
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
