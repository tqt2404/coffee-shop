import { useCallback, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface InteractiveTiltCardProps {
  children: ReactNode;
  className?: string;
  /** Maximum tilt in degrees (default 5.5 for classical dignity without nausea) */
  maxTilt?: number;
  onHoverChange?: (hovered: boolean) => void;
}

/**
 * 3D Perspective Cursor-Tracking Tilt Surface.
 * Strictly flat architectural aesthetic — zero gradients, pure spring physics + crisp hairline depth shift.
 */
export function InteractiveTiltCard({
  children,
  className = '',
  maxTilt = 5.5,
  onHoverChange,
}: InteractiveTiltCardProps) {
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const smoothX = useSpring(px, { stiffness: 210, damping: 24, mass: 0.5 });
  const smoothY = useSpring(py, { stiffness: 210, damping: 24, mass: 0.5 });

  const rotateY = useTransform(smoothX, [0, 1], [-maxTilt, maxTilt]);
  const rotateX = useTransform(smoothY, [0, 1], [maxTilt, -maxTilt]);

  // Subtle architectural bronze cursor-tracking hairline accent at top edge (flat solid bar)
  const barX = useTransform(smoothX, [0, 1], ['0%', '60%']);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      px.set(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
      py.set(Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)));
    },
    [px, py]
  );

  const handleMouseEnter = useCallback(() => {
    onHoverChange?.(true);
  }, [onHoverChange]);

  const handleMouseLeave = useCallback(() => {
    px.set(0.5);
    py.set(0.5);
    onHoverChange?.(false);
  }, [px, py, onHoverChange]);

  return (
    <div style={{ perspective: 1100 }} className="flex flex-1 w-full">
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 240, damping: 24 }}
        className={`relative flex flex-col flex-1 will-change-transform ${className}`}
      >
        {/* Flat solid cursor-tracking architectural accent bar */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 right-0 h-[2px] overflow-hidden z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <motion.div
            style={{ x: barX }}
            className="w-[40%] h-full bg-[#7A5C38]"
          />
        </div>
        {children}
      </motion.div>
    </div>
  );
}
