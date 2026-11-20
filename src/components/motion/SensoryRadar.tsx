import { useState } from 'react';
import { motion } from 'motion/react';
import type { SensoryProfile } from '../../types/shop';
import { ORGANIC_SPRING, SILK_EASE } from '../../utils/motion';

interface SensoryRadarProps {
  profile: SensoryProfile;
  title?: string;
}

const AXES: { key: keyof SensoryProfile; label: string; angleDeg: number }[] = [
  { key: 'aroma', label: 'Hương hoa', angleDeg: -90 },
  { key: 'acidity', label: 'Độ chua', angleDeg: -18 },
  { key: 'sweetness', label: 'Độ ngọt', angleDeg: 54 },
  { key: 'body', label: 'Thể chất', angleDeg: 126 },
  { key: 'aftertaste', label: 'Hậu vị', angleDeg: 198 },
];

const CX = 130;
const CY = 112;
const MAX_R = 70;

function polarToCartesian(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CX + radius * Math.cos(rad),
    y: CY + radius * Math.sin(rad),
  };
}

/**
 * Interactive 5-axis Geometric SVG Flavor Sensory Radar.
 * Pure flat architectural polygons (zero gradients) with spring vertex morphing and interactive axis inspection.
 */
export function SensoryRadar({ profile, title = 'Hồ sơ cảm quan' }: SensoryRadarProps) {
  const [hoveredAxis, setHoveredAxis] = useState<keyof SensoryProfile | null>(null);

  const polygonPoints = AXES.map((axis) => {
    const val = Math.max(0.5, Math.min(5, profile[axis.key]));
    const pt = polarToCartesian(axis.angleDeg, (val / 5) * MAX_R);
    return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
  }).join(' ');

  return (
    <div className="bg-[#FFFFFF] border border-[#DDD8CE] p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-[#7A5C38] whitespace-nowrap">
          {title}
        </p>
        <span className="font-mono text-[11px] text-[#5C574F] whitespace-nowrap">
          {hoveredAxis
            ? `${AXES.find((a) => a.key === hoveredAxis)?.label}: ${profile[hoveredAxis].toFixed(1)}/5`
            : 'Thang 5 điểm'}
        </span>
      </div>

      <svg
        viewBox="0 0 260 226"
        role="img"
        aria-label="Biểu đồ hồ sơ cảm quan 5 chiều của mẻ cà phê"
        className="w-full max-w-[260px] mx-auto block"
      >
        {/* Concentric Pentagon Web */}
        {[1, 2, 3, 4, 5].map((ring) => {
          const pts = AXES.map((axis) => {
            const pt = polarToCartesian(axis.angleDeg, (ring / 5) * MAX_R);
            return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
          }).join(' ');
          return (
            <polygon
              key={ring}
              points={pts}
              fill="none"
              stroke={ring === 5 ? '#C8C2B6' : '#E6E1D7'}
              strokeWidth={ring === 5 ? '1.2' : '0.9'}
            />
          );
        })}

        {/* Radial Spokes */}
        {AXES.map((axis) => {
          const end = polarToCartesian(axis.angleDeg, MAX_R);
          return (
            <line
              key={axis.key}
              x1={CX}
              y1={CY}
              x2={end.x}
              y2={end.y}
              stroke="#DDD8CE"
              strokeWidth="0.9"
            />
          );
        })}

        {/* Animated Solid-Tint Sensory Polygon (ZERO Gradient) */}
        <motion.polygon
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.65, ease: SILK_EASE }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
          points={polygonPoints}
          fill="#1F3A2E"
          fillOpacity="0.18"
          stroke="#1F3A2E"
          strokeWidth="2"
        />

        {/* Vertices & Labels */}
        {AXES.map((axis) => {
          const val = Math.max(0.5, Math.min(5, profile[axis.key]));
          const pt = polarToCartesian(axis.angleDeg, (val / 5) * MAX_R);
          const lbl = polarToCartesian(axis.angleDeg, MAX_R + 22);
          const active = hoveredAxis === axis.key;

          return (
            <g
              key={axis.key}
              onMouseEnter={() => setHoveredAxis(axis.key)}
              onMouseLeave={() => setHoveredAxis(null)}
              onClick={() => setHoveredAxis(axis.key)}
              className="cursor-pointer"
            >
              <motion.circle
                cx={pt.x}
                cy={pt.y}
                r={active ? 5.5 : 3.8}
                fill={active ? '#7A5C38' : '#1F3A2E'}
                stroke="#FFFFFF"
                strokeWidth="1.5"
                animate={{ scale: active ? 1.25 : 1 }}
                transition={ORGANIC_SPRING}
              />
              <text
                x={lbl.x}
                y={lbl.y + 3}
                textAnchor="middle"
                fill={active ? '#191715' : '#5C574F'}
                fontSize="10"
                fontWeight={active ? '600' : '500'}
                fontFamily="'Be Vietnam Pro', sans-serif"
              >
                {axis.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
