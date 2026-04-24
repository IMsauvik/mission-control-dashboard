import { MRR_GOAL, CURRENT_MRR, formatINR } from '../data/salesData.js';

const SIZE = 140;
const CX = SIZE / 2;
const CY = SIZE / 2 + 10;
const R = 54;
const START_ANGLE = 210;
const END_ANGLE = 330;
const ARC_DEGREES = 300;

function polar(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function arcPath(cx, cy, r, startAngle, sweepAngle) {
  const start = polar(cx, cy, r, startAngle);
  const end = polar(cx, cy, r, startAngle + sweepAngle);
  const largeArc = sweepAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export default function MRRGauge() {
  const progress = Math.min(CURRENT_MRR / MRR_GOAL, 1);
  const progressAngle = ARC_DEGREES * progress;
  const pct = Math.round(progress * 100);

  const circumference = (ARC_DEGREES / 360) * 2 * Math.PI * R;
  const filled = circumference * progress;

  return (
    <div className="card-glass-green rounded-xl p-4 flex flex-col justify-between h-full">
      <span className="text-[10px] font-bold tracking-widest uppercase text-[#64748b]">
        ₹4Cr MRR Goal
      </span>

      <div className="flex items-center gap-4">
        {/* SVG Gauge */}
        <div className="flex-none relative" style={{ width: SIZE, height: SIZE - 10 }}>
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            {/* Background arc */}
            <path
              d={arcPath(CX, CY, R, START_ANGLE, ARC_DEGREES)}
              fill="none"
              stroke="#1a2d45"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Progress arc */}
            {progress > 0 && (
              <path
                d={arcPath(CX, CY, R, START_ANGLE, progressAngle)}
                fill="none"
                stroke="#22c55e"
                strokeWidth="10"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.6))' }}
              />
            )}
            {/* Center text */}
            <text x={CX} y={CY - 4} textAnchor="middle" fill="#f8fafc" fontSize="20" fontWeight="900" fontFamily="Inter">
              {pct}%
            </text>
            <text x={CX} y={CY + 13} textAnchor="middle" fill="#22c55e" fontSize="9" fontWeight="700" fontFamily="Inter" letterSpacing="2">
              OF GOAL
            </text>
          </svg>
        </div>

        {/* Labels */}
        <div className="flex flex-col gap-2 flex-1">
          <div>
            <div className="text-[10px] text-[#64748b] font-medium uppercase tracking-wider">Current</div>
            <div className="text-lg font-black text-[#22c55e] leading-tight">
              {formatINR(CURRENT_MRR)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#64748b] font-medium uppercase tracking-wider">Target</div>
            <div className="text-lg font-black text-white leading-tight">
              {formatINR(MRR_GOAL)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[#64748b] font-medium uppercase tracking-wider">Gap</div>
            <div className="text-base font-bold text-[#f59e0b] leading-tight">
              {formatINR(MRR_GOAL - CURRENT_MRR)} to go
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-[10px] text-[#64748b] font-medium mb-1">
          <span>₹0</span>
          <span>₹2Cr</span>
          <span>₹4Cr</span>
        </div>
        <div className="progress-bar-track h-2">
          <div
            className="progress-bar-fill"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, #16a34a, #22c55e, #4ade80)',
              boxShadow: '0 0 8px rgba(34,197,94,0.5)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
