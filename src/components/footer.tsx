import { motion, useReducedMotion } from "motion/react";
import { pad, SITE } from "@/utils/content";
import { loop, roll } from "@/utils/motion";
import { SECTIONS } from "@/utils/nav";

export function Footer({ active }: { active: number }) {
  // Repeat the line so one copy always fills the bar; two copies make the loop seamless.
  const line = `${Array(3).fill(SITE.marquee).join(" — ")} — `;
  const still = useReducedMotion();
  return (
    <footer className="relative z-2 grid min-h-0 grid-cols-[auto_minmax(0,1fr)] items-center overflow-hidden border-t bg-background md:grid-cols-[auto_1fr_auto]">
      <div className="flex h-full items-center gap-2.5 border-r px-[26px]">
        <span className="block h-[1em] overflow-hidden font-mono text-[22px] leading-none font-medium text-primary">
          {/* keyed so the numeral rolls in on every section change */}
          <motion.span key={active} className="block" {...roll}>
            {pad(active + 1)}
          </motion.span>
        </span>
        <span className="font-mono text-[10px] tracking-[0.12em] text-faint uppercase">
          / {pad(SECTIONS.length)}
        </span>
      </div>

      <div
        aria-hidden="true"
        className="flex h-full items-center overflow-hidden whitespace-nowrap">
        <motion.div
          className="flex"
          {...(still ? {} : loop({ x: "0%" }, { x: "-50%" }, 34))}>
          {[0, 1].map((k) => (
            <span
              key={k}
              className="pr-11 font-mono text-[10px] tracking-[0.22em] text-faint uppercase">
              {line}
            </span>
          ))}
        </motion.div>
      </div>

      <div className="hidden h-full items-center gap-4 border-l px-[22px] font-mono text-[10px] tracking-[0.1em] whitespace-nowrap text-faint uppercase md:flex">
        <span>← → move</span>
        <span>1–{SECTIONS.length} jump</span>
        <span>T theme</span>
      </div>
    </footer>
  );
}
