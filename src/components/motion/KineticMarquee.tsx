import { useRef } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react';

interface KineticMarqueeProps {
  items: string[];
  baseVelocity?: number;
  variant?: 'ink' | 'parchment';
}

function wrapRange(min: number, max: number, v: number): number {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
}

/**
 * Scroll-velocity reactive classical typographic ribbon.
 * Accelerates smoothly in sync with scroll speed and subtly reverses direction on upward scroll.
 * Strictly flat color palette (zero gradients).
 */
export function KineticMarquee({
  items,
  baseVelocity = -2.6,
  variant = 'ink',
}: KineticMarqueeProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 45,
    stiffness: 320,
  });

  const velocityFactor = useTransform(smoothVelocity, [0, 1200], [0, 3.8], {
    clamp: false,
  });

  const directionRef = useRef<number>(1);

  useAnimationFrame((_t, delta) => {
    const dt = Math.min(delta, 48) / 1000;
    const vf = velocityFactor.get();
    if (vf < -0.15) {
      directionRef.current = -1;
    } else if (vf > 0.15) {
      directionRef.current = 1;
    }

    let moveBy = directionRef.current * baseVelocity * dt;
    moveBy += directionRef.current * Math.abs(vf) * (baseVelocity > 0 ? 1 : -1) * dt * 2.4;
    baseX.set(wrapRange(-50, 0, baseX.get() + moveBy));
  });

  const x = useTransform(baseX, (v) => `${v}%`);

  const isInk = variant === 'ink';

  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden border-b select-none ${
        isInk
          ? 'bg-[#191715] text-[#EFECE6] border-[#34302B]'
          : 'bg-[#EFECE6] text-[#191715] border-[#DDD8CE]'
      }`}
    >
      <motion.div
        style={{ x }}
        className="flex whitespace-nowrap py-3.5 will-change-transform"
      >
        {[0, 1].map((dup) => (
          <div key={dup} className="flex items-center shrink-0">
            {items.map((text, idx) => (
              <span
                key={`${dup}-${idx}`}
                className="inline-flex items-center gap-6 px-6 text-xs sm:text-[13px] tracking-[0.14em] uppercase font-mono"
              >
                <span>{text}</span>
                <span
                  className={`inline-block w-1.5 h-1.5 rotate-45 ${
                    isInk ? 'bg-[#7A5C38]' : 'bg-[#1F3A2E]'
                  }`}
                />
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
