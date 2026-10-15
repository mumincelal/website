import { motion } from "motion/react";
import { GUTTER, PAD_Y_STATEMENT, Rule, Screen } from "@/components/primitives";
import { cn } from "@/utils/cn";
import { SITE } from "@/utils/content";
import { fade, maskUp, rise } from "@/utils/motion";

export function ContactPage() {
  const { eyebrow, links } = SITE.contact;
  return (
    <Screen
      aria-label="Contact"
      className={cn(
        "flex flex-col justify-center-safe gap-[30px]",
        GUTTER,
        PAD_Y_STATEMENT
      )}>
      <motion.div {...fade()} className="mono-eyebrow">
        {eyebrow}
      </motion.div>
      <a
        href={`mailto:${SITE.email}`}
        className="block overflow-hidden pb-[0.05em] text-[clamp(28px,4.9vw,84px)] leading-[0.95] font-extrabold tracking-[-0.05em] wrap-anywhere text-foreground transition-colors duration-300 hover:text-primary">
        <motion.span {...maskUp(0.08)} className="block">
          {SITE.email}
        </motion.span>
      </a>
      <Rule delay={0.18} />
      <motion.div
        {...rise(0.26)}
        className="flex flex-wrap gap-x-[34px] gap-y-3.5 font-mono text-xs tracking-[0.12em] uppercase">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            className="inline-flex items-center text-primary transition-colors duration-300 hover:text-foreground pointer-coarse:min-h-11">
            {l.label} ↗
          </a>
        ))}
      </motion.div>
    </Screen>
  );
}
