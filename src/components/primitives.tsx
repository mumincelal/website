import { motion } from "motion/react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/utils/cn";
import { fade, maskUp, wipe } from "@/utils/motion";

/**
 * One full-screen view inside <main>. Desktop: a fixed frame that clips.
 * Below 860px: the screen scrolls its own content.
 */
export function Screen({
  className,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "absolute inset-0 min-h-0 overflow-auto overscroll-contain md:overflow-hidden",
        className
      )}
      {...props}
    />
  );
}

/** Horizontal page gutter and the two vertical rhythms used by screens. */
export const GUTTER = "px-[clamp(24px,4vw,60px)]";
export const PAD_Y = "py-[clamp(16px,3vh,42px)]";
export const PAD_Y_STATEMENT = "py-[clamp(18px,3.6vh,52px)]";

/** Hairline that draws itself left to right: the shadcn Separator rendered as a motion element. */
export function Rule({
  delay,
  className
}: {
  delay?: number;
  className?: string;
}) {
  return (
    <Separator className={className} render={<motion.div {...wipe(delay)} />} />
  );
}

/** Display type that rises out of a clipped line box. */
export function MaskLine({
  children,
  delay,
  className
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <span className={cn("block overflow-hidden pb-[0.06em]", className)}>
      <motion.span className="block" {...maskUp(delay)}>
        {children}
      </motion.span>
    </span>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[clamp(24px,3.4vw,56px)] leading-[0.9] font-extrabold tracking-[-0.04em]">
      <MaskLine>{children}</MaskLine>
    </h2>
  );
}

export function IndexTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[clamp(22px,3vw,46px)] leading-[0.9] font-extrabold tracking-[-0.04em]">
      {children}
    </h2>
  );
}

/** "← Work" */
export function BackButton({
  label,
  onClick
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="none"
      onClick={onClick}
      className="gap-[9px] text-[11px] tracking-[0.14em] uppercase">
      <span aria-hidden="true">←</span>
      <span>{label}</span>
    </Button>
  );
}

/**
 * Detail-view top bar: back link on the left; external link, counter and prev / next on the right.
 * Below 680px the tools take their own full-width row and the link uses its short label.
 */
export function DetailBar({
  back,
  onBack,
  href,
  linkLabel,
  shortLabel,
  position,
  onStep
}: {
  back: string;
  onBack: () => void;
  href: string;
  linkLabel: string;
  shortLabel: string;
  position: string;
  onStep: (d: number) => void;
}) {
  return (
    <motion.div
      {...fade()}
      className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 sm:flex-nowrap">
      <BackButton label={back} onClick={onBack} />
      <div className="flex w-full items-center justify-between gap-3.5 font-mono text-[11px] tracking-[0.12em] whitespace-nowrap text-faint uppercase sm:w-auto">
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
          className="tracking-[0.14em] text-primary transition-colors duration-300 hover:text-foreground pointer-coarse:hit-area">
          <span className="sm:hidden">{shortLabel}</span>
          <span className="hidden sm:inline">{linkLabel}</span> ↗
        </a>
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <span>{position}</span>
          <Button variant="outline" onClick={() => onStep(-1)}>
            Prev
          </Button>
          <Button variant="outline" onClick={() => onStep(1)}>
            Next
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/** Display-type index row (All works, All repos): indents and fills on hover. */
export const INDEX_ROW =
  "relative grid items-center gap-[clamp(12px,2vw,30px)] border-t px-[clamp(6px,0.8vw,14px)] text-left [transition:background-color_0.3s_ease,padding_0.5s_var(--ease-expo)] hover:bg-accent hover:pl-[clamp(16px,2vw,34px)]";
