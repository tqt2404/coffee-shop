import type { Transition } from 'motion/react';

/**
 * Classical-modern PowerPoint Morph motion tokens.
 * Tuned for liquid-smooth organic deceleration (silky inertial scroll + weighted springs).
 */
export const SILK_EASE: [number, number, number, number] = [0.19, 1, 0.22, 1];
export const EDITORIAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Silky inertial spring for useScroll -> useSpring smoothing (absorbs choppy mouse-wheel ticks) */
export const SILKY_SCROLL_SPRING = {
  stiffness: 76,
  damping: 24,
  mass: 0.55,
  restDelta: 0.0005,
};

export const MORPH_SPRING: Transition = {
  type: 'spring',
  stiffness: 220,
  damping: 28,
  mass: 0.9,
};

export const ORGANIC_SPRING: Transition = {
  type: 'spring',
  stiffness: 185,
  damping: 26,
  mass: 0.85,
};

export const FAST_MORPH_SPRING: Transition = {
  type: 'spring',
  stiffness: 340,
  damping: 30,
  mass: 0.78,
};

export const EDITORIAL_TRANSITION: Transition = {
  duration: 0.62,
  ease: SILK_EASE,
};

export const VIEWPORT_REPLAY = {
  once: false,
  amount: 0.15 as const,
};

export const VIEWPORT_ONCE = {
  once: true,
  amount: 0.15 as const,
};
