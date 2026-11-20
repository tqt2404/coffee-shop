import { useEffect, useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { GrindOption, Product, WeightOption } from '../../types/shop';
import {
  FAST_MORPH_SPRING,
  MORPH_SPRING,
  ORGANIC_SPRING,
  SILK_EASE,
} from '../../utils/motion';
import { calculateItemUnitPrice, formatVnd } from '../../utils/shop';
import { BronzeCorners } from '../../components/motion/MorphStage';
import { SensoryRadar } from '../../components/motion/SensoryRadar';
import { SafeImage } from '../../components/ui/SafeImage';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (payload: {
    product: Product;
    weight: WeightOption;
    grind: GrindOption;
    quantity: number;
    unitPrice: number;
  }) => void;
}

export function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const [weight, setWeight] = useState<WeightOption>('250g');
  const [grind, setGrind] = useState<GrindOption>('Nguyên hạt');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product) return;
    setWeight(product.defaultWeight);
    setGrind(product.availableGrinds[0]);
    setQuantity(1);
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [product, onClose]);

  const unitPrice = product
    ? calculateItemUnitPrice(product.basePrice, weight, product.isSingleUnit)
    : 0;
  const lineTotal = unitPrice * quantity;

  const handleSubmit = () => {
    if (!product) return;
    onAddToCart({
      product,
      weight,
      grind,
      quantity,
      unitPrice,
    });
    onClose();
  };

  const specs = product
    ? [
        { label: 'Vùng trồng', value: product.origin, mono: false },
        { label: 'Độ cao', value: product.elevation, mono: true },
        { label: 'Sơ chế', value: product.process, mono: false },
        { label: 'Mức rang', value: product.roastLevel, mono: false },
        { label: 'Ghi chú hương vị', value: product.tastingNotes.join(' · '), mono: false },
      ]
    : [];

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: SILK_EASE }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#191715]/60 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.975 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={MORPH_SPRING}
            className="relative w-full max-w-4xl bg-[#F8F7F4] border border-[#DDD8CE] max-h-[92vh] overflow-y-auto"
          >
            {/* Top Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-8 py-4 bg-[#F8F7F4] border-b border-[#DDD8CE]">
              <motion.p
                layoutId={`product-batch-${product.id}`}
                transition={MORPH_SPRING}
                className="text-xs font-mono text-[#5C574F]"
              >
                Mã mẻ rang: {product.batchCode} · {product.categoryLabel}
              </motion.p>
              <motion.button
                type="button"
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.92 }}
                transition={ORGANIC_SPRING}
                onClick={onClose}
                aria-label="Đóng chi tiết sản phẩm"
                className="inline-flex items-center justify-center w-10 h-10 border border-[#DDD8CE] bg-[#FFFFFF] text-[#191715] hover:bg-[#EFECE6] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </motion.button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left: Shared-Element Morph Photo + Interactive 5-Axis Sensory Radar + Ledger */}
              <div className="lg:col-span-6 p-5 sm:p-8 border-b lg:border-b-0 lg:border-r border-[#DDD8CE] space-y-5">
                <div className="relative p-2 border border-[#DDD8CE] bg-[#EFECE6]">
                  <BronzeCorners size="sm" />
                  <motion.div
                    layoutId={`product-image-${product.id}`}
                    transition={MORPH_SPRING}
                    className="aspect-[4/3] w-full bg-[#EFECE6] overflow-hidden"
                  >
                    <SafeImage
                      src={product.image}
                      alt={product.imageAlt}
                      fallbackTitle={product.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </div>

                {/* Interactive 5-Axis Sensory Radar */}
                <SensoryRadar profile={product.sensoryProfile} />

                <dl className="divide-y divide-[#DDD8CE] border-y border-[#DDD8CE] text-sm">
                  {specs.map((spec, idx) => (
                    <motion.div
                      key={spec.label}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.38,
                        delay: 0.1 + idx * 0.055,
                        ease: SILK_EASE,
                      }}
                      className="py-2.5 flex justify-between gap-4"
                    >
                      <dt className="text-[#5C574F]">{spec.label}</dt>
                      <dd
                        className={`text-[#191715] text-right ${
                          spec.mono ? 'font-mono' : 'font-medium'
                        }`}
                      >
                        {spec.value}
                      </dd>
                    </motion.div>
                  ))}
                </dl>
              </div>

              {/* Right: Cascading Purchase Module */}
              <div className="lg:col-span-6 p-5 sm:p-8 bg-[#FFFFFF] flex flex-col">
                <motion.p
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.34, delay: 0.06, ease: SILK_EASE }}
                  className="text-xs text-[#7A5C38] font-medium"
                >
                  {product.statusNote || 'Sẵn sàng giao hàng'} · Còn {product.stock} túi
                </motion.p>

                <motion.h2
                  layoutId={`product-title-${product.id}`}
                  transition={MORPH_SPRING}
                  id="product-modal-title"
                  className="mt-2 font-display text-3xl font-semibold text-[#191715] leading-[1.22]"
                >
                  {product.name}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.38, delay: 0.1, ease: SILK_EASE }}
                  className="mt-1.5 text-sm text-[#5C574F]"
                >
                  {product.subtitle}
                </motion.p>

                <div className="mt-5 h-8 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={unitPrice}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={ORGANIC_SPRING}
                      className="font-mono text-2xl font-medium text-[#191715] tabular-nums"
                    >
                      {formatVnd(unitPrice)}
                    </motion.p>
                  </AnimatePresence>
                </div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.42, delay: 0.14, ease: SILK_EASE }}
                  className="mt-4 text-sm leading-relaxed text-[#5C574F]"
                >
                  {product.description}
                </motion.p>

                {/* Weight Selector */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.42, delay: 0.18, ease: SILK_EASE }}
                  className="mt-6"
                >
                  <span className="block text-xs font-medium text-[#191715] mb-2">
                    Quy cách khối lượng
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {product.availableWeights.map((opt) => {
                      const selected = weight === opt;
                      return (
                        <motion.button
                          key={opt}
                          type="button"
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setWeight(opt)}
                          aria-pressed={selected}
                          className={`relative py-2.5 px-3 min-h-[42px] border text-sm font-mono transition-colors cursor-pointer ${
                            selected
                              ? 'text-[#F8F7F4] border-[#191715]'
                              : 'bg-[#F8F7F4] text-[#191715] border-[#DDD8CE] hover:border-[#191715]'
                          }`}
                        >
                          {selected && (
                            <motion.span
                              layoutId="modal-weight-indicator"
                              transition={FAST_MORPH_SPRING}
                              aria-hidden="true"
                              className="absolute inset-0 bg-[#191715]"
                            />
                          )}
                          <span className="relative z-10">{opt}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                  {product.availableWeights.length > 1 && (
                    <p className="mt-1.5 text-xs text-[#5C574F]">
                      Tiết kiệm 5% cho quy cách 500g và 10% cho quy cách 1kg.
                    </p>
                  )}
                </motion.div>

                {/* Grind Selector */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.42, delay: 0.24, ease: SILK_EASE }}
                  className="mt-5"
                >
                  <span className="block text-xs font-medium text-[#191715] mb-2">
                    Mức độ xay hạt
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {product.availableGrinds.map((opt) => {
                      const selected = grind === opt;
                      return (
                        <motion.button
                          key={opt}
                          type="button"
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setGrind(opt)}
                          aria-pressed={selected}
                          className={`relative py-2.5 px-3 min-h-[42px] border text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                            selected
                              ? 'text-[#F8F7F4] border-[#191715]'
                              : 'bg-[#F8F7F4] text-[#191715] border-[#DDD8CE] hover:border-[#191715]'
                          }`}
                        >
                          {selected && (
                            <motion.span
                              layoutId="modal-grind-indicator"
                              transition={FAST_MORPH_SPRING}
                              aria-hidden="true"
                              className="absolute inset-0 bg-[#191715]"
                            />
                          )}
                          <span className="relative z-10">{opt}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Quantity & Primary Purchase CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.44, delay: 0.3, ease: SILK_EASE }}
                  className="mt-auto pt-6 border-t border-[#DDD8CE]"
                >
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className="text-xs font-medium text-[#191715]">Số lượng</span>
                    <div className="inline-flex items-center border border-[#DDD8CE] bg-[#F8F7F4]">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        aria-label="Giảm số lượng"
                        className="w-10 h-10 flex items-center justify-center text-[#191715] hover:bg-[#EFECE6] cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                      </motion.button>
                      <span
                        aria-live="polite"
                        className="w-10 text-center font-mono text-sm font-medium tabular-nums"
                      >
                        {quantity}
                      </span>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          setQuantity((q) => Math.min(product.stock, q + 1))
                        }
                        aria-label="Tăng số lượng"
                        className="w-10 h-10 flex items-center justify-center text-[#191715] hover:bg-[#EFECE6] cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                      </motion.button>
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={ORGANIC_SPRING}
                    onClick={handleSubmit}
                    className="w-full py-3.5 px-6 min-h-[48px] bg-[#1F3A2E] text-[#F8F7F4] text-sm font-medium hover:bg-[#162B22] transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>Thêm vào giỏ hàng</span>
                    <span className="font-mono tabular-nums">
                      {formatVnd(lineTotal)}
                    </span>
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
