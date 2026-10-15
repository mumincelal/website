import { motion } from "motion/react";
import { GUTTER, PAD_Y, Screen, SectionTitle } from "@/components/primitives";
import { PATH } from "@/helpers/content.helper";
import { rise } from "@/helpers/motion.helper";
import { cn } from "@/lib/utils";

export function PathPage() {
  return (
    <Screen
      aria-label="Path"
      className={cn(
        "grid grid-cols-1 content-start gap-6 md:grid-rows-[auto_1fr] md:content-normal",
        GUTTER,
        PAD_Y
      )}>
      <motion.div {...rise()} className="flex items-end justify-between gap-6">
        <SectionTitle>Path</SectionTitle>
        <span className="font-mono text-eyebrow tracking-label-wide text-muted-foreground uppercase">
          {PATH.label}
        </span>
      </motion.div>
      <div className="flex flex-col">
        {PATH.entries.map((e, i) => (
          <motion.div
            key={e.when}
            {...rise(0.08 * (i + 1))}
            className="grid grid-cols-1 items-baseline gap-1.5 border-t py-[clamp(9px,1.7vh,18px)] transition-colors duration-300 last:border-b hover:bg-accent sm:grid-cols-[clamp(104px,11vw,128px)_minmax(0,1fr)_minmax(0,1.15fr)] sm:gap-5">
            <span
              className={cn(
                "font-mono text-eyebrow tracking-widest whitespace-nowrap",
                i === 0 ? "text-primary" : "text-muted-foreground"
              )}>
              {e.when}
            </span>
            <span className="text-[clamp(15px,1.55vw,19px)] font-semibold tracking-[-0.02em]">
              {e.title}
            </span>
            <span className="text-body-sm leading-normal text-pretty text-muted-foreground">
              {e.text}
            </span>
          </motion.div>
        ))}
      </div>
    </Screen>
  );
}
