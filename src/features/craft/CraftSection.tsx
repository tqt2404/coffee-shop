import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BREW_METHODS, ROASTERY_IMAGE } from '../../data/products';
import {
  FAST_MORPH_SPRING,
  ORGANIC_SPRING,
  SILK_EASE,
} from '../../utils/motion';
import { InteractiveTiltCard } from '../../components/motion/InteractiveTiltCard';
import {
  BronzeCorners,
  MorphLayer,
  MorphPage,
  MorphParallaxImage,
  MorphRule,
  SplitHeadline,
} from '../../components/motion/MorphStage';
import { RoastCurveVisual } from '../../components/motion/RoastCurveVisual';
import { SafeImage } from '../../components/ui/SafeImage';

const PRINCIPLES = [
  {
    index: '01.',
    title: 'Thu hái chín mọng trên 95%',
    body: 'Chỉ chọn quả chín đỏ bằng tay tại cao nguyên Cầu Đất và các hợp tác xã đạt chuẩn truy xuất nguồn gốc, loại bỏ hoàn toàn hạt lỗi trước khi phơi giàn.',
  },
  {
    index: '02.',
    title: 'Rang mẻ nhỏ 12 kg trên trống gang',
    body: 'Trống gang Giesen giữ nhiệt ổn định giúp hạt phát triển đồng đều từ lõi ra vỏ, tạo hậu vị ngọt thanh mà không bị cháy khét bề mặt.',
  },
  {
    index: '03.',
    title: 'Đóng gói van một chiều đúng ngày rang',
    body: 'Mỗi túi cà phê được ghi rõ mã mẻ rang và chỉ gửi đi trong vòng 48 giờ kể từ khi rời khay làm nguội để bảo toàn tối đa hương thơm nguyên bản.',
  },
];

