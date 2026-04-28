import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid,
  ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts';
import { formatINRShort } from '../data/salesData.js';

function BarLabel({ x, y, width, value, index, isLast, isBest }) {
  if (!isLast && !isBest && index % 3 !== 0) return null;
  const color = isLast ? '#4ade80' : isBest ? '#fbbf24' : '#475569';
  const fs = isLast ? 10 : 9;
  const fw = isLast || isBest ? '700' : '400';
  return (
    <text
      x={x + width / 2}
      y={y - 4}
      textAnchor="middle"
      fill={color}
      fontSize={fs}
      fontWeight={fw}
    >
      {formatINRShort(value)}
    </text>
  );
}

export default function DailyChart({ dailyData, dailyTarget, monthShort, daysDone }) {
  if (!dailyData?.length) return null;

  const bestIdx   = dailyData.reduce((bi, d, i) => d.revenue > dailyData[bi].revenue ? i : bi, 0);
  const daysAbove = dailyData.filter(d => d.revenue >= dailyTarget).length;
  const lastEntry = dailyData[dailyData.length - 1];

  const getColor = (entry, i) => {
    if (i === dailyData.length - 1) return '#4ade80';
    if (entry.revenue >= dailyTarget) return '#22c55e';
    return '#f97316';
  };

  const renderLabel = (props) => (
    <BarLabel
      {...props}
      isLast={props.index === dailyData.length - 1}
      isBest={props.index === bestIdx}
    />
  );

  return (
    <div className="card-glass rounded-xl p-3 h-full flex flex-col">
      {/* Header row */}
      <div className="flex items-center justify-between mb-1.5 flex-none">
        <span className="text-[11px] font-bold tracking-widest uppercase text-[#94a3b8]">
          {monthShort} Daily Sales
        </span>
        <span className="text-[10px] text-[#94a3b8]">
          Target: <span className="text-[#f59e0b] font-bold">{formatINRShort(dailyTarget)}/day</span>
        </span>
      </div>

      {/* Stats badges — always visible, no hover needed */}
      <div className="flex items-center gap-2 mb-2 flex-none flex-wrap">
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}
        >
          ✓ {daysAbove}/{daysDone} on target
        </span>
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}
        >
          ⭐ Best: {formatINRShort(dailyData[bestIdx].revenue)} — Day {dailyData[bestIdx].day}
        </span>
        <span
          className="text-[9px] font-bold px-2 py-0.5 rounded-full ml-auto"
          style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}
        >
          Latest: {formatINRShort(lastEntry.revenue)} — Day {lastEntry.day}
        </span>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={dailyData}
            margin={{ top: 18, right: 4, bottom: 0, left: -8 }}
            barCategoryGap="12%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(26,45,69,0.5)"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tickFormatter={formatINRShort}
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <ReferenceLine
              y={dailyTarget}
              stroke="#f59e0b"
              strokeDasharray="5 3"
              strokeWidth={1.5}
              strokeOpacity={0.75}
              label={{
                value: 'Target',
                position: 'insideTopRight',
                fill: '#f59e0b',
                fontSize: 9,
                fontWeight: 600,
              }}
            />
            <Bar dataKey="revenue" radius={[3, 3, 0, 0]} maxBarSize={22} label={renderLabel}>
              {dailyData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={getColor(entry, i)}
                  fillOpacity={i === dailyData.length - 1 ? 1 : 0.82}
                  style={i === dailyData.length - 1 ? { filter: 'drop-shadow(0 0 6px rgba(74,222,128,0.5))' } : {}}
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
