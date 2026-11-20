import { useState } from 'react';
import { motion } from 'motion/react';
import type { SensoryProfile } from '../../types/shop';
import { ORGANIC_SPRING, SILK_EASE } from '../../utils/motion';

interface SensoryRadarProps {
  profile: SensoryProfile;
  title?: string;
  secondaryProfile?: SensoryProfile;
  primaryLabel?: string;
  secondaryLabel?: string;
  size?: 'compact' | 'large';
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

function buildPolygonPoints(profile: SensoryProfile): string {
  return AXES.map((axis) => {
    const val = Math.max(0.5, Math.min(5, profile[axis.key]));
    const pt = polarToCartesian(axis.angleDeg, (val / 5) * MAX_R);
    return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
  }).join(' ');
}

/**
 * Interactive 5-axis Geometric SVG Flavor Sensory Radar.
 * Supports both single-lot mode and overlapping dual-lot comparison mode
 * (Forest Green #1F3A2E vs Warm Bronze #7A5C38) — strictly ZERO gradients.
 */
export function SensoryRadar({
  profile,
  title = 'Hồ sơ cảm quan',
  secondaryProfile,
  primaryLabel = 'Lô A',
  secondaryLabel = 'Lô B',
  size = 'compact',
}: SensoryRadarProps) {
  const [hoveredAxis, setHoveredAxis] = useState<keyof SensoryProfile | null>(null);

  const primaryPoints = buildPolygonPoints(profile);
  const secondaryPoints = secondaryProfile ? buildPolygonPoints(secondaryProfile) : null;

  const hoveredLabel = hoveredAxis
    ? AXES.find((a) => a.key === hoveredAxis)?.label
    : null;

  return (
    <div className="bg-[#FFFFFF] border border-[#DDD8CE] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <p className="text-[11px] font-mono uppercase tracking-[0.08em] text-[#7A5C38] whitespace-nowrap">
          {title}
        </p>
        <span className="font-mono text-[11px] text-[#5C574F] whitespace-nowrap tabular-nums">
          {hoveredAxis && hoveredLabel
            ? secondaryProfile
              ? `${hoveredLabel}: ${profile[hoveredAxis].toFixed(1)} vs ${secondaryProfile[hoveredAxis].toFixed(1)}`
              : `${hoveredLabel}: ${profile[hoveredAxis].toFixed(1)}/5`
            : 'Thang 5 điểm'}
        </span>
      </div>

      {secondaryProfile && (
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs border-b border-[#EFECE6] pb-2.5">
          <span className="inline-flex items-center gap-2 text-[#191715] font-medium">
            <span className="w-3 h-3 bg-[#1F3A2E] inline-block shrink-0" aria-hidden="true" />
            <span className="truncate max-w-[180px]">{primaryLabel}</span>
          </span>
          <span className="inline-flex items-center gap-2 text-[#191715] font-medium">
            <span className="w-3 h-3 bg-[#7A5C38] inline-block shrink-0" aria-hidden="true" />
            <span className="truncate max-w-[180px]">{secondaryLabel}</span>
          </span>
        </div>
      )}

      <svg
        viewBox="0 0 260 226"
        role="img"
        aria-label={
          secondaryProfile
            ? `Biểu đồ cảm quan 5 chiều chồng lớp giữa ${primaryLabel} và ${secondaryLabel}`
            : 'Biểu đồ hồ sơ cảm quan 5 chiều của mẻ cà phê'
        }
        className={`w-full mx-auto block ${
          size === 'large' ? 'max-w-[330px]' : 'max-w-[260px]'
        }`}
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

        {/* Primary Polygon (Forest Green #1F3A2E — ZERO Gradient) */}
        <motion.polygon
          key={`primary-${primaryPoints}`}
          initial={{ scale: 0.45, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, ease: SILK_EASE }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
          points={primaryPoints}
          fill="#1F3A2E"
          fillOpacity="0.18"
          stroke="#1F3A2E"
          strokeWidth="2.1"
        />

        {/* Secondary Overlapping Polygon (Warm Bronze #7A5C38 — ZERO Gradient) */}
        {secondaryPoints && (
          <motion.polygon
            key={`secondary-${secondaryPoints}`}
            initial={{ scale: 0.45, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.62, delay: 0.08, ease: SILK_EASE }}
            style={{ transformOrigin: `${CX}px ${CY}px` }}
            points={secondaryPoints}
            fill="#7A5C38"
            fillOpacity="0.22"
            stroke="#7A5C38"
            strokeWidth="2.1"
            strokeDasharray="4 2"
          />
        )}

        {/* Vertices & Interactive Axis Labels */}
        {AXES.map((axis) => {
          const valA = Math.max(0.5, Math.min(5, profile[axis.key]));
          const ptA = polarToCartesian(axis.angleDeg, (valA / 5) * MAX_R);
          const ptB = secondaryProfile
            ? polarToCartesian(
                axis.angleDeg,
                (Math.max(0.5, Math.min(5, secondaryProfile[axis.key])) / 5) * MAX_R
              )
            : null;
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
                cx={ptA.x}
                cy={ptA.y}
                r={active ? 5.5 : 3.8}
                fill="#1F3A2E"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                animate={{ scale: active ? 1.25 : 1 }}
                transition={ORGANIC_SPRING}
              />
              {ptB && (
                <motion.circle
                  cx={ptB.x}
                  cy={ptB.y}
                  r={active ? 5.5 : 3.8}
                  fill="#7A5C38"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  animate={{ scale: active ? 1.25 : 1 }}
                  transition={ORGANIC_SPRING}
                />
              )}
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
