import { useCallback } from 'react';
import { useMotionValue, useSpring } from 'motion/react';

/**
 * Tactile cursor-magnetic spring hook for classical-modern luxury CTAs.
 * Subtle pull (max 5–7px) that snaps organically back to rest on pointer leave.
 */
export function useMagnetic(strength = 0.22) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const x = useSpring(rawX, { stiffness: 260, damping: 20, mass: 0.45 });
  const y = useSpring(rawY, { stiffness: 260, damping: 20, mass: 0.45 });

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const offsetX = (e.clientX - (rect.left + rect.width / 2)) * strength;
      const offsetY = (e.clientY - (rect.top + rect.height / 2)) * strength;
      rawX.set(Math.max(-9, Math.min(9, offsetX)));
      rawY.set(Math.max(-7, Math.min(7, offsetY)));
    },
    [rawX, rawY, strength]
  );

  const onMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return { x, y, onMouseMove, onMouseLeave };
}
