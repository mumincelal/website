import type { MotionProps, Transition } from "motion/react";

/**
 * Motion presets for the whole site: one easing curve and one duration scale.
 * Travel distances read the --travel-* CSS variables (globals.css), which shrink
 * below 860px, so phones get shorter, opacity-led motion without a JS media query.
 * Spread a preset onto any motion element: <motion.div {...rise(0.28)} />
 */

/** The site's single easing curve (expo out). */
export const EASE = [0.16, 1, 0.3, 1] as const;

const expo = (duration: number, delay = 0): Transition => ({
  duration,
  delay,
  ease: EASE
});

type Preset = Pick<MotionProps, "initial" | "animate" | "transition">;

/** Plain fade, for labels and bars. */
export const fade = (delay = 0, duration = 0.5): Preset => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration, delay, ease: "easeInOut" }
});

/** Fade while rising into place. */
export const rise = (delay = 0, duration = 0.7): Preset => ({
  initial: { opacity: 0, y: "var(--travel-y)" },
  animate: { opacity: 1, y: 0 },
  transition: expo(duration, delay)
});

/** Hairline drawn from left to right. */
export const wipe = (delay = 0): Preset => ({
  initial: { clipPath: "inset(0% 100% 0% 0%)" },
  animate: { clipPath: "inset(0% 0% 0% 0%)" },
  transition: expo(0.9, delay)
});

/** Display type rising out of a clipped line box (pair with an overflow-hidden parent). */
export const maskUp = (delay = 0): Preset => ({
  initial: { y: "108%" },
  animate: { y: "0%" },
  transition: expo(0.9, delay)
});

/** Carousel content entering from the side it came from. */
export const slideIn = (dir: 1 | -1): Preset => ({
  initial: {
    opacity: 0,
    x: dir < 0 ? "var(--travel-x-back)" : "var(--travel-x)"
  },
  animate: { opacity: 1, x: 0 },
  transition: expo(0.7)
});

/** Footer numeral rolling up out of its clipped box. */
export const roll: Preset = {
  initial: { opacity: 0, y: "60%" },
  animate: { opacity: 1, y: "0%" },
  transition: expo(0.5)
};

/** Endless linear loop between two transforms (marquee, dot-field drift). */
export const loop = (
  from: Record<string, number | string>,
  to: Record<string, number | string>,
  duration: number
): Preset => ({
  initial: from,
  animate: to,
  transition: { duration, ease: "linear", repeat: Infinity, repeatType: "loop" }
});
