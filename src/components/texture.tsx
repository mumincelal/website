import { motion, useReducedMotion } from "motion/react";
import { loop } from "@/utils/motion";

/** Sparse dot field behind everything, drifting diagonally on a compositor-only transform. */
export function Texture() {
  // Endless loops are pure decoration: hold still when the OS asks for reduced motion.
  const still = useReducedMotion();
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        {...(still ? {} : loop({ x: 0, y: 0 }, { x: 120, y: 120 }, 64))}
        className="absolute -inset-[130px] bg-[radial-gradient(var(--color-faint)_1px,transparent_1.4px)] bg-size-[120px_120px] bg-position-[11px_41px] opacity-60"
      />
    </div>
  );
}
