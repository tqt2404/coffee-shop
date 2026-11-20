import { AnimatePresence, motion } from 'motion/react';
import { Coffee } from 'lucide-react';
import type { FlyingParcel } from '../../hooks/useFlyToCart';
import { SILK_EASE } from '../../utils/motion';

interface FlyToCartLayerProps {
  parcels: FlyingParcel[];
}

/**
 * Fixed non-blocking overlay rendering framed miniature product thumbnails
 * flying along a smooth parabolic trajectory straight into the Header Cart button,
 * followed by a crisp geometric echo frame on launch (ZERO gradients).
 */
export function FlyToCartLayer({ parcels }: FlyToCartLayerProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[65] overflow-hidden"
    >
      <AnimatePresence>
        {parcels.map((parcel) => {
          const midX = (parcel.startX + parcel.endX) / 2;
          const arcY = Math.min(parcel.startY, parcel.endY) - 115;

          return (
            <div key={parcel.id}>
              {/* Origin Bronze Ripple Frame */}
              <motion.div
                initial={{
                  x: parcel.startX - 24,
                  y: parcel.startY - 24,
                  scale: 0.7,
                  opacity: 0.9,
                }}
                animate={{
                  scale: 2.1,
                  opacity: 0,
                }}
                transition={{ duration: 0.45, ease: SILK_EASE }}
                className="fixed top-0 left-0 w-12 h-12 border border-[#7A5C38] will-change-transform"
              />

              {/* Flying Framed Product Thumbnail */}
              <motion.div
                initial={{
                  x: parcel.startX - 26,
                  y: parcel.startY - 26,
                  scale: 1,
                  rotate: -6,
                  opacity: 1,
                }}
                animate={{
                  x: [parcel.startX - 26, midX - 26, parcel.endX - 18],
                  y: [parcel.startY - 26, arcY, parcel.endY - 18],
                  scale: [1, 1.22, 0.36],
                  rotate: [-6, 8, 16],
                  opacity: [1, 1, 0.2],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.68, ease: SILK_EASE }}
                className="fixed top-0 left-0 w-[52px] h-[52px] bg-[#191715] border-2 border-[#7A5C38] p-0.5 flex items-center justify-center overflow-hidden will-change-transform"
              >
                {parcel.image ? (
                  <img
                    src={parcel.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Coffee className="w-5 h-5 text-[#F8F7F4]" />
                )}
              </motion.div>

              {/* Landing Pulse Ring at Cart Target */}
              <motion.div
                initial={{
                  x: parcel.endX - 20,
                  y: parcel.endY - 20,
                  scale: 0.5,
                  opacity: 0,
                }}
                animate={{
                  scale: [0.5, 1.5, 2],
                  opacity: [0, 0.85, 0],
                }}
                transition={{ duration: 0.42, delay: 0.48, ease: SILK_EASE }}
                className="fixed top-0 left-0 w-10 h-10 border-2 border-[#7A5C38] will-change-transform"
              />
            </div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
