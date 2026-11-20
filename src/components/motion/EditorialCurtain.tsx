import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SILK_EASE } from '../../utils/motion';

/**
 * Classical split-leaf architectural opening curtain on initial page arrival.
 * Fast (0.6s), strictly flat colors, non-blocking, skipped automatically if ?autostart=1.
 */
export function EditorialCurtain() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') return false;
    return true;
  });

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => setVisible(false), 580);
    return () => window.clearTimeout(timer);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 1 }}
          exit={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="pointer-events-none fixed inset-0 z-[70] flex overflow-hidden"
        >
          <motion.div
            initial={{ x: '0%' }}
            animate={{ x: '-100%' }}
            transition={{ duration: 0.62, delay: 0.12, ease: SILK_EASE }}
            className="w-1/2 h-full bg-[#191715] border-r border-[#7A5C38]/50 flex items-center justify-end pr-6"
          >
            <span className="font-display text-2xl sm:text-3xl font-semibold text-[#F8F7F4] tracking-tight">
              Nhà Rang
            </span>
          </motion.div>
          <motion.div
            initial={{ x: '0%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 0.62, delay: 0.12, ease: SILK_EASE }}
            className="w-1/2 h-full bg-[#191715] border-l border-[#7A5C38]/50 flex items-center justify-start pl-6"
          >
            <span className="font-display text-2xl sm:text-3xl font-semibold text-[#7A5C38] tracking-tight">
              Lạc Sơn
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
