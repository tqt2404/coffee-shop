import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Plus, RotateCcw, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { Product } from '../../types/shop';
import {
  QUIZ_BREW_OPTIONS,
  QUIZ_FLAVOR_OPTIONS,
  QUIZ_MOMENT_OPTIONS,
  recommendCoffeeLots,
  type QuizAnswers,
  type QuizBrewChoice,
  type QuizFlavorChoice,
  type QuizMomentChoice,
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

interface SommelierQuizSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, origin?: { x: number; y: number }) => void;
}

type QuizStepIndex = 0 | 1 | 2 | 3; // 0=brew, 1=flavor, 2=moment, 3=result

export function SommelierQuizSection({
  products,
  onSelectProduct,
  onQuickAdd,
}: SommelierQuizSectionProps) {
  const [step, setStep] = useState<QuizStepIndex>(0);
  const [brew, setBrew] = useState<QuizBrewChoice | null>(null);
  const [flavor, setFlavor] = useState<QuizFlavorChoice | null>(null);
  const [moment, setMoment] = useState<QuizMomentChoice | null>(null);

  const completedAnswers: QuizAnswers | null =
    brew && flavor && moment ? { brew, flavor, moment } : null;

  const result = useMemo(
    () => (completedAnswers ? recommendCoffeeLots(products, completedAnswers) : null),
    [products, completedAnswers]
  );

  const progressPercent = step === 3 ? 100 : Math.round(((step + 1) / 3) * 100);

  const handleChooseBrew = (choice: QuizBrewChoice) => {
    setBrew(choice);
    setStep(1);
  };

  const handleChooseFlavor = (choice: QuizFlavorChoice) => {
    setFlavor(choice);
    setStep(2);
  };

  const handleChooseMoment = (choice: QuizMomentChoice) => {
    setMoment(choice);
    setStep(3);
  };

  const handleReset = () => {
    setBrew(null);
    setFlavor(null);
    setMoment(null);
    setStep(0);
  };

  const handleBack = () => {
    if (step === 1) setStep(0);
    else if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  return (
    <MorphPage
      id="trac-nghiem-hat"
      pageNumber="03B"
      chapterTitle="Trắc Nghiệm Chọn Hạt 3 Bước Kiểu Morph"
      bgClass="bg-[#EFECE6]"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 relative">
        <MorphLayer vector="left" stagger={0}>
          <p className="text-xs tracking-[0.06em] text-[#7A5C38] font-medium mb-2">
            Tư vấn vị giác nghệ nhân · 30 giây
          </p>
          <SplitHeadline
            as="h2"
            mode="inView"
            text="Tìm đúng mẻ rang hợp gu qua 3 bước chạm"
            className="font-display text-3xl sm:text-4xl font-semibold leading-[1.2] text-[#191715]"
          />
        </MorphLayer>

        <MorphLayer vector="right" stagger={0.03}>
          <div className="flex items-center gap-4 text-xs font-mono text-[#5C574F]">
            <span>
              {step === 3 ? 'HOÀN TẤT · GỢI Ý RIÊNG' : `BƯỚC 0${step + 1} / 03`}
            </span>
            <div className="w-28 h-[3px] bg-[#DDD8CE] overflow-hidden">
              <motion.div
                className="h-full bg-[#1F3A2E]"
                initial={false}
                animate={{ width: `${progressPercent}%` }}
                transition={FAST_MORPH_SPRING}
              />
            </div>
          </div>
        </MorphLayer>

        <div className="absolute bottom-0 left-0 right-0">
          <MorphRule stagger={0.02} />
        </div>
      </div>

      {/* Main Morphing Stage */}
      <motion.div
        layout
        transition={MORPH_SPRING}
        className="mt-6 relative bg-[#FFFFFF] border border-[#DDD8CE] p-5 sm:p-8 lg:p-10"
      >
        <BronzeCorners active={step === 3} size="md" />

        {/* Step Navigation Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#EFECE6]">
          <div className="flex items-center gap-2 text-xs font-mono text-[#5C574F]">
            {[
              { idx: 0, label: '01 · Dụng cụ' },
              { idx: 1, label: '02 · Gu vị' },
              { idx: 2, label: '03 · Khoảnh khắc' },
              { idx: 3, label: '04 · Kết quả' },
            ].map((item, i) => {
              const isCurrent = step === item.idx;
              const isPast = step > item.idx;
              return (
                <span key={item.label} className="inline-flex items-center gap-2">
                  {i > 0 && <span className="text-[#C8C2B6]">·</span>}
                  <span
                    className={
                      isCurrent
                        ? 'text-[#191715] font-semibold'
                        : isPast
                          ? 'text-[#1F3A2E]'
                          : 'text-[#8A8377]'
                    }
                  >
                    {item.label}
                  </span>
                </span>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] border border-[#DDD8CE] bg-[#F8F7F4] text-xs font-medium text-[#191715] hover:border-[#191715] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Bước trước</span>
              </motion.button>
            )}
            {step > 0 && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] border border-[#DDD8CE] bg-[#FFFFFF] text-xs font-medium text-[#5C574F] hover:text-[#191715] hover:border-[#191715] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Làm lại</span>
              </motion.button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: BREW METHOD */}
          {step === 0 && (
            <motion.div
              key="quiz-step-0"
              initial={{ opacity: 0, x: 24, scale: 0.985 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -24, scale: 0.985 }}
              transition={MORPH_SPRING}
            >
              <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#191715]">
                Bạn thường pha cà phê bằng dụng cụ nào?
              </h3>
              <p className="mt-1.5 text-sm text-[#5C574F]">
                Lạc Sơn sẽ chọn cấu trúc rang và độ mịn phù hợp nhất với phương pháp chiết xuất của bạn.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {QUIZ_BREW_OPTIONS.map((opt, idx) => {
                  const selected = brew === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      type="button"
                      data-cursor="Chọn"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.36, delay: idx * 0.055, ease: SILK_EASE }}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleChooseBrew(opt.id)}
                      className={`group relative text-left p-5 border transition-colors cursor-pointer flex flex-col justify-between min-h-[152px] ${
                        selected
                          ? 'bg-[#191715] text-[#F8F7F4] border-[#191715]'
                          : 'bg-[#F8F7F4] text-[#191715] border-[#DDD8CE] hover:border-[#7A5C38] hover:bg-[#FFFFFF]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`font-mono text-[11px] ${
                            selected ? 'text-[#C8B296]' : 'text-[#7A5C38]'
                          }`}
                        >
                          {opt.tag}
                        </span>
                        <ArrowRight
                          className={`w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 ${
                            selected ? 'text-[#F8F7F4]' : 'text-[#5C574F]'
                          }`}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="mt-4">
                        <p className="font-display text-lg font-semibold leading-snug">
                          {opt.label}
                        </p>
                        <p
                          className={`mt-1.5 text-xs leading-relaxed ${
                            selected ? 'text-[#D6D1C8]' : 'text-[#5C574F]'
                          }`}
                        >
                          {opt.detail}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2: FLAVOR PROFILE */}
          {step === 1 && (
            <motion.div
              key="quiz-step-1"
              initial={{ opacity: 0, x: 24, scale: 0.985 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -24, scale: 0.985 }}
              transition={MORPH_SPRING}
            >
              <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#191715]">
                Hương vị nào khiến bạn thấy cuốn hút nhất?
              </h3>
              <p className="mt-1.5 text-sm text-[#5C574F]">
                Chọn tầng hương chủ đạo để hệ thống cân đối độ chua thanh, độ ngọt và thể chất.
              </p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {QUIZ_FLAVOR_OPTIONS.map((opt, idx) => {
                  const selected = flavor === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      type="button"
                      data-cursor="Chọn"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.36, delay: idx * 0.06, ease: SILK_EASE }}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleChooseFlavor(opt.id)}
                      className={`group text-left p-6 border transition-colors cursor-pointer flex flex-col justify-between min-h-[164px] ${
                        selected
                          ? 'bg-[#1F3A2E] text-[#F8F7F4] border-[#1F3A2E]'
                          : 'bg-[#F8F7F4] text-[#191715] border-[#DDD8CE] hover:border-[#7A5C38] hover:bg-[#FFFFFF]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`font-mono text-[11px] uppercase tracking-[0.06em] ${
                            selected ? 'text-[#EFECE6]' : 'text-[#7A5C38]'
                          }`}
                        >
                          {opt.tag}
                        </span>
                        <ArrowRight
                          className={`w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 ${
                            selected ? 'text-[#F8F7F4]' : 'text-[#5C574F]'
                          }`}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="mt-4">
                        <p className="font-display text-xl font-semibold leading-snug">
                          {opt.label}
                        </p>
                        <p
                          className={`mt-2 text-sm leading-relaxed ${
                            selected ? 'text-[#E3E7E4]' : 'text-[#5C574F]'
                          }`}
                        >
                          {opt.detail}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 3: MOMENT & INTENSITY */}
          {step === 2 && (
            <motion.div
              key="quiz-step-2"
              initial={{ opacity: 0, x: 24, scale: 0.985 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -24, scale: 0.985 }}
              transition={MORPH_SPRING}
            >
              <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#191715]">
                Khoảnh khắc thưởng thức quen thuộc của bạn?
              </h3>
              <p className="mt-1.5 text-sm text-[#5C574F]">
                Bước cuối cùng — hệ thống sẽ đối chiếu toàn bộ kho hạt rang mới và đề xuất ngay.
              </p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {QUIZ_MOMENT_OPTIONS.map((opt, idx) => {
                  const selected = moment === opt.id;
                  return (
                    <motion.button
                      key={opt.id}
                      type="button"
                      data-cursor="Kết quả"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.36, delay: idx * 0.06, ease: SILK_EASE }}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleChooseMoment(opt.id)}
                      className={`group text-left p-6 border transition-colors cursor-pointer flex flex-col justify-between min-h-[164px] ${
                        selected
                          ? 'bg-[#191715] text-[#F8F7F4] border-[#191715]'
                          : 'bg-[#F8F7F4] text-[#191715] border-[#DDD8CE] hover:border-[#7A5C38] hover:bg-[#FFFFFF]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`font-mono text-[11px] uppercase tracking-[0.06em] ${
                            selected ? 'text-[#C8B296]' : 'text-[#7A5C38]'
                          }`}
                        >
                          {opt.tag}
                        </span>
                        <Sparkles
                          className={`w-4 h-4 ${
                            selected ? 'text-[#F8F7F4]' : 'text-[#7A5C38]'
                          }`}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="mt-4">
                        <p className="font-display text-xl font-semibold leading-snug">
                          {opt.label}
                        </p>
                        <p
                          className={`mt-2 text-sm leading-relaxed ${
                            selected ? 'text-[#D6D1C8]' : 'text-[#5C574F]'
                          }`}
                        >
                          {opt.detail}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 4: MORPH RESULT REVEAL */}
          {step === 3 && result && (
            <motion.div
              key="quiz-step-result"
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={FAST_MORPH_SPRING}
              data-testid="quiz-result-panel"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
                {/* Left: Primary Match Showcase */}
                <div className="lg:col-span-5 relative border border-[#DDD8CE] bg-[#EFECE6] p-3 flex flex-col">
                  <BronzeCorners active size="sm" />
                  <div className="aspect-[4/3] w-full overflow-hidden bg-[#191715]">
                    <SafeImage
                      src={result.primary.product.image}
                      alt={result.primary.product.imageAlt}
                      fallbackTitle={result.primary.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="pt-3 flex items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-[#191715] font-medium">
                      {result.primary.product.batchCode}
                    </span>
                    <span className="text-[#7A5C38]">
                      {result.primary.product.roastLevel} · {result.primary.product.defaultWeight}
                    </span>
                  </div>
                </div>

                {/* Right: Match Breakdown & Direct Cart Action */}
                <div className="lg:col-span-7 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <p className="text-xs font-mono uppercase tracking-[0.08em] text-[#7A5C38]">
                        {result.profileHeadline}
                      </p>
                      <span className="font-mono text-2xl sm:text-3xl font-semibold text-[#1F3A2E] tabular-nums">
                        {result.primary.matchPercent}% hợp gu
                      </span>
                    </div>

                    <h3 className="mt-2 font-display text-3xl sm:text-4xl font-semibold text-[#191715] leading-[1.18]">
                      {result.primary.product.name}
                    </h3>
                    <p className="mt-1 text-sm text-[#5C574F]">
                      {result.primary.product.subtitle} · Khuyên dùng:{' '}
                      <strong className="text-[#191715] font-medium">
                        {result.primary.recommendedGrind}
                      </strong>
                    </p>

                    <ul className="mt-5 space-y-2 border-y border-[#DDD8CE] py-4 text-sm text-[#191715]">
                      {result.primary.reasons.map((reason) => (
                        <li key={reason} className="flex items-start gap-2.5">
                          <Check
                            className="w-4 h-4 text-[#1F3A2E] shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-[#5C574F]">
                        Đơn giá ({result.primary.product.defaultWeight})
                      </p>
                      <p className="font-mono text-2xl font-medium text-[#191715] tabular-nums">
                        {formatVnd(result.primary.product.basePrice)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <motion.button
                        type="button"
                        data-cursor="Xem"
                        whileHover={{ y: -1.5 }}
                        whileTap={{ scale: 0.96 }}
                        transition={ORGANIC_SPRING}
                        onClick={() => onSelectProduct(result.primary.product)}
                        className="px-4 py-3 min-h-[44px] border border-[#191715] bg-[#FFFFFF] text-xs sm:text-sm font-medium text-[#191715] hover:bg-[#EFECE6] transition-colors cursor-pointer"
                      >
                        Xem hồ sơ vị giác
                      </motion.button>
                      <motion.button
                        type="button"
                        data-cursor="Thêm"
                        whileHover={{ y: -1.5 }}
                        whileTap={{ scale: 0.95 }}
                        transition={ORGANIC_SPRING}
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          onQuickAdd(result.primary.product, {
                            x: rect.left + rect.width / 2,
                            y: rect.top + rect.height / 2,
                          });
                        }}
                        className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] bg-[#1F3A2E] text-[#F8F7F4] text-xs sm:text-sm font-medium hover:bg-[#162B22] transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                        <span>Thêm ngay vào giỏ</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Runner-Up Strip */}
                  {result.runnerUp && (
                    <div className="mt-6 pt-4 border-t border-[#EFECE6] flex flex-wrap items-center justify-between gap-3 bg-[#F8F7F4] p-3.5 border border-[#DDD8CE]">
                      <div className="min-w-0">
                        <p className="text-[11px] font-mono text-[#7A5C38]">
                          LỰA CHỌN THAY THẾ · {result.runnerUp.matchPercent}% HỢP GU
                        </p>
                        <p className="font-display text-base font-semibold text-[#191715] truncate">
                          {result.runnerUp.product.name}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSelectProduct(result.runnerUp!.product)}
                        className="px-3.5 py-2 min-h-[38px] border border-[#DDD8CE] bg-[#FFFFFF] text-xs font-medium text-[#191715] hover:border-[#191715] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Khám phá lô này
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </MorphPage>
  );
}
