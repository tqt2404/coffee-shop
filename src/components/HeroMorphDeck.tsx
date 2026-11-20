import { useEffect, useRef, useState } from 'react';
import { ArrowDownRight } from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { HERO_IMAGE, PRODUCTS, ROASTERY_IMAGE } from '../data/products';
import {
  FAST_MORPH_SPRING,
  ORGANIC_SPRING,
  SILK_EASE,
  SILKY_SCROLL_SPRING,
} from '../utils/motion';
import { BronzeCorners, SplitHeadline } from './MorphStage';
import { SafeImage } from './SafeImage';

interface DeckChapter {
  index: number;
  pageNumber: string;
  roman: string;
  kicker: string;
  headline: string;
  body: string;
  captionTitle: string;
  captionMeta: string;
  accentNote: string;
  image: string;
  imageAlt: string;
  ctaLabel: string;
  ctaHref: string;
  ledger: { label: string; value: string }[];
}

const DECK_CHAPTERS: DeckChapter[] = [
  {
    index: 0,
    pageNumber: '01',
    roman: 'I',
    kicker: 'Nhà Rang Lạc Sơn · Đà Lạt & Hà Nội · Vụ mùa 2026',
    headline: 'Hạt cà phê nguyên bản từ cao nguyên sương mù.',
    body: 'Tuyển chọn từ các nông hộ canh tác bền vững tại Cầu Đất và các lô vi vùng Ethiopia. Mỗi mẻ rang 12 kg trên trống gang được kiểm soát hồ sơ nhiệt tỉ mỉ, giữ trọn tầng hương thuần khiết.',
    captionTitle: 'I. Nghi thức Pour-over · Phòng Nếm Lạc Sơn',
    captionMeta: '92°C · Tỷ lệ 1:16 · Chiết xuất chậm',
    accentNote: 'Thu hoạch chín mọng trên 95%',
    image: HERO_IMAGE,
    imageAlt:
      'Nghệ nhân pha cà phê Pour-over trên bàn đá đen trong phòng thử nếm Nhà Rang Lạc Sơn',
    ctaLabel: 'Khám phá bộ sưu tập',
    ctaHref: '#bo-suu-tap',
    ledger: [
      { label: 'Độ cao vùng trồng', value: '1.650 – 2.200 m' },
      { label: 'Cam kết độ tươi', value: 'Rang mới trong 48 giờ' },
      { label: 'Thiết bị rang', value: 'Trống gang Giesen 12 kg' },
      { label: 'Vận chuyển toàn quốc', value: 'Miễn phí từ 500.000 ₫' },
    ],
  },
  {
    index: 1,
    pageNumber: '02',
    roman: 'II',
    kicker: 'Di Sản Cà Phê Phin Việt · Cầu Đất & Buôn Ma Thuột',
    headline: 'Độ sánh cổ điển, hậu vị ngọt sâu không gắt.',
    body: 'Bản phối Rừng Già kết hợp Arabica Cầu Đất chế biến ướt cùng Fine Robusta Đắk Lắk phơi giàn tự nhiên. Hương sô-cô-la đen 75%, đường thắng và hạt dẻ rang lan tỏa chậm rãi qua từng giọt phin.',
    captionTitle: 'II. Rừng Già · Phin Cổ Điển (250g)',
    captionMeta: 'Rang đậm · 245.000 ₫ · Mã mẻ LS-2611-RG',
    accentNote: 'Bán chạy nhất tại Lạc Sơn',
    image: PRODUCTS[0].image,
    imageAlt: PRODUCTS[0].imageAlt,
    ctaLabel: 'Xem bộ sưu tập hạt',
    ctaHref: '#bo-suu-tap',
    ledger: [
      { label: 'Tỷ lệ phối trộn', value: 'Arabica & Fine Robusta' },
      { label: 'Nốt hương chủ đạo', value: 'Sô-cô-la đen · Hạt dẻ' },
      { label: 'Mức độ rang', value: 'Rang đậm · Phin & Espresso' },
      { label: 'Ưu đãi đặt trực tuyến', value: 'Mã LACSON10 giảm 10%' },
    ],
  },
  {
    index: 2,
    pageNumber: '03',
    roman: 'III',
    kicker: 'Xưởng Rang Trống Gang · Số 18 Trần Hưng Đạo, Đà Lạt',
    headline: 'Kỷ luật của lửa, gang đúc và sự tĩnh lặng.',
    body: 'Không sản xuất công nghiệp hàng loạt. Nghệ nhân Lạc Sơn lắng nghe tiếng nổ đầu, ghi biểu đồ nhiệt từng giây trên trống gang Giesen 12 kg và đóng gói van một chiều ngay khi hạt đạt điểm cân bằng.',
    captionTitle: 'III. Khay làm nguội trống gang Giesen',
    captionMeta: 'Biểu đồ nhiệt thủ công · Nghỉ hạt 24 giờ',
    accentNote: 'Đóng gói van một chiều đúng ngày rang',
    image: ROASTERY_IMAGE,
    imageAlt: 'Hạt cà phê đặc sản mới rang đang làm nguội trong khay trống gang Giesen',
    ctaLabel: 'Đọc cẩm nang pha chuẩn',
    ctaHref: '#triet-ly-rang',
    ledger: [
      { label: 'Khối lượng mỗi mẻ', value: '12 kg thủ công' },
      { label: 'Kiểm định chất lượng', value: 'Thử nếm từng lô rang' },
      { label: 'Phòng thử nếm', value: 'Đà Lạt & Hoàn Kiếm, Hà Nội' },
      { label: 'Tư vấn trực tuyến', value: 'Đặt lịch thử nếm riêng' },
    ],
  },
];