export function CraftSection() {
  const [activeBrewId, setActiveBrewId] = useState<'phin' | 'v60' | 'espresso'>('phin');
  const [cups, setCups] = useState<1 | 2 | 4>(1);
  const [plateHovered, setPlateHovered] = useState(false);

  const brew = BREW_METHODS.find((m) => m.id === activeBrewId) || BREW_METHODS[0];
  const totalCoffee = brew.coffeeGramsPerCup * cups;
  const totalWater = brew.waterMlPerCup * cups;

  return (
    <MorphPage
      id="triet-ly-rang"
      pageNumber="05"
      chapterTitle="Triết Lý Rang & Hồ Sơ Nhiệt Giesen"
      bgClass="bg-[#EFECE6]"
    >
      {/* Part 1: Roastery Philosophy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
        <MorphLayer vector="tilt-left" stagger={0} className="lg:col-span-6 flex">
          <InteractiveTiltCard
            maxTilt={4.2}
            onHoverChange={setPlateHovered}
            className="group border border-[#DDD8CE] bg-[#F8F7F4] p-3 sm:p-4 transition-colors duration-300 hover:border-[#7A5C38]"
          >
            <BronzeCorners active={plateHovered} size="md" />
            <div className="aspect-[4/3] lg:aspect-auto lg:flex-1 w-full overflow-hidden bg-[#191715]">
              <MorphParallaxImage drift={20}>
                <SafeImage
                  src={ROASTERY_IMAGE}
                  alt="Khay làm nguội hạt cà phê mới rang trên máy rang trống gang Giesen"
                  fallbackTitle="Xưởng Rang Giesen · Lạc Sơn"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              </MorphParallaxImage>
            </div>
            <div className="pt-3 flex items-center justify-between gap-2 text-xs overflow-hidden">
              <MorphLayer vector="left" stagger={0.03} distance={0.35}>
                <span className="font-display font-semibold text-[#191715]">
                  Trống gang Giesen · Mẻ 12 kg
                </span>
              </MorphLayer>
              <MorphLayer vector="right" stagger={0.035} distance={0.35}>
                <span className="font-mono text-[11px] text-[#5C574F]">
                  Đà Lạt · 1.500m
                </span>
              </MorphLayer>
            </div>
          </InteractiveTiltCard>
        </MorphLayer>

        <MorphLayer vector="tilt-right" stagger={0.02} className="lg:col-span-6 flex">
          <div className="relative flex-1 flex flex-col justify-between bg-[#FFFFFF] border border-[#DDD8CE] p-6 sm:p-8 lg:p-10">
            <BronzeCorners size="sm" />
            <div>
              <MorphLayer vector="left" stagger={0.025} distance={0.4}>
                <p className="text-xs tracking-[0.06em] text-[#7A5C38] font-medium mb-2">
                  Triết lý xưởng rang Đà Lạt
                </p>
              </MorphLayer>
              <SplitHeadline
                as="h2"
                mode="inView"
                text="Kỷ luật của lửa, thời gian và sự tĩnh lặng."
                className="font-display text-3xl sm:text-4xl font-semibold leading-[1.2] text-[#191715]"
              />
            </div>

            <div className="mt-8 space-y-0">
              {PRINCIPLES.map((item, idx) => {
                const st = 0.035 + idx * 0.026;
                return (
                  <div key={item.index} className="py-5 last:pb-0">
                    <MorphRule stagger={st} className="h-[1px] w-full bg-[#DDD8CE] mb-5" />
                    <div className="flex items-baseline gap-2.5 overflow-hidden">
                      <MorphLayer vector="left" stagger={st + 0.01} distance={0.3}>
                        <span className="font-mono text-sm text-[#7A5C38]">
                          {item.index}
                        </span>
                      </MorphLayer>
                      <MorphLayer vector="right" stagger={st + 0.016} distance={0.35}>
                        <h3 className="font-display text-xl font-semibold leading-[1.3] text-[#191715]">
                          {item.title}
                        </h3>
                      </MorphLayer>
                    </div>
                    <MorphLayer vector="up" stagger={st + 0.024} distance={0.3}>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#5C574F]">
                        {item.body}
                      </p>
                    </MorphLayer>
                  </div>
                );
              })}
            </div>
          </div>
        </MorphLayer>
      </div>

      {/* Part 2: Live Interactive Giesen Roast Profile Curve */}
      <MorphLayer vector="plate" stagger={0.035} className="mt-10 lg:mt-12 relative">
        <BronzeCorners size="sm" />
        <RoastCurveVisual />
      </MorphLayer>

      {/* Part 3: Interactive Brewing Calibration Guide */}
      <MorphLayer
        vector="plate"
        stagger={0.05}
        className="relative mt-10 lg:mt-12 bg-[#FFFFFF] border border-[#DDD8CE] p-6 sm:p-8 lg:p-10"
      >
        <BronzeCorners size="sm" />
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 relative">
          <MorphLayer vector="left" stagger={0.045} distance={0.45}>
            <p className="text-xs tracking-[0.06em] text-[#7A5C38] font-medium mb-1.5">
              Cẩm nang định lượng tại gia
            </p>
            <SplitHeadline
              as="h3"
              mode="inView"
              text="Bảng cân chỉnh tỷ lệ pha chuẩn"
              className="font-display text-2xl sm:text-3xl font-semibold leading-[1.22] text-[#191715]"
            />
          </MorphLayer>

          <MorphLayer
            vector="right"
            stagger={0.055}
            distance={0.45}
            className="flex flex-wrap items-center gap-3"
          >
            <div
              role="tablist"
              aria-label="Chọn phương pháp pha cà phê"
              className="inline-flex bg-[#EFECE6] p-1 border border-[#DDD8CE]"
            >
              {BREW_METHODS.map((method) => {
                const selected = method.id === activeBrewId;
                return (
                  <motion.button
                    key={method.id}
                    type="button"
                    role="tab"
                    whileTap={{ scale: 0.96 }}
                    aria-selected={selected}
                    onClick={() => setActiveBrewId(method.id)}
                    className={`relative px-3.5 py-2 min-h-[40px] text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      selected
                        ? 'text-[#F8F7F4]'
                        : 'text-[#5C574F] hover:text-[#191715]'
                    }`}
                  >
                    {selected && (
                      <motion.span
                        layoutId="brew-method-indicator"
                        transition={FAST_MORPH_SPRING}
                        aria-hidden="true"
                        className="absolute inset-0 bg-[#191715]"
                      />
                    )}
                    <span className="relative z-10">{method.name}</span>
                  </motion.button>
                );
              })}
            </div>

            <div
              role="group"
              aria-label="Chọn số lượng ly"
              className="inline-flex bg-[#EFECE6] p-1 border border-[#DDD8CE]"
            >
              {([1, 2, 4] as const).map((count) => {
                const active = cups === count;
                return (
                  <motion.button
                    key={count}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCups(count)}
                    aria-pressed={active}
                    className={`relative px-3 py-2 min-h-[40px] text-xs font-mono transition-colors cursor-pointer ${
                      active
                        ? 'text-[#F8F7F4]'
                        : 'text-[#5C574F] hover:text-[#191715]'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="brew-cups-indicator"
                        transition={FAST_MORPH_SPRING}
                        aria-hidden="true"
                        className="absolute inset-0 bg-[#1F3A2E]"
                      />
                    )}
                    <span className="relative z-10">{count} ly</span>
                  </motion.button>
                );
              })}
            </div>
          </MorphLayer>

          <div className="absolute bottom-0 left-0 right-0">
            <MorphRule stagger={0.05} />
          </div>
        </div>

        {/* 4 Parameter Cells */}
        <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-[#DDD8CE]">
          <MorphLayer
            vector="up"
            stagger={0.055}
            distance={0.35}
            className="py-5 pr-4 border-r border-b lg:border-b-0 border-[#DDD8CE] overflow-hidden"
          >
            <p className="text-xs text-[#5C574F]">Khối lượng cà phê</p>
            <AnimatePresence mode="wait">
              <motion.p
                key={`coffee-${totalCoffee}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={ORGANIC_SPRING}
                className="mt-1 font-mono text-2xl font-medium text-[#191715] tabular-nums"
              >
                {totalCoffee} g
              </motion.p>
            </AnimatePresence>
          </MorphLayer>

          <MorphLayer
            vector="up"
            stagger={0.07}
            distance={0.35}
            className="py-5 pl-4 lg:px-6 lg:border-r border-b lg:border-b-0 border-[#DDD8CE] overflow-hidden"
          >
            <p className="text-xs text-[#5C574F]">Lượng nước nóng</p>
            <AnimatePresence mode="wait">
              <motion.p
                key={`water-${totalWater}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={ORGANIC_SPRING}
                className="mt-1 font-mono text-2xl font-medium text-[#191715] tabular-nums"
              >
                {totalWater} ml
              </motion.p>
            </AnimatePresence>
          </MorphLayer>

          <MorphLayer
            vector="up"
            stagger={0.085}
            distance={0.35}
            className="py-5 pr-4 lg:px-6 border-r border-[#DDD8CE] overflow-hidden"
          >
            <p className="text-xs text-[#5C574F]">Nhiệt độ &amp; Tỷ lệ</p>
            <AnimatePresence mode="wait">
              <motion.p
                key={`ratio-${brew.id}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={ORGANIC_SPRING}
                className="mt-1 font-mono text-xl font-medium text-[#191715] tabular-nums"
              >
                {brew.waterTempC}°C · {brew.ratioLabel}
              </motion.p>
            </AnimatePresence>
          </MorphLayer>

          <MorphLayer
            vector="up"
            stagger={0.1}
            distance={0.35}
            className="py-5 pl-4 lg:pl-6 overflow-hidden"
          >
            <p className="text-xs text-[#5C574F]">Thời gian chiết xuất</p>
            <AnimatePresence mode="wait">
              <motion.p
                key={`time-${brew.id}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={ORGANIC_SPRING}
                className="mt-1 font-mono text-xl font-medium text-[#191715] tabular-nums"
              >
                {brew.brewTime}
              </motion.p>
            </AnimatePresence>
          </MorphLayer>
        </div>

        {/* Cascading Individual Brew Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`steps-${brew.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            <motion.div
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.44, ease: SILK_EASE }}
              className="lg:col-span-4 text-sm text-[#5C574F] space-y-2 border-l-2 border-[#7A5C38]/40 pl-4"
            >
              <p className="font-medium text-[#191715]">{brew.originNote}</p>
              <p>Độ mịn khuyến nghị: {brew.grindRecommendation}</p>
            </motion.div>
            <ol className="lg:col-span-8 space-y-2.5 text-sm text-[#191715]">
              {brew.steps.map((step, i) => (
                <motion.li
                  key={step}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.46,
                    delay: i * 0.075,
                    ease: SILK_EASE,
                  }}
                  className="flex gap-3 leading-relaxed"
                >
                  <span className="font-mono text-xs text-[#7A5C38] pt-0.5 shrink-0">
                    0{i + 1}.
                  </span>
                  <span>{step}</span>
                </motion.li>
              ))}
            </ol>
          </motion.div>
        </AnimatePresence>
      </MorphLayer>
    </MorphPage>
  );
}
