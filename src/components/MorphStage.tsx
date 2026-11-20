import { createContext, useContext, useRef, type ReactNode } from 'react';
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { SILK_EASE, SILKY_SCROLL_SPRING } from '../utils/motion';

const MorphScrollContext = createContext<MotionValue<number> | null>(null);

export function usePageMorphProgress(): MotionValue<number> | null {
  return useContext(MorphScrollContext);
}

interface MorphPageProps {
  id: string;
  pageNumber: string;
  pageTotal?: string;
  chapterTitle: string;
  bgClass?: string;
  children: ReactNode;
}

/**
 * Full-page architectural section driven by silky inertial scroll physics.
 * Every child MorphLayer / MorphRule / MorphParallaxImage reads the same smoothProgress
 * so all components choreograph smoothly IN on entry, rest crisply at 100%, and glide OUT on exit.
 */
export function MorphPage({
  id,
  pageNumber,
  pageTotal = '07',
  chapterTitle,
  bgClass = 'bg-[#F8F7F4]',
  children,
}: MorphPageProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, SILKY_SCROLL_SPRING);

  const topRuleScale = useTransform(smoothProgress, [0.02, 0.24, 0.8, 0.98], [0, 1, 1, 0]);
  const folioOpacity = useTransform(smoothProgress, [0.02, 0.18, 0.82, 0.96], [0, 1, 1, 0]);
  const folioLeftX = useTransform(smoothProgress, [0.02, 0.2, 0.82, 0.96], [-28, 0, 0, -24]);
  const folioRightX = useTransform(smoothProgress, [0.02, 0.2, 0.82, 0.96], [28, 0, 0, 24]);

  // Subtle classical architectural watermark numeral drifting in parallax depth
  const watermarkY = useTransform(smoothProgress, [0, 1], [60, -60]);
  const watermarkOpacity = useTransform(smoothProgress, [0.05, 0.25, 0.78, 0.96], [0, 1, 1, 0]);

  return (
    <section
      id={id}
      ref={sectionRef}
      data-morph-page={pageNumber}
      className={`relative min-h-[88vh] flex flex-col justify-center py-16 lg:py-24 border-b border-[#DDD8CE] overflow-x-clip ${bgClass}`}
    >
      {/* Ultra-subtle flat classical page numeral watermark drifting in background depth */}
      <motion.span
        aria-hidden="true"
        style={{ y: watermarkY, opacity: watermarkOpacity }}
        className="pointer-events-none select-none hidden xl:block absolute right-10 top-14 font-display text-[11rem] leading-none font-semibold text-[#191715]/[0.032] will-change-transform"
      >
        {pageNumber}
      </motion.span>

      <MorphScrollContext.Provider value={smoothProgress}>
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          {/* Classical Folio Marker + Self-Drawing Hairline Rule */}
          <div className="mb-8 lg:mb-10">
            <div className="flex items-center justify-between gap-4 text-xs mb-3">
              <motion.span
                style={{ opacity: folioOpacity, x: folioLeftX }}
                className="font-mono text-[#7A5C38] tracking-[0.14em] inline-flex items-center gap-2 will-change-transform"
              >
                <span aria-hidden="true" className="inline-block w-4 h-[1px] bg-[#7A5C38]" />
                <span>
                  TRANG {pageNumber} / {pageTotal}
                </span>
              </motion.span>
              <motion.span
                style={{ opacity: folioOpacity, x: folioRightX }}
                className="text-[#5C574F] tracking-[0.06em] will-change-transform"
              >
                {chapterTitle}
              </motion.span>
            </div>
            <motion.div
              aria-hidden="true"
              style={{ scaleX: topRuleScale, transformOrigin: '0% 50%' }}
              className="h-[1px] w-full bg-[#191715]/25 will-change-transform"
            />
          </div>

          {children}
        </div>
      </MorphScrollContext.Provider>
    </section>
  );
}

export type MorphVector =
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'scale'
  | 'plate'
  | 'tilt-left'
  | 'tilt-right';

interface MorphLayerProps {
  children: ReactNode;
  vector?: MorphVector;
  /** Sequential offset (0 to 0.14) so sibling and child components ripple naturally */
  stagger?: number;
  /** Travel distance scale (default 1; use 0.35–0.6 for micro-components inside cards) */
  distance?: number;
  className?: string;
}

/**
 * Multi-plane scroll-driven Morph element with curved ease-out entry,
 * crystal-clear full-opacity resting plateau, and organic staggered exit.
 */
