import { AnimatePresence, motion } from 'motion/react';
import { Coffee } from 'lucide-react';
import type { FlyingParcel } from '../../hooks/useFlyToCart';
import { SILK_EASE } from '../../utils/motion';

interface FlyToCartLayerProps {
  parcels: FlyingParcel[];
}

/**
 * Fixed non-blocking overlay rendering tactile parabolic coffee parcel badges
 * gliding from any clicked product card straight into the Header Cart button.
 */
export function FlyToCartLayer({ parcels }: FlyToCartLayerProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
    >
      <AnimatePresence>
        {parcels.map((parcel) => {
          const midX = (parcel.startX + parcel.endX) / 2;
          const arcY = Math.min(parcel.startY, parcel.endY) - 90;

          return (
            <motion.div
              key={parcel.id}
              initial={{
                x: parcel.startX - 18,
                y: parcel.startY - 18,
                scale: 1,
                opacity: 1,
              }}
              animate={{
                x: [parcel.startX - 18, midX - 18, parcel.endX - 16],
                y: [parcel.startY - 18, arcY, parcel.endY - 16],
                scale: [1, 1.15, 0.45],
                opacity: [1, 1, 0.15],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.62, ease: SILK_EASE }}
              className="fixed top-0 left-0 w-9 h-9 bg-[#1F3A2E] text-[#F8F7F4] border border-[#7A5C38] flex items-center justify-center will-change-transform"
            >
              <Coffee className="w-4 h-4" />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