export function HeroMorphDeck() {
  const deckRef = useRef<HTMLElement | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);
  const [plateHovered, setPlateHovered] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const { scrollYProgress } = useScroll({
    target: deckRef,
    offset: ['start start', 'end end'],
  });

  // Silky inertial spring absorbs discrete mouse wheel ticks into liquid glide
  const smoothProgress = useSpring(scrollYProgress, {
    ...SILKY_SCROLL_SPRING,
    stiffness: 72,
    damping: 23,
  });

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (!isDesktop) return;
    const nextIdx = latest < 0.34 ? 0 : latest < 0.72 ? 1 : 2;
    setActiveSlide((prev) => (prev === nextIdx ? prev : nextIdx));
  });

  // Continuous PowerPoint Morph curves with subtle breathing scale & gentle tilt mid-glide
  const plateX = useTransform(
    smoothProgress,
    [0, 0.2, 0.42, 0.62, 0.84, 1],
    ['0%', '0%', '-107%', '-107%', '0%', '0%']
  );
  const plateScale = useTransform(
    smoothProgress,
    [0, 0.2, 0.31, 0.42, 0.62, 0.73, 0.84, 1],
    [1, 1, 0.935, 1, 1, 0.935, 1, 1]
  );
  const plateRotate = useTransform(
    smoothProgress,
    [0, 0.2, 0.31, 0.42, 0.62, 0.73, 0.84, 1],
    [0, 0, -1.25, 0, 0, 1.25, 0, 0]
  );

  // Inner image parallax drift inside the framed photo plate
  const innerImageScale = useTransform(
    smoothProgress,
    [0, 0.31, 0.52, 0.73, 1],
    [1.04, 1.1, 1.03, 1.1, 1.04]
  );
  const innerImageY = useTransform(smoothProgress, [0, 0.5, 1], [-8, 6, -8]);

  const copyX = useTransform(
    smoothProgress,
    [0, 0.29, 0.34, 0.69, 0.74, 1],
    ['0%', '0%', '107%', '107%', '0%', '0%']
  );
  const copyOpacity = useTransform(
    smoothProgress,
    [0, 0.2, 0.28, 0.36, 0.44, 0.62, 0.69, 0.76, 0.84, 1],
    [1, 1, 0, 0, 1, 1, 0, 0, 1, 1]
  );
  const copyY = useTransform(
    smoothProgress,
    [0, 0.2, 0.28, 0.36, 0.44, 0.62, 0.69, 0.76, 0.84, 1],
    [0, 0, -26, 26, 0, 0, -26, 26, 0, 0]
  );

  // Subtle background Roman watermark parallax
  const watermarkY = useTransform(smoothProgress, [0, 1], [30, -45]);
  const progressBarScale = useTransform(smoothProgress, [0, 1], [0.06, 1]);

  const chapter = DECK_CHAPTERS[activeSlide];

  const jumpToChapter = (idx: number) => {
    setActiveSlide(idx);
    if (!isDesktop || !deckRef.current) return;
    const rect = deckRef.current.getBoundingClientRect();
    const deckTop = window.scrollY + rect.top;
    const scrollable = Math.max(0, deckRef.current.offsetHeight - window.innerHeight);
    const targetFrac = idx === 0 ? 0.02 : idx === 1 ? 0.53 : 0.96;
    window.scrollTo({
      top: deckTop + scrollable * targetFrac,
      behavior: 'smooth',
    });
  };

  return (
    <section
      id="top"
      ref={deckRef}
      aria-label="Trình diễn khởi nguyên Nhà Rang Lạc Sơn"
      className="relative bg-[#F8F7F4] border-b border-[#DDD8CE] lg:h-[300vh]"
    >
      <div className="lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] flex flex-col justify-between overflow-x-clip">
        {/* Subtle Flat Classical Roman Watermark in Background Depth */}
        <motion.div
          aria-hidden="true"
          style={{ y: watermarkY }}
          className="pointer-events-none select-none hidden xl:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[17rem] leading-none font-semibold text-[#191715]/[0.028] will-change-transform"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={`wm-${chapter.roman}`}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.06, y: -20 }}
              transition={{ duration: 0.55, ease: SILK_EASE }}
              className="inline-block"
            >
              {chapter.roman}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 lg:pt-6 lg:pb-12 flex-1 flex flex-col justify-between">
          {/* Top Page Folio Bar with Mechanical Slot-Roll Page Number */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#DDD8CE]">
            <div className="flex items-center gap-3 text-xs">
              <span className="font-mono font-medium text-[#7A5C38] tracking-[0.12em] inline-flex items-center gap-1.5">
                <motion.span
                  aria-hidden="true"
                  key={`folio-dash-${chapter.index}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.45, ease: SILK_EASE }}
                  style={{ transformOrigin: '0% 50%' }}
                  className="inline-block w-4 h-[1px] bg-[#7A5C38]"
                />
                <span>TRANG</span>
                <span className="inline-block overflow-hidden h-4 align-bottom">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`pg-${chapter.pageNumber}`}
                      initial={{ y: 14, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -14, opacity: 0 }}
                      transition={{ duration: 0.35, ease: SILK_EASE }}
                      className="inline-block"
                    >
                      {chapter.pageNumber}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span>/ 07</span>
              </span>
              <span aria-hidden="true" className="text-[#DDD8CE]">
                /
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={`kicker-${chapter.index}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.36, ease: SILK_EASE }}
                  className="text-[#5C574F] hidden sm:inline"
                >
                  {chapter.kicker}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-4">
              <span className="hidden lg:inline text-[11px] font-mono text-[#5C574F]">
                Cuộn xuống để chuyển cảnh Morph
              </span>
              <div
                role="tablist"
                aria-label="Chọn chương trình bày mở đầu"
                className="inline-flex items-center border border-[#DDD8CE] bg-[#FFFFFF] p-0.5 shrink-0"
              >
                {DECK_CHAPTERS.map((item) => {
                  const isActive = item.index === activeSlide;
                  return (
                    <motion.button
                      key={item.roman}
                      type="button"
                      role="tab"
                      whileTap={{ scale: 0.94 }}
                      aria-selected={isActive}
                      aria-label={`Chương ${item.roman}: ${item.captionTitle}`}
                      onClick={() => jumpToChapter(item.index)}
                      className={`relative px-3.5 py-1.5 min-h-[36px] text-xs font-display font-semibold tracking-wider cursor-pointer transition-colors ${
                        isActive
                          ? 'text-[#F8F7F4]'
                          : 'text-[#5C574F] hover:text-[#191715]'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="hero-deck-tab"
                          transition={FAST_MORPH_SPRING}
                          aria-hidden="true"
                          className="absolute inset-0 bg-[#191715]"
                        />
                      )}
                      <span className="relative z-10">{item.roman}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Core Morph Stage: Multi-Component Choreography inside Copy & Photo Plate */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center my-6 lg:my-auto">
            {/* Editorial Copy Column: Every Element Cascades Individually */}
            <motion.div
              style={isDesktop ? { x: copyX, y: copyY, opacity: copyOpacity } : undefined}
              className="lg:col-span-6 relative z-10 flex flex-col justify-between will-change-transform"
            >
              <AnimatePresence mode="wait">
                <div key={`copy-slide-${chapter.index}`}>
                  {/* 1. Accent Note with Self-Drawing Leading Rule */}
                  <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 14 }}
                    transition={{ duration: 0.42, ease: SILK_EASE }}
                    className="flex items-center gap-2.5 mb-3"
                  >
                    <motion.span
                      aria-hidden="true"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.5, ease: SILK_EASE }}
                      style={{ transformOrigin: '0% 50%' }}
                      className="inline-block w-6 h-[1.5px] bg-[#7A5C38]"
                    />
                    <p className="text-xs font-medium text-[#7A5C38] tracking-[0.04em]">
                      {chapter.accentNote}
                    </p>
                  </motion.div>

                  {/* 2. Word-by-Word Masked Display Headline */}
                  <SplitHeadline
                    as="h1"
                    mode="animate"
                    baseDelay={0.04}
                    text={chapter.headline}
                    className="font-display text-[2.2rem] sm:text-[2.95rem] lg:text-[3.25rem] font-semibold leading-[1.18] tracking-[-0.01em] text-[#191715] max-w-xl"
                  />

                  {/* 3. Body Paragraph Delayed Silk Settle */}
                  <motion.p
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.56, delay: 0.16, ease: SILK_EASE }}
                    className="mt-5 text-[15px] sm:text-base leading-[1.75] text-[#5C574F] max-w-[54ch]"
                  >
                    {chapter.body}
                  </motion.p>
                </div>
              </AnimatePresence>

              {/* 4. Drawing Divider + Independent Staggered CTAs */}
              <div className="mt-7 pt-6 relative">
                <motion.div
                  aria-hidden="true"
                  key={`cta-rule-${chapter.index}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.65, delay: 0.18, ease: SILK_EASE }}
                  style={{ transformOrigin: '0% 50%' }}
                  className="absolute top-0 left-0 right-0 h-[1px] bg-[#DDD8CE]"
                />
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <motion.a
                    key={`cta-primary-${chapter.index}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -2, x: 2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.45, delay: 0.22, ease: SILK_EASE }}
                    href={chapter.ctaHref}
                    className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[44px] bg-[#1F3A2E] text-[#F8F7F4] text-sm font-medium hover:bg-[#162B22] transition-colors whitespace-nowrap"
                  >
                    <span>{chapter.ctaLabel}</span>
                    <ArrowDownRight
                      className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
                      aria-hidden="true"
                    />
                  </motion.a>

                  <motion.a
                    key={`cta-sec-${chapter.index}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.48, delay: 0.3, ease: SILK_EASE }}
                    href="#cua-hang"
                    className="group relative inline-flex items-center py-2.5 text-sm font-medium text-[#191715] hover:text-[#1F3A2E] transition-colors whitespace-nowrap"
                  >
                    <span>Ghé phòng thử nếm &amp; chỉ đường</span>
                    <motion.span
                      aria-hidden="true"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.55, delay: 0.36, ease: SILK_EASE }}
                      style={{ transformOrigin: '0% 50%' }}
                      className="absolute left-0 right-0 bottom-0 h-[1px] bg-[#191715] group-hover:bg-[#1F3A2E] transition-colors"
                    />
                  </motion.a>
                </div>
              </div>
            </motion.div>

            {/* Classical Framed Photo Plate with Parallax Inner Photo & Animated Corners */}
            <motion.div
              style={
                isDesktop
                  ? { x: plateX, scale: plateScale, rotate: plateRotate }
                  : undefined
              }
              onMouseEnter={() => setPlateHovered(true)}
              onMouseLeave={() => setPlateHovered(false)}
              className="lg:col-span-6 relative z-20 will-change-transform"
            >
              <div className="relative border border-[#DDD8CE] bg-[#EFECE6] p-3 sm:p-4 transition-colors duration-300 hover:border-[#7A5C38]">
                <BronzeCorners active={plateHovered} size="md" />

                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#191715]">
                  <motion.div
                    style={
                      isDesktop
                        ? { scale: innerImageScale, y: innerImageY }
                        : undefined
                    }
                    className="w-full h-full will-change-transform"
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`plate-${chapter.index}`}
                        initial={{ opacity: 0, scale: 1.07 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.52, ease: SILK_EASE }}
                        className="w-full h-full"
                      >
                        <SafeImage
                          src={chapter.image}
                          alt={chapter.imageAlt}
                          fallbackTitle={chapter.captionTitle}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
                        />
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Split Opposing Caption Bar */}
                <div className="pt-3 flex flex-wrap items-baseline justify-between gap-2 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`cap-title-${chapter.index}`}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.4, ease: SILK_EASE }}
                      className="font-display text-sm font-semibold text-[#191715]"
                    >
                      {chapter.captionTitle}
                    </motion.span>
                  </AnimatePresence>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`cap-meta-${chapter.index}`}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.4, delay: 0.06, ease: SILK_EASE }}
                      className="font-mono text-[11px] text-[#5C574F]"
                    >
                      {chapter.captionMeta}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom 4-Column Morphing Heritage Ledger (Every Label & Value Cascades Independently) */}
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-l border-[#DDD8CE] bg-[#FFFFFF]">
              {chapter.ledger.map((item, idx) => (
                <div
                  key={`${idx}-${item.label}`}
                  className="relative p-3 sm:p-3.5 border-r border-b border-[#DDD8CE] overflow-hidden"
                >
                  <motion.span
                    aria-hidden="true"
                    key={`cell-accent-${chapter.index}-${idx}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                      duration: 0.55,
                      delay: idx * 0.06,
                      ease: SILK_EASE,
                    }}
                    style={{ transformOrigin: '0% 50%' }}
                    className="absolute top-0 left-0 right-0 h-[1.5px] bg-[#7A5C38]/40"
                  />
                  <AnimatePresence mode="wait">
                    <div key={`ledger-${chapter.index}-${idx}`}>
                      <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{
                          duration: 0.36,
                          delay: idx * 0.045,
                          ease: SILK_EASE,
                        }}
                        className="text-[11px] text-[#5C574F]"
                      >
                        {item.label}
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -14 }}
                        transition={{
                          ...ORGANIC_SPRING,
                          delay: 0.04 + idx * 0.055,
                        }}
                        className="mt-1 text-xs sm:text-sm font-semibold text-[#191715] tabular-nums"
                      >
                        {item.value}
                      </motion.p>
                    </div>
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <div className="hidden lg:block mt-2.5 h-[2px] w-full bg-[#DDD8CE]">
              <motion.div
                style={{ scaleX: progressBarScale, transformOrigin: '0% 50%' }}
                className="h-full bg-[#7A5C38] will-change-transform"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
