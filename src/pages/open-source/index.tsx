import { motion } from "motion/react";
import { GUTTER, PAD_Y, Screen, SectionTitle } from "@/components/primitives";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { pad, REPOS } from "@/helpers/content.helper";
import { rise } from "@/helpers/motion.helper";
import { cn } from "@/lib/utils";

/** Cards show the first six; the rest live in the "All repos" index. */
const CARD_LIMIT = 6;

/** First sentence, cut to ~68 characters so the stars · licence footer always stays visible. */
function teaser(summary: string): string {
  const t = summary.split(". ")[0];
  return t.length > 68
    ? `${t.slice(0, 66).replace(/[\s,;:]+$/, "")}…`
    : t.replace(/\.?$/, ".");
}

interface Props {
  onOpen: (i: number) => void;
  onOpenAll: () => void;
}

export function OpenSourcePage({ onOpen, onOpenAll }: Props) {
  const count = pad(REPOS.length);
  return (
    <Screen
      aria-label="Open source"
      className={cn(
        "grid grid-cols-1 content-start gap-6 md:grid-rows-[auto_1fr] md:content-normal",
        GUTTER,
        PAD_Y
      )}>
      <motion.div {...rise()} className="flex items-end justify-between gap-6">
        <SectionTitle>Open source</SectionTitle>
        <div className="flex items-baseline gap-cluster font-mono text-eyebrow tracking-label-wide uppercase">
          <span className="hidden text-muted-foreground sm:inline">
            {count} public repos
          </span>
          <Button
            variant="ghost"
            size="none"
            className="text-eyebrow tracking-label"
            onClick={onOpenAll}>
            All repos ({count}) →
          </Button>
        </div>
      </motion.div>

      <div className="grid auto-rows-[minmax(220px,auto)] grid-cols-[repeat(auto-fit,minmax(clamp(200px,20vw,270px),1fr))] gap-[clamp(10px,1.4vw,20px)] md:min-h-0 md:overflow-hidden md:auto-rows-[minmax(0,1fr)]">
        {REPOS.slice(0, CARD_LIMIT).map((r, i) => (
          <Card
            key={r.slug}
            render={
              <motion.button
                {...rise(0.05 * i)}
                type="button"
                onClick={() => onOpen(i)}
              />
            }
            className="relative min-h-0 justify-between gap-[clamp(10px,1.8vh,26px)] overflow-hidden p-[clamp(12px,1.6vw,24px)] text-left transition-colors duration-300 hover:border-primary hover:bg-accent">
            <span
              aria-hidden="true"
              className="text-outline pointer-events-none absolute top-1/2 left-[clamp(12px,1.6vw,24px)] -translate-y-[56%] font-mono text-[min(8vw,clamp(44px,13vh,128px))] leading-numeral font-bold">
              {pad(i + 1)}
            </span>
            <span className="mono-label relative flex items-center justify-between gap-3">
              <span>{pad(i + 1)} — Repository</span>
              <span className="sr-only">GitHub</span>
              <span
                aria-hidden="true"
                className="flex size-6.5 shrink-0 items-center justify-center rounded-full border text-micro tracking-[0.04em] text-fg2">
                GH
              </span>
            </span>
            <span className="relative flex min-w-0 flex-col gap-[clamp(6px,1vh,13px)]">
              <span className="truncate font-mono text-[clamp(18px,5vw,26px)] leading-title font-bold tracking-title text-foreground md:text-[min(2.3vw,clamp(15px,3.4vh,34px))]">
                {r.name}
              </span>
              <span className="min-h-0 overflow-hidden text-body-sm leading-normal text-pretty text-muted-foreground">
                {teaser(r.summaryText)}
              </span>
              <span className="flex min-w-0 items-center justify-between gap-3 border-t pt-[clamp(6px,1vh,13px)] font-mono text-label tracking-label text-primary uppercase">
                <span className="truncate">
                  {r.stars} stars · {r.license}
                </span>
                <span className="text-faint">↗</span>
              </span>
            </span>
          </Card>
        ))}
      </div>
    </Screen>
  );
}
