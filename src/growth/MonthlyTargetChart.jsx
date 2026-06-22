import {
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Legend, LabelList,
} from 'recharts';
import { FY_MONTHLY_TARGETS } from './fyTargets.js';
import { UP_COLOR, DOWN_COLOR } from './format.js';

const TARGET_COLOR = '#475569'; // slate bar for the plan
const ACHIEVED_COLOR = UP_COLOR; // green bar for what landed

// monthly = [{ month:'Apr', achievedCr, sheetTargetCr }] (live, completed months only)
export default function MonthlyTargetChart({ monthly }) {
  const achievedByMonth = Object.fromEntries((monthly || []).map((m) => [m.month, m.achievedCr]));
  const data = FY_MONTHLY_TARGETS.map((t) => {
    const achievedCr = t.month in achievedByMonth ? achievedByMonth[t.month] : null;
    return {
      month: t.month,
      targetCr: t.cr,
      achievedCr,
      shortfallCr: achievedCr != null ? t.cr - achievedCr : null,
    };
  });
  const shortfallByMonth = Object.fromEntries(
    data.filter((d) => d.shortfallCr != null).map((d) => [d.month, d.shortfallCr])
  );

  // X tick: month name, plus a red shortfall line for completed months.
  const MonthTick = ({ x, y, payload }) => {
    const sf = shortfallByMonth[payload.value];
    return (
      <g>
        <text x={x} y={y + 12} textAnchor="middle" fill="#94a3b8" fontSize={11} fontWeight={600}>
          {payload.value}
        </text>
        {sf != null && (
          <text x={x} y={y + 26} textAnchor="middle" fill={sf > 0 ? DOWN_COLOR : UP_COLOR} fontSize={10} fontWeight={700}>
            {sf > 0 ? '−' : '+'}{Math.abs(sf).toFixed(2)}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="card-glass rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <span className="text-[11px] font-bold tracking-widest uppercase text-[#94a3b8]">
          Monthly Target vs Achieved — FY 26-27
        </span>
        <span className="text-[10px] font-semibold text-[#64748b]">₹ Cr · shortfall in red under month</span>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 16, right: 12, bottom: 0, left: -8 }} barGap={1}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,45,69,0.6)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={<MonthTick />}
              height={34}
              interval={0}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 8]}
              tickFormatter={(v) => `₹${v}Cr`}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, fontWeight: 600 }}
              formatter={(v) => <span style={{ color: '#cbd5e1' }}>{v}</span>}
            />
            <Bar dataKey="targetCr" name="Target" fill={TARGET_COLOR} radius={[3, 3, 0, 0]} maxBarSize={24}>
              <LabelList
                dataKey="targetCr"
                position="top"
                formatter={(v) => (v != null ? v.toFixed(2) : '')}
                fill="#cbd5e1"
                fontSize={9}
                fontWeight={600}
              />
            </Bar>
            <Bar dataKey="achievedCr" name="Achieved" fill={ACHIEVED_COLOR} radius={[3, 3, 0, 0]} maxBarSize={24}>
              <LabelList
                dataKey="achievedCr"
                position="top"
                formatter={(v) => (v != null ? v.toFixed(2) : '')}
                fill={ACHIEVED_COLOR}
                fontSize={9}
                fontWeight={800}
              />
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
