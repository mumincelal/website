import { motion } from "motion/react";
import {
  GUTTER,
  MaskLine,
  PAD_Y_STATEMENT,
  Rule,
  Screen
} from "@/components/primitives";
import { cn } from "@/utils/cn";
import { SITE } from "@/utils/content";
import { fade, rise } from "@/utils/motion";

export function HomePage() {
  const { eyebrow, headline, facts } = SITE.index;
  return (
    <Screen
      aria-label="Index"
      className={cn(
        "flex flex-col justify-center-safe gap-[clamp(12px,2.4vh,32px)]",
        GUTTER,
        PAD_Y_STATEMENT
      )}>
      <motion.div {...fade()} className="mono-eyebrow">
        {eyebrow}
      </motion.div>
      <h1 className="text-[clamp(34px,6.8vw,118px)] leading-[0.84] font-extrabold tracking-[-0.05em] text-balance">
        {headline.map((line, i) => (
          <MaskLine
            key={line}
            delay={0.06 + i * 0.11}
            className={cn("pb-[0.04em]", i > 0 && "text-faint")}>
            {line}
          </MaskLine>
        ))}
      </h1>
      <Rule delay={0.2} />
      <motion.div
        {...rise(0.28)}
        className="grid max-w-[900px] grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-[clamp(18px,2.6vw,40px)]">
        <p
          className="text-base leading-[1.55] text-pretty text-fg2"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: build-time HTML from our own src/content Markdown
          dangerouslySetInnerHTML={{ __html: SITE.introHtml }}
        />
        {facts.map((col) => (
          <div
            key={col.join()}
            className="font-mono text-[11px] leading-[2.1] tracking-[0.1em] text-muted-foreground uppercase">
            {col.map((f) => (
              <div key={f}>{f}</div>
            ))}
          </div>
        ))}
      </motion.div>
    </Screen>
  );
}