export function MorphLayer({
  children,
  vector = 'up',
  stagger = 0,
  distance = 1,
  className = '',
}: MorphLayerProps) {
  const progress = useContext(MorphScrollContext);
  const fallbackRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress: localProgress } = useScroll({
    target: fallbackRef,
    offset: ['start end', 'end start'],
  });

  const active = progress ?? localProgress;

  // Curved 6-stop interpolation range gives silky deceleration (fast start, gentle landing)
  const e0 = Math.min(0.18, 0.02 + stagger);
  const e1 = Math.min(0.28, e0 + 0.085);
  const e2 = Math.min(0.38, e0 + 0.19);
  const x0 = Math.max(0.7, 0.81 - stagger * 0.45);
  const x1 = Math.min(0.92, x0 + 0.085);
  const x2 = Math.min(0.99, x0 + 0.16);

  const range = [e0, e1, e2, x0, x1, x2];
  const d = distance;

  const xMap: [number, number, number, number, number, number] =
    vector === 'left' || vector === 'tilt-left'
      ? [-68 * d, -18 * d, 0, 0, -16 * d, -58 * d]
      : vector === 'right' || vector === 'tilt-right'
        ? [68 * d, 18 * d, 0, 0, 16 * d, 58 * d]
        : [0, 0, 0, 0, 0, 0];

  const yMap: [number, number, number, number, number, number] =
    vector === 'up'
      ? [52 * d, 13 * d, 0, 0, -12 * d, -44 * d]
      : vector === 'down'
        ? [-42 * d, -10 * d, 0, 0, 10 * d, 38 * d]
        : vector === 'plate'
          ? [48 * d, 12 * d, 0, 0, -11 * d, -40 * d]
          : vector === 'tilt-left' || vector === 'tilt-right'
            ? [32 * d, 8 * d, 0, 0, -8 * d, -28 * d]
            : [0, 0, 0, 0, 0, 0];

  const scaleMap: [number, number, number, number, number, number] =
    vector === 'plate'
      ? [0.92, 0.982, 1, 1, 0.985, 0.94]
      : vector === 'scale'
        ? [0.89, 0.975, 1, 1, 0.98, 0.92]
        : [1, 1, 1, 1, 1, 1];

  const rotateMap: [number, number, number, number, number, number] =
    vector === 'tilt-left'
      ? [-1.6 * d, -0.35 * d, 0, 0, -0.3 * d, -1.2 * d]
      : vector === 'tilt-right'
        ? [1.6 * d, 0.35 * d, 0, 0, 0.3 * d, 1.2 * d]
        : [0, 0, 0, 0, 0, 0];

  const x = useTransform(active, range, xMap);
  const y = useTransform(active, range, yMap);
  const scale = useTransform(active, range, scaleMap);
  const rotate = useTransform(active, range, rotateMap);
  const opacity = useTransform(active, range, [0, 0.78, 1, 1, 0.8, 0.04]);

  return (
    <motion.div
      ref={fallbackRef}
      style={{ x, y, scale, rotate, opacity }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
}

interface MorphRuleProps {
  stagger?: number;
  origin?: 'left' | 'right' | 'center';
  className?: string;
}

/**
 * Self-drawing architectural hairline rule synced to page scroll.
 */
export function MorphRule({
  stagger = 0,
  origin = 'left',
  className = 'h-[1px] w-full bg-[#DDD8CE]',
}: MorphRuleProps) {
  const progress = useContext(MorphScrollContext);
  const fallbackRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress: localProgress } = useScroll({
    target: fallbackRef,
    offset: ['start end', 'end start'],
  });
  const active = progress ?? localProgress;

  const start = Math.min(0.24, 0.05 + stagger);
  const end = Math.min(0.4, start + 0.16);
  const exitStart = Math.max(0.72, 0.82 - stagger * 0.4);
  const exitEnd = Math.min(0.98, exitStart + 0.14);

  const scaleX = useTransform(active, [start, end, exitStart, exitEnd], [0, 1, 1, 0]);
  const transformOrigin =
    origin === 'right' ? '100% 50%' : origin === 'center' ? '50% 50%' : '0% 50%';

  return (
    <motion.div
      ref={fallbackRef}
      aria-hidden="true"
      style={{ scaleX, transformOrigin }}
      className={`will-change-transform ${className}`}
    />
  );
}

interface MorphParallaxImageProps {
  children: ReactNode;
  drift?: number;
  className?: string;
}

/**
 * Continuous depth parallax for photography inside framed containers.
 * Image gently glides and breathes inside its frame as the user scrolls past.
 */
