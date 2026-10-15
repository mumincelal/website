import { motion } from "motion/react";
import { DetailBar, GUTTER, PAD_Y, Screen } from "@/components/primitives";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import { pad, REPOS } from "@/utils/content";
import { fade, rise } from "@/utils/motion";

interface Props {
  index: number;
  onStep: (d: number) => void;
  onClose: () => void;
}

export function RepoDetailPage({ index, onStep, onClose }: Props) {
  const r = REPOS[index];
  const stats: [string, string][] = [
    ["Stars", r.stars],
    ["Forks", r.forks],
    ["Licence", r.license]
  ];

  return (
    <Screen
      aria-label={`${r.name} repository`}
      className={cn(
        "grid grid-cols-1 content-start gap-[clamp(10px,1.9vh,24px)] md:grid-rows-[auto_auto_1fr] md:content-normal",
        GUTTER,
        PAD_Y
      )}>
      <DetailBar
        back="Open source"
        onBack={onClose}
        href={r.url}
        linkLabel="View on GitHub"
        shortLabel="GitHub"
        position={`${pad(index + 1)} / ${pad(REPOS.length)}`}
        onStep={onStep}
      />

      <motion.div
        {...rise()}
        className="flex flex-wrap items-baseline justify-between gap-6">
        <h2 className="font-mono text-[clamp(22px,3.4vw,52px)] leading-[0.95] font-medium tracking-[-0.03em]">
          {r.name}
        </h2>
        <span className="font-mono text-[11px] tracking-[0.14em] text-primary uppercase">
          Since {r.since}
        </span>
      </motion.div>

      <div className="grid grid-cols-1 gap-[clamp(20px,3vw,44px)] md:min-h-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <div className="flex flex-col gap-[clamp(9px,1.7vh,20px)] md:min-h-0 md:overflow-hidden">
          <motion.p
            {...rise(0.08)}
            className="shrink-0 text-[clamp(13px,1.15vw,16px)] leading-normal text-pretty text-fg2"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: build-time HTML from our own src/content Markdown
            dangerouslySetInnerHTML={{ __html: r.summaryHtml }}
          />
          <motion.div {...rise(0.16)} className="flex flex-col md:min-h-0">
            {r.points.map((p, i) => (
              <div
                key={p}
                className="grid grid-cols-[32px_1fr] items-baseline gap-3 border-t py-[clamp(5px,1vh,12px)]">
                <span className="font-mono text-[10px] text-primary">
                  {pad(i + 1)}
                </span>
                <span className="text-[13px] leading-[1.45] text-pretty text-muted-foreground">
                  {p}
                </span>
              </div>
            ))}
          </motion.div>
          <Card
            render={<motion.div {...fade(0.26, 0.6)} />}
            className="shrink-0 flex-row items-center gap-2.5 px-3 py-2.5 font-mono">
            <span className="text-[11px] text-primary">$</span>
            <span className="truncate text-[11.5px] text-fg2">{r.install}</span>
          </Card>
        </div>

        <motion.div
          {...rise(0.14)}
          className="grid grid-rows-[auto_minmax(0,1fr)] gap-3.5 md:min-h-0">
          <div className="grid grid-cols-3 gap-2.5">
            {stats.map(([k, v], i) => (
              <Card key={k} className="gap-1 p-2.5 font-mono">
                <span className="text-[9.5px] tracking-[0.12em] text-faint uppercase">
                  {k}
                </span>
                <span
                  className={cn(
                    "text-foreground",
                    i === 2 ? "text-xs" : "text-[15px]"
                  )}>
                  {v}
                </span>
              </Card>
            ))}
          </div>
          <Card className="min-h-[180px] gap-2 overflow-hidden p-3 md:min-h-0">
            <div
              role="img"
              aria-label="Commit activity over the last 12 months"
              className="flex flex-1 items-end gap-1">
              {r.activity.map((h, i) => (
                <i
                  // biome-ignore lint/suspicious/noArrayIndexKey: one bar per month; position is the identity
                  key={i}
                  className={cn("flex-1", h > 75 ? "bg-primary" : "bg-stripe")}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <span className="font-mono text-[9.5px] tracking-[0.12em] text-faint uppercase">
              Commits — last 12 months
            </span>
          </Card>
        </motion.div>
      </div>
    </Screen>
  );
}
