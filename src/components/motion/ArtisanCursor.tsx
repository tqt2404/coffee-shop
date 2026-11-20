import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';

/**
 * Editorial Artisan Cursor for fine-pointer desktop devices.
 * Tracks pointer purely via GPU motion values (zero React re-renders on move).
 * Renders a crisp hairline architectural ring around the cursor and floats context
 * labels cleanly offset to the bottom-right so button copy is never obscured.
 */
export function ArtisanCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [label, setLabel] = useState<string>('');
  const [interactive, setInteractive] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const ringX = useSpring(mouseX, { stiffness: 380, damping: 28, mass: 0.35 });
  const ringY = useSpring(mouseY, { stiffness: 380, damping: 28, mass: 0.35 });

  const dotX = useSpring(mouseX, { stiffness: 900, damping: 42, mass: 0.15 });
  const dotY = useSpring(mouseY, { stiffness: 900, damping: 42, mass: 0.15 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reduced) return;

    setEnabled(true);

    const inspectElement = (target: HTMLElement | null) => {
      if (!target) {
        setLabel('');
        setInteractive(false);
        return;
      }

      const tagged = target.closest<HTMLElement>('[data-cursor]');
      if (tagged) {
        setLabel(tagged.getAttribute('data-cursor') || '');
        setInteractive(true);
        return;
      }

      const clickable = target.closest('button, a, select, input, textarea, [role="tab"]');
      setLabel('');
      setInteractive(Boolean(clickable));
    };

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setVisible(true);
      inspectElement(e.target as HTMLElement | null);
    };

    const onLeave = () => {
      setVisible(false);
      setLabel('');
    };
    const onDown = () => setPressed(true);
    const onUp = () => {
      setPressed(false);
      // Clear stale labels after morphing buttons unmount under the pointer
      setLabel('');
    };
    const onScroll = () => setLabel('');

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('scroll', onScroll);
    };
  }, [mouseX, mouseY]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70] overflow-hidden hidden lg:block"
    >
      {/* Crisp Hollow Architectural Ring */}
      <motion.div
        style={{ x: ringX, y: ringY }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: pressed ? 0.84 : 1,
        }}
        transition={{ duration: 0.14 }}
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 will-change-transform"
      >
        <motion.div
          animate={{
            width: interactive ? 38 : 26,
            height: interactive ? 38 : 26,
            borderColor: interactive ? '#7A5C38' : '#191715',
          }}
          transition={{ type: 'spring', stiffness: 440, damping: 30 }}
          className="border"
        />
      </motion.div>

      {/* Precision Center Pip */}
      <motion.div
        style={{ x: dotX, y: dotY }}
        animate={{
          opacity: visible ? 1 : 0,
          scale: pressed ? 1.6 : interactive ? 0.65 : 1,
        }}
        transition={{ duration: 0.12 }}
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#1F3A2E] will-change-transform"
      />

      {/* Offset Context Tag (bottom-right of pointer — never covers button copy) */}
      <motion.div
        style={{ x: ringX, y: ringY }}
        animate={{ opacity: visible ? 1 : 0 }}
        className="fixed top-0 left-0 translate-x-5 translate-y-5 will-change-transform"
      >
        <AnimatePresence>
          {label && (
            <motion.span
              key={label}
              initial={{ opacity: 0, y: 4, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 2, scale: 0.92 }}
              transition={{ duration: 0.14 }}
              className="inline-block px-2 py-0.5 bg-[#191715] border border-[#7A5C38] font-mono text-[10px] tracking-[0.08em] uppercase text-[#F8F7F4] whitespace-nowrap"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