export function MorphParallaxImage({
  children,
  drift = 16,
  className = 'w-full h-full',
}: MorphParallaxImageProps) {
  const progress = useContext(MorphScrollContext);
  const fallbackRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress: localProgress } = useScroll({
    target: fallbackRef,
    offset: ['start end', 'end start'],
  });
  const active = progress ?? localProgress;

  const y = useTransform(active, [0, 0.5, 1], [-drift, 0, drift]);
  const scale = useTransform(active, [0.02, 0.35, 0.72, 1], [1.12, 1.03, 1.02, 1.09]);

  return (
    <motion.div
      ref={fallbackRef}
      style={{ y, scale }}
      className={`will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
}

interface SplitHeadlineProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
  /** 'animate' for immediate mount/slide transitions, 'inView' for scroll-triggered headlines */
  mode?: 'animate' | 'inView';
  baseDelay?: number;
}

interface ScrollMorphWordProps {
  word: string;
  index: number;
  progress: MotionValue<number>;
}

function ScrollMorphWord({ word, index, progress }: ScrollMorphWordProps) {
  const step = Math.min(0.11, index * 0.011);
  const e0 = 0.02 + step;
  const e1 = Math.min(0.28, e0 + 0.08);
  const e2 = Math.min(0.36, e0 + 0.16);
  const x0 = Math.max(0.72, 0.82 - step * 0.35);
  const x1 = Math.min(0.93, x0 + 0.08);
  const x2 = Math.min(0.99, x0 + 0.15);

  const range = [e0, e1, e2, x0, x1, x2];
  const y = useTransform(progress, range, ['108%', '22%', '0%', '0%', '-18%', '-104%']);
  const opacity = useTransform(progress, range, [0, 0.82, 1, 1, 0.82, 0]);
  const rotate = useTransform(progress, range, [2.2, 0.45, 0, 0, -0.4, -1.8]);

  return (
    <span className="inline-block overflow-hidden align-top pb-[0.12em] -mb-[0.12em] mr-[0.26em] last:mr-0">
      <motion.span
        style={{ y, opacity, rotate }}
        className="inline-block will-change-transform"
      >
        {word}
      </motion.span>
    </span>
  );
}

/**
 * Editorial word-by-word masked curtain reveal.
 * - mode="inView": driven continuously by the parent MorphPage's silky scroll progress.
 * - mode="animate": immediate silk word cascade for slide/tab transitions.
 */
export function SplitHeadline({
  text,
  className = '',
  as = 'h2',
  mode = 'inView',
  baseDelay = 0,
}: SplitHeadlineProps) {
  const words = text.split(' ');
  const pageProgress = useContext(MorphScrollContext);
  const Tag = as;

  if (mode === 'inView' && pageProgress) {
    return (
      <Tag className={className}>
        {words.map((word, index) => (
          <ScrollMorphWord
            key={`${word}-${index}`}
            word={word}
            index={index}
            progress={pageProgress}
          />
        ))}
      </Tag>
    );
  }

  return (
    <Tag className={className}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="inline-block overflow-hidden align-top pb-[0.12em] -mb-[0.12em] mr-[0.26em] last:mr-0"
        >
          <motion.span
            className="inline-block will-change-transform"
            initial={{ y: '108%', opacity: 0.01, rotate: 1.8 }}
            animate={{ y: '0%', opacity: 1, rotate: 0 }}
            transition={{
              duration: 0.65,
              delay: baseDelay + index * 0.03,
              ease: SILK_EASE,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

interface BronzeCornersProps {
  /** Whether corners expand slightly when parent card is hovered */
  active?: boolean;
  size?: 'sm' | 'md';
}

/**
 * Animated antique-bronze architectural corner brackets for cards and photo plates.
 */
export function BronzeCorners({ active = false, size = 'sm' }: BronzeCornersProps) {
  const dim = size === 'md' ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5';
  const tl = size === 'md' ? 'border-t-2 border-l-2' : 'border-t border-l';
  const tr = size === 'md' ? 'border-t-2 border-r-2' : 'border-t border-r';
  const bl = size === 'md' ? 'border-b-2 border-l-2' : 'border-b border-l';
  const br = size === 'md' ? 'border-b-2 border-r-2' : 'border-b border-r';
  const shift = active ? 2 : 0;

  return (
    <>
      <motion.span
        aria-hidden="true"
        animate={{
          x: -shift,
          y: -shift,
          opacity: active ? 1 : 0.72,
          scale: active ? 1.12 : 1,
        }}
        transition={{ duration: 0.35, ease: SILK_EASE }}
        className={`pointer-events-none absolute top-1.5 left-1.5 ${dim} ${tl} border-[#7A5C38]`}
      />
      <motion.span
        aria-hidden="true"
        animate={{
          x: shift,
          y: -shift,
          opacity: active ? 1 : 0.72,
          scale: active ? 1.12 : 1,
        }}
        transition={{ duration: 0.35, ease: SILK_EASE }}
        className={`pointer-events-none absolute top-1.5 right-1.5 ${dim} ${tr} border-[#7A5C38]`}
      />
      <motion.span
        aria-hidden="true"
        animate={{
          x: -shift,
          y: shift,
          opacity: active ? 1 : 0.72,
          scale: active ? 1.12 : 1,
        }}
        transition={{ duration: 0.35, ease: SILK_EASE }}
        className={`pointer-events-none absolute bottom-1.5 left-1.5 ${dim} ${bl} border-[#7A5C38]`}
      />
      <motion.span
        aria-hidden="true"
        animate={{
          x: shift,
          y: shift,
          opacity: active ? 1 : 0.72,
          scale: active ? 1.12 : 1,
        }}
        transition={{ duration: 0.35, ease: SILK_EASE }}
        className={`pointer-events-none absolute bottom-1.5 right-1.5 ${dim} ${br} border-[#7A5C38]`}
      />
    </>
  );
}
