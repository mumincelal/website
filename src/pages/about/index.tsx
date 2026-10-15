import { motion } from "motion/react";
import { GUTTER, PAD_Y_STATEMENT, Rule, Screen } from "@/components/primitives";
import { cn } from "@/utils/cn";
import { ABOUT } from "@/utils/content";
import { fade, rise } from "@/utils/motion";

export function AboutPage() {
  return (
    <Screen
      aria-label="About"
      className={cn(
        "flex flex-col justify-center-safe gap-8",
        GUTTER,
        PAD_Y_STATEMENT
      )}>
      <motion.div {...fade()} className="mono-eyebrow">
        {ABOUT.eyebrow}
      </motion.div>
      <motion.p
        {...rise(0.06)}
        className="max-w-[20ch] text-[clamp(24px,3.4vw,56px)] leading-none font-semibold tracking-[-0.04em] text-balance"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: build-time HTML from our own src/content Markdown
        dangerouslySetInnerHTML={{ __html: ABOUT.statementHtml }}
      />
      <Rule delay={0.18} className="max-w-[900px]" />
      <motion.div
        {...rise(0.26)}
        className="grid max-w-[900px] grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-[clamp(18px,2.6vw,40px)]">
        {ABOUT.columns.map((c) => (
          <div key={c.title} className="flex flex-col gap-2">
            <div className="mono-label">{c.title}</div>
            <p className="text-sm leading-[1.6] text-pretty text-muted-foreground">
              {c.text}
            </p>
          </div>
        ))}
      </motion.div>
    </Screen>
  );
}
