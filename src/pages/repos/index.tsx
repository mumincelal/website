import { motion } from "motion/react";
import {
  BackButton,
  GUTTER,
  INDEX_ROW,
  IndexTitle,
  Screen
} from "@/components/primitives";
import { cn } from "@/utils/cn";
import { pad, REPOS } from "@/utils/content";
import { fade } from "@/utils/motion";

interface Props {
  onOpen: (i: number) => void;
  onClose: () => void;
}

export function AllReposPage({ onOpen, onClose }: Props) {
  return (
    <Screen
      aria-label="All repos"
      className={cn(
        "grid grid-cols-1 content-start gap-[clamp(10px,1.8vh,20px)] pt-[clamp(16px,3vh,42px)] pb-[clamp(56px,9vh,84px)] md:grid-rows-[auto_1fr] md:content-normal",
        GUTTER
      )}>
      <motion.div
        {...fade()}
        className="flex items-center justify-between gap-6">
        <div className="flex flex-wrap items-baseline gap-x-[18px] gap-y-1.5">
          <IndexTitle>All repos</IndexTitle>
          <span className="mono-label hidden sm:inline">
            {pad(REPOS.length)} public · MIT unless noted
          </span>
        </div>
        <BackButton label="Open source" onClick={onClose} />
      </motion.div>

      {/* Past ten entries the index splits into two columns. */}
      <div
        className={cn(
          "grid grid-cols-1 content-start gap-x-[clamp(20px,3vw,48px)] md:min-h-0 md:overflow-y-auto",
          REPOS.length > 10 && "sm:grid-cols-2"
        )}>
        {REPOS.map((r, i) => (
          <button
            type="button"
            key={r.slug}
            onClick={() => onOpen(i)}
            className={cn(
              INDEX_ROW,
              "py-[clamp(3px,0.8vh,11px)]",
              "grid-cols-[30px_minmax(0,1fr)_auto] sm:grid-cols-[clamp(26px,3.5vw,44px)_minmax(0,1.1fr)_minmax(0,1.4fr)_clamp(80px,8vw,104px)_clamp(76px,8vw,104px)]"
            )}>
            <span className="font-mono text-[10px] tracking-[0.1em] text-faint">
              {pad(i + 1)}
            </span>
            <span className="truncate font-mono text-[clamp(13px,1.9vh,22px)] font-bold tracking-[-0.03em] text-foreground">
              {r.name}
            </span>
            <span className="hidden truncate text-[12.5px] text-muted-foreground sm:block">
              {r.summaryText.split(/[.,]/)[0]}
            </span>
            <span className="font-mono text-[10px] tracking-[0.12em] whitespace-nowrap text-primary uppercase">
              {r.stars} stars
            </span>
            <span className="hidden text-right font-mono text-[9.5px] tracking-[0.12em] whitespace-nowrap text-faint uppercase sm:block">
              {r.license}
            </span>
          </button>
        ))}
      </div>
    </Screen>
  );
}
