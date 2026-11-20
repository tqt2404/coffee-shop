import { useEffect } from 'react';
import { ArrowLeftRight, Plus, Scale, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { Product } from '../../types/shop';
import { compareSensoryProfiles } from '../../utils/experienceLogic';
import { MORPH_SPRING, ORGANIC_SPRING, SILK_EASE } from '../../utils/motion';
import { formatVnd } from '../../utils/shop';
import { BronzeCorners } from '../../components/motion/MorphStage';
import { SensoryRadar } from '../../components/motion/SensoryRadar';
import { SafeImage } from '../../components/ui/SafeImage';

interface CompareDockAndModalProps {
  compareProducts: Product[];
  isOpen: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
  onRemoveFromCompare: (productId: string) => void;
  onClearCompare: () => void;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, origin?: { x: number; y: number }) => void;
}

export function CompareDockAndModal({
  compareProducts,
  isOpen,
  onOpenModal,
  onCloseModal,
  onRemoveFromCompare,
  onClearCompare,
  onSelectProduct,
  onQuickAdd,
}: CompareDockAndModalProps) {
  const ready = compareProducts.length === 2;
  const lotA = compareProducts[0] || null;
  const lotB = compareProducts[1] || null;

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onCloseModal]);

  const diffs =
    lotA && lotB
      ? compareSensoryProfiles(lotA.sensoryProfile, lotB.sensoryProfile)
      : [];

  return (
    <>
      {/* Floating Bottom Comparison Dock */}
      <AnimatePresence>
        {compareProducts.length > 0 && !isOpen && (
          <motion.aside
            aria-label="Khay so sánh lô hạt"
            data-testid="compare-dock"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={MORPH_SPRING}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1.5rem)] max-w-2xl bg-[#191715] text-[#F8F7F4] border border-[#7A5C38] px-4 py-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Scale className="w-4 h-4 text-[#C8B296] shrink-0" aria-hidden="true" />
                <div className="flex items-center gap-2 min-w-0 flex-1 overflow-x-auto">
                  {compareProducts.map((p, idx) => (
                    <div
                      key={p.id}
                      className="inline-flex items-center gap-2 bg-[#25221E] border border-[#3E3933] pl-1.5 pr-2 py-1 shrink-0"
                    >
                      <span
                        className={`w-2 h-2 shrink-0 ${
                          idx === 0 ? 'bg-[#1F3A2E]' : 'bg-[#7A5C38]'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="text-xs font-medium max-w-[125px] truncate">
                        {p.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveFromCompare(p.id)}
                        aria-label={`Bỏ ${p.name} khỏi khay so sánh`}
                        className="text-[#AFA89D] hover:text-[#FFFFFF] cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                  {compareProducts.length === 1 && (
                    <span className="text-xs text-[#C8B296] whitespace-nowrap">
                      + Chọn thêm 1 lô hạt để đối chiếu
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onClearCompare}
                  className="px-2.5 py-2 min-h-[38px] text-xs text-[#C8B296] hover:text-[#FFFFFF] transition-colors cursor-pointer"
                >
                  Xóa hết
                </button>
                <motion.button
                  type="button"
                  disabled={!ready}
                  whileTap={ready ? { scale: 0.96 } : undefined}
                  onClick={onOpenModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[38px] bg-[#1F3A2E] text-[#F8F7F4] text-xs font-medium hover:bg-[#294E3E] disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Đối chiếu vị giác ({compareProducts.length}/2)</span>
                </motion.button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Full Dual-Lot Overlapping Sensory Radar Comparison Modal */}
      <AnimatePresence>
        {isOpen && lotA && lotB && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="compare-modal-title"
            data-testid="compare-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: SILK_EASE }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#191715]/65 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) onCloseModal();
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={MORPH_SPRING}
              className="relative w-full max-w-5xl bg-[#F8F7F4] border border-[#DDD8CE] max-h-[92vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-8 py-4 bg-[#F8F7F4] border-b border-[#DDD8CE]">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#7A5C38]">
                    ĐỐI CHIẾU CẢM QUAN CHỒNG LỚP
                  </p>
                  <h2
                    id="compare-modal-title"
                    className="font-display text-xl sm:text-2xl font-semibold text-[#191715]"
                  >
                    So sánh 2 lô hạt đặc sản
                  </h2>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.92 }}
                  transition={ORGANIC_SPRING}
                  onClick={onCloseModal}
                  aria-label="Đóng cửa sổ so sánh"
                  className="inline-flex items-center justify-center w-10 h-10 border border-[#DDD8CE] bg-[#FFFFFF] text-[#191715] hover:bg-[#EFECE6] cursor-pointer"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </motion.button>
              </div>

              <div className="p-5 sm:p-8 space-y-8">
                {/* Top Row: Overlapping 5-Axis Radar + Numeric Diff Table */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-6 relative">
                    <BronzeCorners active size="sm" />
                    <SensoryRadar
                      profile={lotA.sensoryProfile}
                      secondaryProfile={lotB.sensoryProfile}
                      primaryLabel={lotA.name}
                      secondaryLabel={lotB.name}
                      title="Biểu đồ vị giác chồng lớp 5 trục"
                      size="large"
                    />
                  </div>

                  <div className="lg:col-span-6 bg-[#FFFFFF] border border-[#DDD8CE] p-5 flex flex-col justify-between">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#7A5C38] mb-3">
                        CHÊNH LỆCH CHỈ SỐ CẢM QUAN
                      </p>
                      <div className="space-y-4">
                        {diffs.map((row) => (
                          <div key={row.key} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-[#191715]">{row.label}</span>
                              <span className="font-mono tabular-nums text-[#5C574F]">
                                <strong className="text-[#1F3A2E]">
                                  {row.valueA.toFixed(1)}
                                </strong>{' '}
                                vs{' '}
                                <strong className="text-[#7A5C38]">
                                  {row.valueB.toFixed(1)}
                                </strong>{' '}
                                (
                                {row.winner === 'tie'
                                  ? 'Bằng nhau'
                                  : row.diff > 0
                                    ? `+${row.diff.toFixed(1)} Lô A`
                                    : `+${Math.abs(row.diff).toFixed(1)} Lô B`}
                                )
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-1.5">
                              <div className="h-[5px] bg-[#EFECE6] overflow-hidden">
                                <motion.div
                                  initial={{ scaleX: 0 }}
                                  animate={{ scaleX: row.valueA / 5 }}
                                  transition={{ duration: 0.55, ease: SILK_EASE }}
                                  style={{ transformOrigin: '0% 50%' }}
                                  className="h-full bg-[#1F3A2E]"
                                />
                              </div>
                              <div className="h-[5px] bg-[#EFECE6] overflow-hidden">
                                <motion.div
                                  initial={{ scaleX: 0 }}
                                  animate={{ scaleX: row.valueB / 5 }}
                                  transition={{ duration: 0.55, delay: 0.08, ease: SILK_EASE }}
                                  style={{ transformOrigin: '0% 50%' }}
                                  className="h-full bg-[#7A5C38]"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="mt-5 pt-3 border-t border-[#EFECE6] text-xs text-[#5C574F]">
                      Rê chuột hoặc chạm vào từng đỉnh biểu đồ bên trái để soi chi tiết chênh lệch từng trục hương vị.
                    </p>
                  </div>
                </div>

                {/* Side-by-Side Specs & Quick Purchase */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { product: lotA, tag: 'LÔ A · XANH RỪNG', accent: 'bg-[#1F3A2E]' },
                    { product: lotB, tag: 'LÔ B · ĐỒNG CỔ', accent: 'bg-[#7A5C38]' },
                  ].map(({ product, tag, accent }) => (
                    <div
                      key={product.id}
                      className="bg-[#FFFFFF] border border-[#DDD8CE] p-5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-3 pb-4 border-b border-[#EFECE6]">
                          <div className="w-16 h-16 shrink-0 bg-[#EFECE6] border border-[#DDD8CE] overflow-hidden">
                            <SafeImage
                              src={product.image}
                              alt={product.imageAlt}
                              fallbackTitle={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] text-[#5C574F]">
                              <span className={`w-2.5 h-2.5 ${accent}`} aria-hidden="true" />
                              {tag}
                            </span>
                            <h3 className="font-display text-xl font-semibold text-[#191715] leading-snug mt-0.5">
                              {product.name}
                            </h3>
                            <p className="font-mono text-sm font-medium text-[#191715] tabular-nums">
                              {formatVnd(product.basePrice)} · {product.defaultWeight}
                            </p>
                          </div>
                        </div>

                        <dl className="mt-3 divide-y divide-[#EFECE6] text-xs sm:text-sm">
                          <div className="py-2 flex justify-between gap-3">
                            <dt className="text-[#5C574F]">Vùng trồng</dt>
                            <dd className="text-[#191715] font-medium text-right">
                              {product.origin}
                            </dd>
                          </div>
                          <div className="py-2 flex justify-between gap-3">
                            <dt className="text-[#5C574F]">Độ cao</dt>
                            <dd className="font-mono text-[#191715] text-right">
                              {product.elevation}
                            </dd>
                          </div>
                          <div className="py-2 flex justify-between gap-3">
                            <dt className="text-[#5C574F]">Sơ chế &amp; Mức rang</dt>
                            <dd className="text-[#191715] text-right">
                              {product.process} · {product.roastLevel}
                            </dd>
                          </div>
                          <div className="py-2 flex justify-between gap-3">
                            <dt className="text-[#5C574F]">Nốt hương</dt>
                            <dd className="text-[#191715] text-right">
                              {product.tastingNotes.join(' · ')}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <div className="mt-4 pt-4 border-t border-[#DDD8CE] flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onCloseModal();
                            onSelectProduct(product);
                          }}
                          className="flex-1 py-2.5 px-3 min-h-[40px] border border-[#DDD8CE] bg-[#F8F7F4] text-xs font-medium text-[#191715] hover:border-[#191715] cursor-pointer"
                        >
                          Xem chi tiết
                        </button>
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.96 }}
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            onQuickAdd(product, {
                              x: rect.left + rect.width / 2,
                              y: rect.top + rect.height / 2,
                            });
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 min-h-[40px] bg-[#1F3A2E] text-[#F8F7F4] text-xs font-medium hover:bg-[#162B22] cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Thêm giỏ</span>
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
