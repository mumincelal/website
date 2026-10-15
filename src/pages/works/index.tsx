import { motion } from "motion/react";
import {
  BackButton,
  GUTTER,
  INDEX_ROW,
  IndexTitle,
  PAD_Y,
  Screen
} from "@/components/primitives";
import { ARCHIVE, ARCHIVE_RANGE, pad } from "@/helpers/content.helper";
import { fade } from "@/helpers/motion.helper";
import { cn } from "@/lib/utils";

interface Props {
  onOpen: (work: number) => void;
  onClose: () => void;
}

export function AllWorksPage({ onOpen, onClose }: Props) {
  return (
    <Screen
      aria-label="All works"
      className={cn(
        "grid grid-cols-1 content-start gap-index md:grid-rows-[auto_1fr] md:content-normal",
        GUTTER,
        PAD_Y
      )}>
      <motion.div
        {...fade()}
        className="flex items-center justify-between gap-6">
        <div className="flex flex-wrap items-baseline gap-x-4.5 gap-y-1.5">
          <IndexTitle>All works</IndexTitle>
          <span className="mono-label">
            {ARCHIVE_RANGE} · {pad(ARCHIVE.length)} entries
          </span>
        </div>
        <BackButton label="Work" onClick={onClose} />
      </motion.div>

      <div className="flex flex-col md:min-h-0 md:overflow-hidden">
        {ARCHIVE.map((a, i) => {
          const { work } = a;
          const hasCase = work !== null;
          return (
            <button
              type="button"
              key={`${a.year}-${a.title}`}
              onClick={work !== null ? () => onOpen(work) : undefined}
              aria-disabled={hasCase ? undefined : true}
              className={cn(
                INDEX_ROW,
                "py-[clamp(4px,0.95vh,12px)] aria-disabled:cursor-default",
                "grid-cols-[30px_clamp(44px,12vw,58px)_minmax(0,1fr)] sm:grid-cols-[clamp(26px,3.5vw,44px)_clamp(42px,5.5vw,68px)_minmax(0,1.5fr)_minmax(0,1fr)_clamp(58px,9vw,112px)]"
              )}>
              <span className="font-mono text-label tracking-widest text-faint">
                {pad(i + 1)}
              </span>
              <span className="font-mono text-label tracking-label text-primary">
                {a.year}
              </span>
              <span className="truncate text-[clamp(15px,2.4vh,30px)] leading-[1.02] font-extrabold tracking-[-0.035em] text-foreground">
                {a.title}
              </span>
              <span className="hidden truncate text-meta text-muted-foreground sm:block">
                {a.kind}
              </span>
              <span className="hidden text-right font-mono text-tag tracking-label text-faint uppercase sm:block">
                {hasCase ? "Case study ↗" : "—"}
              </span>
            </button>
          );
        })}
      </div>
    </Screen>
  );
}
