import { motion } from "motion/react";
import { SITE } from "@/helpers/content.helper";
import { EASE } from "@/helpers/motion.helper";

const DURATION = 1.55;

/** Entrance overture: name, an accent hairline drawing across, then the panel lifts away. */
export function Curtain({ onDone }: { onDone: () => void }) {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-9 grid place-items-center bg-background"
      initial={{ y: "0%" }}
      animate={{ y: ["0%", "0%", "-101%"] }}
      transition={{
        duration: DURATION,
        times: [0, 0.58, 1],
        ease: ["linear", [0.76, 0, 0.24, 1]]
      }}
      onAnimationComplete={onDone}>
      <motion.div
        className="flex flex-col items-center gap-[clamp(14px,2vh,22px)] font-mono text-[clamp(9px,1vw,11px)] tracking-[0.34em] uppercase"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: [0, 1, 1, 0], y: [12, 0, 0, -10] }}
        transition={{
          duration: DURATION,
          times: [0, 0.26, 0.66, 1],
          ease: "easeInOut"
        }}>
        <span className="text-muted-foreground">{SITE.name}</span>
        <motion.i
          className="block h-px w-[clamp(120px,22vw,260px)] origin-left bg-primary"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: [0, 1, 1] }}
          transition={{ duration: DURATION, times: [0, 0.52, 1], ease: EASE }}
        />
        <span className="text-faint">
          {SITE.index.eyebrow.replace(" — ", " ")}
        </span>
      </motion.div>
    </motion.div>
  );
}
