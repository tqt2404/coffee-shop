import { useMemo, useState } from 'react';
import { Check, Gift, Plus, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { CartItem, GiftSealStyle, Product } from '../../types/shop';
import {
  buildGiftBoxCartPayload,
  calculateGiftBoxPricing,
  getGiftEligibleProducts,
  GIFT_SEAL_OPTIONS,
} from '../../utils/experienceLogic';
import {
  FAST_MORPH_SPRING,
  MORPH_SPRING,
  ORGANIC_SPRING,
  SILK_EASE,
} from '../../utils/motion';
import { formatVnd } from '../../utils/shop';
import {
  BronzeCorners,
  MorphLayer,
  MorphPage,
  MorphRule,
  SplitHeadline,
} from '../../components/motion/MorphStage';
import { SafeImage } from '../../components/ui/SafeImage';

interface GiftBoxBuilderSectionProps {
  products: Product[];
  onAddGiftBox: (
    payload: Omit<CartItem, 'lineId'>,
    origin?: { x: number; y: number }
  ) => void;
}

export function GiftBoxBuilderSection({
  products,
  onAddGiftBox,
}: GiftBoxBuilderSectionProps) {
  const eligible = useMemo(() => getGiftEligibleProducts(products), [products]);

  const [slots, setSlots] = useState<(Product | null)[]>([null, null, null]);
  const [recipient, setRecipient] = useState('');
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [sealStyle, setSealStyle] = useState<GiftSealStyle>('lac-son');

  const pricing = useMemo(() => calculateGiftBoxPricing(slots), [slots]);
  const activeSeal =
    GIFT_SEAL_OPTIONS.find((s) => s.id === sealStyle) || GIFT_SEAL_OPTIONS[0];

  const handleAssignLot = (product: Product) => {
    setSlots((prev) => {
      const emptyIdx = prev.findIndex((s) => s === null);
      if (emptyIdx !== -1) {
        const next = [...prev];
        next[emptyIdx] = product;
        return next;
      }
      // If full, shift smoothly into slot 3
      return [prev[0], prev[1], product];
    });
  };

  const handleRemoveSlot = (index: number) => {
    setSlots((prev) => prev.map((item, idx) => (idx === index ? null : item)));
  };

  const handleQuickCurate = () => {
    if (eligible.length < 3) return;
    setSlots([eligible[0], eligible[1], eligible[2]]);
  };

  const handleSubmitGiftBox = (e: React.MouseEvent<HTMLButtonElement>) => {
    const payload = buildGiftBoxCartPayload(slots, {
      recipient,
      sender,
      message,
      sealStyle,
    });
    if (!payload) return;

    const rect = e.currentTarget.getBoundingClientRect();
    onAddGiftBox(payload, {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  };

  return (
    <MorphPage
      id="hop-qua-bieu"
      pageNumber="04B"
      chapterTitle="Xưởng Phối Hộp Quà Biếu 3 Vị & Thiệp Chúc"
      bgClass="bg-[#F8F7F4]"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 relative">
        <MorphLayer vector="left" stagger={0}>
          <p className="text-xs tracking-[0.06em] text-[#7A5C38] font-medium mb-2">
            Quà tặng thủ công · Ưu đãi trọn bộ 12%
          </p>
          <SplitHeadline
            as="h2"
            mode="inView"
            text="Tự phối Hộp Quà Biếu 3 vị & đóng ấn sáp"
            className="font-display text-3xl sm:text-4xl font-semibold leading-[1.2] text-[#191715]"
          />
        </MorphLayer>

        <MorphLayer vector="right" stagger={0.03} className="flex items-center gap-3">
          <motion.button
            type="button"
            data-cursor="Gợi ý"
            whileHover={{ y: -1.5 }}
            whileTap={{ scale: 0.96 }}
            transition={ORGANIC_SPRING}
            onClick={handleQuickCurate}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[42px] border border-[#191715] bg-[#FFFFFF] text-xs sm:text-sm font-medium text-[#191715] hover:bg-[#191715] hover:text-[#F8F7F4] transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#7A5C38]" aria-hidden="true" />
            <span>Phối sẵn 3 vị nghệ nhân</span>
          </motion.button>
        </MorphLayer>

        <div className="absolute bottom-0 left-0 right-0">
          <MorphRule stagger={0.02} />
        </div>
      </div>

      {/* Main 2-Column Tactile Gift Box Studio */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT: Matte Obsidian Physical Gift Box + Live Wax-Sealed Greeting Card */}
        <MorphLayer vector="tilt-left" stagger={0.02} className="lg:col-span-6 space-y-5">
          <div className="relative bg-[#191715] text-[#F8F7F4] border border-[#34302B] p-5 sm:p-7">
            <BronzeCorners active={pricing.isComplete} size="md" />

            <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#34302B]">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#C8B296]">
                  HỘP SƠN MÀI ĐEN NHÁM · 3 × 250G
                </p>
                <p className="font-display text-xl font-semibold mt-0.5">
                  Hộp Quà Lạc Sơn Tuyển Chọn
                </p>
              </div>
              <span
                data-testid="giftbox-slot-count"
                className="font-mono text-sm px-2.5 py-1 border border-[#7A5C38] text-[#F8F7F4] tabular-nums"
              >
                {pricing.filledCount} / 3 ngăn
              </span>
            </div>

            {/* Flat Completion Bar */}
            <div className="mt-4 h-[3px] w-full bg-[#34302B] overflow-hidden">
              <motion.div
                className="h-full bg-[#7A5C38]"
                initial={false}
                animate={{ width: `${(pricing.filledCount / 3) * 100}%` }}
                transition={FAST_MORPH_SPRING}
              />
            </div>

            {/* 3 Tactile Compartments */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {slots.map((slotProduct, idx) => (
                <div
                  key={`gift-slot-${idx}`}
                  data-testid={`gift-slot-${idx}`}
                  className={`relative min-h-[198px] border flex flex-col transition-colors ${
                    slotProduct
                      ? 'border-[#7A5C38] bg-[#23201D]'
                      : 'border-dashed border-[#4B453E] bg-[#1F1C19]'
                  }`}
                >
                  <div className="px-3 py-2 flex items-center justify-between border-b border-[#34302B]">
                    <span className="font-mono text-[10px] tracking-[0.1em] text-[#C8B296]">
                      NGĂN 0{idx + 1}
                    </span>
                    {slotProduct && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(idx)}
                        aria-label={`Gỡ ${slotProduct.name} khỏi ngăn 0${idx + 1}`}
                        className="text-[#C8B296] hover:text-[#FFFFFF] p-0.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {slotProduct ? (
                      <motion.div
                        key={slotProduct.id + idx}
                        initial={{ opacity: 0, y: -18, scale: 0.88 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={MORPH_SPRING}
                        className="flex-1 flex flex-col p-2.5"
                      >
                        <div className="aspect-[4/3] w-full overflow-hidden bg-[#141210] border border-[#34302B]">
                          <SafeImage
                            src={slotProduct.image}
                            alt={slotProduct.name}
                            fallbackTitle={slotProduct.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="mt-2.5 font-display text-sm font-semibold text-[#F8F7F4] leading-snug line-clamp-2">
                          {slotProduct.name}
                        </p>
                        <p className="mt-auto pt-1.5 font-mono text-[11px] text-[#C8B296] tabular-nums">
                          {formatVnd(slotProduct.basePrice)}
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={`empty-${idx}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col items-center justify-center p-4 text-center"
                      >
                        <Gift className="w-5 h-5 text-[#6D655B] mb-2" aria-hidden="true" />
                        <p className="text-xs text-[#9C9488]">Chọn 1 lô hạt bên phải</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Live Greeting Card Preview with Animated Geometric Wax Seal */}
          <div className="relative bg-[#FFFFFF] border border-[#DDD8CE] p-5 sm:p-6">
            <BronzeCorners size="sm" />
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#7A5C38]">
                  XEM TRƯỚC THIỆP GIẤY DÓ ĐI KÈM
                </p>
                <p className="mt-2 font-display text-lg font-semibold text-[#191715]">
                  Kính gửi: {recipient.trim() || 'Người thương mến'}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#5C574F] italic">
                  “
                  {message.trim() ||
                    'Chúc bạn những buổi sáng thật an yên cùng hương cà phê cao nguyên rang mới.'}
                  ”
                </p>
                <p className="mt-3 text-xs font-mono text-[#191715]">
                  — {sender.trim() || 'Nhà Rang Lạc Sơn'}
                </p>
              </div>

              {/* Geometric Flat Wax Seal Monogram */}
              <motion.div
                key={activeSeal.id}
                initial={{ scale: 1.35, rotate: -14, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={ORGANIC_SPRING}
                className="shrink-0 w-16 h-16 bg-[#7A5C38] text-[#F8F7F4] border-2 border-[#191715] flex flex-col items-center justify-center"
              >
                <span className="font-display text-lg font-semibold leading-none">
                  {activeSeal.monogram}
                </span>
                <span className="font-mono text-[8px] tracking-[0.12em] uppercase mt-1">
                  SEAL
                </span>
              </motion.div>
            </div>
          </div>
        </MorphLayer>

        {/* RIGHT: Coffee Lot Picker + Greeting Card Inputs + Bundle Pricing */}
        <MorphLayer
          vector="tilt-right"
          stagger={0.04}
          className="lg:col-span-6 bg-[#FFFFFF] border border-[#DDD8CE] p-5 sm:p-7 space-y-6"
        >
          {/* Step A: Pick 3 Lots */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="font-display text-xl font-semibold text-[#191715]">
                1. Chọn 3 vị hạt (250g / túi)
              </h3>
              <span className="text-xs font-mono text-[#5C574F]">
                Có thể lặp lại vị yêu thích
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {eligible.map((item) => {
                const countInBox = slots.filter((s) => s?.id === item.id).length;
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    data-cursor="Cho vào hộp"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={ORGANIC_SPRING}
                    onClick={() => handleAssignLot(item)}
                    className={`flex items-center gap-3 p-2.5 border text-left transition-colors cursor-pointer ${
                      countInBox > 0
                        ? 'border-[#1F3A2E] bg-[#F8F7F4]'
                        : 'border-[#DDD8CE] bg-[#FFFFFF] hover:border-[#7A5C38]'
                    }`}
                  >
                    <div className="w-12 h-12 shrink-0 bg-[#EFECE6] border border-[#DDD8CE] overflow-hidden">
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        fallbackTitle={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#191715] truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-[#5C574F] truncate">
                        {item.roastLevel} · {formatVnd(item.basePrice)}
                      </p>
                    </div>
                    <span
                      className={`w-7 h-7 shrink-0 flex items-center justify-center font-mono text-xs border ${
                        countInBox > 0
                          ? 'bg-[#1F3A2E] text-[#F8F7F4] border-[#1F3A2E]'
                          : 'bg-[#F8F7F4] text-[#191715] border-[#DDD8CE]'
                      }`}
                    >
                      {countInBox > 0 ? countInBox : <Plus className="w-3.5 h-3.5" />}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Step B: Greeting Card & Wax Seal */}
          <div className="pt-5 border-t border-[#DDD8CE] space-y-3.5">
            <h3 className="font-display text-xl font-semibold text-[#191715]">
              2. Cá nhân hóa thiệp chúc &amp; dấu sáp
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="gift-recipient"
                  className="block text-xs font-medium text-[#191715] mb-1"
                >
                  Tên người nhận
                </label>
                <input
                  id="gift-recipient"
                  type="text"
                  maxLength={60}
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Ví dụ: Anh Hoàng Nam"
                  className="w-full px-3 py-2 min-h-[40px] bg-[#F8F7F4] border border-[#DDD8CE] text-sm text-[#191715] focus:border-[#1F3A2E]"
                />
              </div>
              <div>
                <label
                  htmlFor="gift-sender"
                  className="block text-xs font-medium text-[#191715] mb-1"
                >
                  Người gửi
                </label>
                <input
                  id="gift-sender"
                  type="text"
                  maxLength={60}
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  placeholder="Ví dụ: Minh Thư"
                  className="w-full px-3 py-2 min-h-[40px] bg-[#F8F7F4] border border-[#DDD8CE] text-sm text-[#191715] focus:border-[#1F3A2E]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="gift-message"
                className="block text-xs font-medium text-[#191715] mb-1"
              >
                Lời chúc in trên thiệp giấy dó
              </label>
              <textarea
                id="gift-message"
                rows={2}
                maxLength={180}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Chúc mừng khai trương, một năm mới tràn đầy năng lượng..."
                className="w-full px-3 py-2 bg-[#F8F7F4] border border-[#DDD8CE] text-sm text-[#191715] focus:border-[#1F3A2E]"
              />
            </div>

            <div>
              <span className="block text-xs font-medium text-[#191715] mb-1.5">
                Mẫu dấu sáp đồng niêm phong
              </span>
              <div className="grid grid-cols-3 gap-2">
                {GIFT_SEAL_OPTIONS.map((opt) => {
                  const selected = sealStyle === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setSealStyle(opt.id)}
                      aria-pressed={selected}
                      className={`relative px-2.5 py-2 min-h-[40px] border text-xs font-medium transition-colors cursor-pointer ${
                        selected
                          ? 'text-[#F8F7F4] border-[#191715]'
                          : 'bg-[#F8F7F4] text-[#191715] border-[#DDD8CE] hover:border-[#191715]'
                      }`}
                    >
                      {selected && (
                        <motion.span
                          layoutId="gift-seal-indicator"
                          transition={FAST_MORPH_SPRING}
                          aria-hidden="true"
                          className="absolute inset-0 bg-[#191715]"
                        />
                      )}
                      <span className="relative z-10">{opt.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step C: Pricing & 1-Click Add Complete Gift Box */}
          <div className="pt-5 border-t border-[#DDD8CE]">
            <dl className="space-y-1.5 text-sm mb-4">
              <div className="flex justify-between">
                <dt className="text-[#5C574F]">Tổng giá 3 túi lẻ</dt>
                <dd className="font-mono text-[#191715] tabular-nums">
                  {formatVnd(pricing.originalTotal)}
                </dd>
              </div>
              <div className="flex justify-between text-[#1F3A2E]">
                <dt>Ưu đãi Hộp Quà 3 Vị (-12%)</dt>
                <dd className="font-mono tabular-nums">
                  {pricing.isComplete
                    ? `-${formatVnd(pricing.savingsAmount)}`
                    : 'Chọn đủ 3 vị để mở khóa'}
                </dd>
              </div>
              <div className="flex justify-between pt-2.5 border-t border-[#EFECE6] text-base font-semibold text-[#191715]">
                <dt>Giá trọn bộ (gồm hộp &amp; thiệp)</dt>
                <dd className="font-mono tabular-nums">{formatVnd(pricing.finalPrice)}</dd>
              </div>
            </dl>

            <motion.button
              type="button"
              data-cursor={pricing.isComplete ? 'Thêm hộp' : undefined}
              disabled={!pricing.isComplete}
              whileHover={pricing.isComplete ? { y: -2 } : undefined}
              whileTap={pricing.isComplete ? { scale: 0.98 } : undefined}
              transition={{ duration: 0.25, ease: SILK_EASE }}
              onClick={handleSubmitGiftBox}
              className="w-full py-3.5 px-5 min-h-[48px] bg-[#1F3A2E] text-[#F8F7F4] text-sm font-medium hover:bg-[#162B22] disabled:opacity-45 disabled:cursor-not-allowed transition-colors flex items-center justify-between cursor-pointer"
            >
              <span className="inline-flex items-center gap-2">
                {pricing.isComplete ? (
                  <Check className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Gift className="w-4 h-4" aria-hidden="true" />
                )}
                <span>
                  {pricing.isComplete
                    ? 'Thêm Hộp Quà 3 Vị Vào Giỏ'
                    : `Còn thiếu ${3 - pricing.filledCount} vị hạt nữa`}
                </span>
              </span>
              <span className="font-mono tabular-nums">
                {formatVnd(pricing.finalPrice)}
              </span>
            </motion.button>
          </div>
        </MorphLayer>
      </div>
    </MorphPage>
  );
}
