import { useState } from 'react';
import { Check, Plus, Scale } from 'lucide-react';
import { motion } from 'motion/react';
import type { Product } from '../../types/shop';
import { MORPH_SPRING, ORGANIC_SPRING, SILK_EASE } from '../../utils/motion';
import { formatVnd } from '../../utils/shop';
import { InteractiveTiltCard } from '../../components/motion/InteractiveTiltCard';
import {
  BronzeCorners,
  MorphLayer,
  MorphParallaxImage,
  MorphRule,
  type MorphVector,
} from '../../components/motion/MorphStage';
import { SafeImage } from '../../components/ui/SafeImage';

interface ProductCardProps {
  product: Product;
  index: number;
  isCompared?: boolean;
  onSelect: (product: Product) => void;
  onQuickAdd: (product: Product, origin?: { x: number; y: number }) => void;
  onToggleCompare?: (product: Product) => void;
}

function getCardVector(index: number): MorphVector {
  const col = index % 3;
  if (col === 0) return 'tilt-left';
  if (col === 1) return 'plate';
  return 'tilt-right';
}

export function ProductCard({
  product,
  index,
  isCompared = false,
  onSelect,
  onQuickAdd,
  onToggleCompare,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const row = Math.floor(index / 3);
  const col = index % 3;
  const baseStagger = Math.min(0.06, 0.015 + row * 0.022 + col * 0.012);

  const sensoryBars = [
    { label: 'Thể chất', value: product.sensoryProfile.body },
    { label: 'Độ ngọt', value: product.sensoryProfile.sweetness },
    { label: 'Hương hoa', value: product.sensoryProfile.aroma },
  ];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={MORPH_SPRING}
      className="flex"
    >
      <MorphLayer
        vector={getCardVector(index)}
        stagger={baseStagger}
        distance={0.92}
        className="flex flex-1 w-full"
      >
        <InteractiveTiltCard
          maxTilt={5.2}
          onHoverChange={setHovered}
          className={`group bg-[#FFFFFF] border transition-colors duration-300 ${
            isCompared
              ? 'border-[#1F3A2E]'
              : 'border-[#DDD8CE] hover:border-[#7A5C38]'
          }`}
        >
          <article className="relative flex flex-col flex-1">
            {/* 1. Animated Antique-Bronze Corner Marks */}
            <BronzeCorners active={hovered || isCompared} size="sm" />

            {/* 2. Shared-Element Morph + Continuous Scroll Parallax Photo */}
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#EFECE6] border-b border-[#DDD8CE]">
              <motion.button
                layoutId={`product-image-${product.id}`}
                transition={MORPH_SPRING}
                type="button"
                data-cursor="Xem"
                onClick={() => onSelect(product)}
                aria-label={`Xem chi tiết ${product.name}`}
                className="relative block w-full h-full text-left cursor-pointer"
              >
                <MorphParallaxImage drift={11}>
                  <SafeImage
                    src={product.image}
                    alt={product.imageAlt}
                    fallbackTitle={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                  />
                </MorphParallaxImage>

                {/* Sliding flat dark-ink roast telemetry tag on hover */}
                <motion.span
                  layoutId={`product-batch-${product.id}`}
                  aria-hidden="true"
                  initial={false}
                  animate={{
                    y: hovered ? 0 : 8,
                    opacity: hovered ? 1 : 0,
                  }}
                  transition={{ duration: 0.28, ease: SILK_EASE }}
                  className="pointer-events-none absolute bottom-3 left-3 px-2.5 py-1 bg-[#191715] text-[#F8F7F4] font-mono text-[10px] tracking-[0.08em]"
                >
                  {product.batchCode} · {product.elevation}
                </motion.span>
              </motion.button>

              {onToggleCompare && (
                <motion.button
                  type="button"
                  data-cursor="So sánh"
                  whileTap={{ scale: 0.92 }}
                  transition={ORGANIC_SPRING}
                  onClick={() => onToggleCompare(product)}
                  aria-pressed={isCompared}
                  aria-label={
                    isCompared
                      ? `Bỏ chọn so sánh ${product.name}`
                      : `Chọn so sánh ${product.name}`
                  }
                  className={`absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[32px] border text-[11px] font-medium transition-colors cursor-pointer ${
                    isCompared
                      ? 'bg-[#1F3A2E] text-[#F8F7F4] border-[#1F3A2E]'
                      : 'bg-[#FFFFFF]/95 text-[#191715] border-[#DDD8CE] hover:border-[#191715]'
                  }`}
                >
                  {isCompared ? (
                    <Check className="w-3 h-3" aria-hidden="true" />
                  ) : (
                    <Scale className="w-3 h-3 text-[#7A5C38]" aria-hidden="true" />
                  )}
                  <span>{isCompared ? 'Đang so sánh' : 'So sánh'}</span>
                </motion.button>
              )}
            </div>

            {/* Uniform Card Body with Granular Per-Element Choreography */}
            <div className="flex flex-col flex-1 p-5 sm:p-6">
              {/* 3. Opposing Micro-Layers: Category & Weight */}
              <div className="flex items-center justify-between gap-2 text-xs text-[#5C574F] overflow-hidden">
                <MorphLayer
                  vector="left"
                  stagger={baseStagger + 0.02}
                  distance={0.3}
                  className="truncate"
                >
                  <span>
                    {product.categoryLabel} · {product.roastLevel}
                  </span>
                </MorphLayer>
                <MorphLayer
                  vector="right"
                  stagger={baseStagger + 0.025}
                  distance={0.3}
                  className="font-mono shrink-0"
                >
                  <span>{product.defaultWeight}</span>
                </MorphLayer>
              </div>

              {/* 4. Product Title */}
              <MorphLayer
                vector="up"
                stagger={baseStagger + 0.032}
                distance={0.35}
              >
                <motion.h3
                  layoutId={`product-title-${product.id}`}
                  transition={MORPH_SPRING}
                  className="mt-2.5 font-display text-xl font-semibold leading-[1.3] text-[#191715]"
                >
                  <button
                    type="button"
                    onClick={() => onSelect(product)}
                    className="text-left hover:text-[#1F3A2E] transition-colors cursor-pointer"
                  >
                    {product.name}
                  </button>
                </motion.h3>
              </MorphLayer>

              {/* 5. Individual Cascading Tasting Notes */}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-[#5C574F] leading-relaxed">
                {product.tastingNotes.map((note, noteIdx) => (
                  <MorphLayer
                    key={note}
                    vector="up"
                    stagger={baseStagger + 0.04 + noteIdx * 0.012}
                    distance={0.28}
                    className="inline-flex items-center gap-1.5"
                  >
                    {noteIdx > 0 && (
                      <span aria-hidden="true" className="text-[#7A5C38]">
                        ·
                      </span>
                    )}
                    <motion.span
                      animate={{ x: hovered ? 1.5 : 0 }}
                      transition={{
                        duration: 0.28,
                        delay: noteIdx * 0.035,
                        ease: SILK_EASE,
                      }}
                    >
                      {note}
                    </motion.span>
                  </MorphLayer>
                ))}
              </div>

              {/* 6. Interactive Architectural Sensory Micro-Bars (Flat solid pine fill) */}
              <div className="mt-4 pt-3 border-t border-[#EFECE6] space-y-1.5">
                {sensoryBars.map((bar, barIdx) => (
                  <div
                    key={bar.label}
                    className="grid grid-cols-12 items-center gap-2 text-[11px]"
                  >
                    <span className="col-span-4 text-[#5C574F]">{bar.label}</span>
                    <div className="col-span-6 h-[4px] bg-[#EFECE6] overflow-hidden">
                      <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: bar.value / 5 }}
                        viewport={{ once: false, amount: 0.2 }}
                        transition={{
                          duration: 0.55,
                          delay: 0.06 + barIdx * 0.07,
                          ease: SILK_EASE,
                        }}
                        style={{ transformOrigin: '0% 50%' }}
                        className={`h-full transition-colors duration-300 ${
                          hovered ? 'bg-[#7A5C38]' : 'bg-[#1F3A2E]'
                        }`}
                      />
                    </div>
                    <span className="col-span-2 font-mono text-[10px] text-right text-[#5C574F] tabular-nums">
                      {bar.value.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>

              {/* 7. Self-Drawing Separator + Opposing Price & Action Controls */}
              <div className="mt-auto pt-4">
                <MorphRule
                  stagger={baseStagger + 0.045}
                  className="h-[1px] w-full bg-[#DDD8CE] mb-4"
                />

                <div className="flex items-center justify-between gap-3">
                  <MorphLayer
                    vector="left"
                    stagger={baseStagger + 0.05}
                    distance={0.28}
                  >
                    <p className="font-mono text-base font-medium text-[#191715] tabular-nums">
                      {formatVnd(product.basePrice)}
                    </p>
                    <p className="text-xs text-[#7A5C38] mt-0.5">
                      {product.statusNote || 'Còn hàng'}
                    </p>
                  </MorphLayer>

                  <MorphLayer
                    vector="right"
                    stagger={baseStagger + 0.058}
                    distance={0.32}
                    className="flex items-center gap-2 shrink-0"
                  >
                    <motion.button
                      type="button"
                      whileHover={{ y: -1.5 }}
                      whileTap={{ scale: 0.95 }}
                      transition={ORGANIC_SPRING}
                      onClick={() => onSelect(product)}
                      className="px-3 py-2 min-h-[40px] border border-[#DDD8CE] bg-[#F8F7F4] text-xs font-medium text-[#191715] hover:border-[#191715] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Chi tiết
                    </motion.button>
                    <motion.button
                      type="button"
                      data-cursor="Thêm"
                      whileHover={{ y: -1.5 }}
                      whileTap={{ scale: 0.94 }}
                      transition={ORGANIC_SPRING}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        onQuickAdd(product, {
                          x: rect.left + rect.width / 2,
                          y: rect.top + rect.height / 2,
                        });
                      }}
                      aria-label={`Thêm nhanh ${product.name} vào giỏ hàng`}
                      className="group/btn inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] bg-[#1F3A2E] text-[#F8F7F4] text-xs font-medium hover:bg-[#162B22] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <Plus
                        className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:rotate-90"
                        aria-hidden="true"
                      />
                      <span>Thêm giỏ</span>
                    </motion.button>
                  </MorphLayer>
                </div>
              </div>
            </div>
          </article>
        </InteractiveTiltCard>
      </MorphLayer>
    </motion.div>
  );
}
