import { motion } from "motion/react";
import { DetailBar, GUTTER, Screen } from "@/components/primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/utils/cn";
import { pad, WORKS } from "@/utils/content";
import { fade, rise } from "@/utils/motion";

interface Props {
  index: number;
  shot: number;
  onShot: (i: number) => void;
  onStep: (d: number) => void;
  onClose: () => void;
}

const CHART = [38, 54, 44, 70, 50, 62, 86, 58, 74, 48, 92, 64, 52, 78, 46, 68];
const CHART_HOT = 10;
const GRID_CELLS = 24;
const GRID_HOT = 9;
const LIST = [92, 68, 80, 54, 74, 44, 86, 60];
const LIST_HOT = 2;

/** Abstract interface sketches standing in for screenshots 01 / 02 / 03. */
function Sketch({ kind }: { kind: number }) {
  if (kind % 3 === 1) {
    return (
      <div className="grid size-full auto-rows-fr grid-cols-8 gap-[clamp(4px,0.6vw,9px)]">
        {Array.from({ length: GRID_CELLS }, (_, i) => (
          <i
            // biome-ignore lint/suspicious/noArrayIndexKey: static grid cells; position is the identity
            key={i}
            className={cn("border", i === GRID_HOT && "border-primary")}
          />
        ))}
      </div>
    );
  }
  if (kind % 3 === 2) {
    return (
      <div className="flex size-full flex-col justify-between gap-[clamp(2px,0.7vh,10px)]">
        {LIST.map((w, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: static decorative rows; position is the identity
            key={i}
            className="grid min-h-0 flex-1 items-center gap-2.5"
            style={{ gridTemplateColumns: `${w}% 1fr` }}>
            <i
              className={cn(
                "h-[min(8px,100%)]",
                i === LIST_HOT ? "bg-primary" : "bg-stripe"
              )}
            />
            <i className="h-[min(8px,100%)] bg-stripe opacity-50" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="relative flex size-full items-end gap-[clamp(3px,0.5vw,7px)]">
      {[14, 44, 74].map((top) => (
        <b
          key={top}
          className="absolute inset-x-0 h-px bg-stripe"
          style={{ top: `${top}%` }}
        />
      ))}
      {CHART.map((h, i) => (
        <i
          // biome-ignore lint/suspicious/noArrayIndexKey: static decorative bars; position is the identity
          key={i}
          className={cn(
            "flex-1 transition-[height] duration-700 ease-expo",
            i === CHART_HOT ? "bg-primary" : "bg-stripe"
          )}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

export function WorkDetailPage({
  index,
  shot,
  onShot,
  onStep,
  onClose
}: Props) {
  const w = WORKS[index];
  const num = pad(index + 1);
  const meta: [string, string][] = [
    ["Year", w.year],
    ["Role", w.role],
    ["Client", w.client],
    ["Scope", w.scope]
  ];

  return (
    <Screen
      aria-label={`${w.title} case study`}
      className={cn(
        "grid grid-cols-1 content-start gap-[clamp(10px,1.8vh,22px)] pt-[clamp(14px,2.6vh,34px)] pb-[clamp(56px,9vh,84px)] md:grid-rows-[auto_minmax(0,3fr)_auto_minmax(0,1fr)] md:content-normal",
        GUTTER
      )}>
      <DetailBar
        back="Work"
        onBack={onClose}
        href={w.url}
        linkLabel="Visit live site"
        shortLabel="Live site"
        position={`${num} / ${pad(WORKS.length)}`}
        onStep={onStep}
      />

      {/* Hero: screenshot tabs above, kicker + title + ghost numeral below */}
      <Tabs
        value={String(shot)}
        onValueChange={(v) => onShot(Number(v))}
        render={<motion.div {...rise(0, 0.9)} />}
        className="relative grid min-h-[clamp(240px,44vh,420px)] grid-cols-1 grid-rows-[minmax(0,1fr)_auto] gap-0 overflow-hidden border bg-card md:min-h-0">
        <div className="flex min-h-0 flex-col gap-[clamp(10px,1.6vh,18px)] p-[clamp(14px,2.2vw,30px)]">
          <div className="mono-label flex items-center justify-between gap-4">
            <span className="min-w-0 truncate">
              {w.shots[shot] ?? w.shots[0]}
            </span>
            <TabsList variant="line" activateOnFocus aria-label="Screens">
              {w.shots.map((label, i) => (
                <TabsTrigger
                  key={label}
                  variant="line"
                  value={String(i)}
                  aria-label={label}>
                  {pad(i + 1)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <div className="relative min-h-0 flex-1 overflow-hidden">
            {w.shots.map((label, i) => (
              <TabsContent
                key={label}
                value={String(i)}
                className="absolute inset-0"
                render={<motion.div {...fade(0, 0.3)} />}>
                <Sketch kind={i} />
              </TabsContent>
            ))}
          </div>
        </div>
        <div className="flex min-h-0 items-end justify-between gap-[clamp(16px,3vw,44px)] border-t px-[clamp(14px,2.2vw,30px)] py-[clamp(8px,1.5vh,20px)]">
          <div className="flex min-w-0 flex-col gap-[clamp(3px,0.6vh,9px)]">
            <span className="mono-eyebrow">{w.kicker}</span>
            <h2 className="text-[min(7.2vw,clamp(26px,7.2vh,118px))] leading-[0.82] font-extrabold tracking-[-0.05em] text-balance">
              {w.title}
            </h2>
          </div>
          <span
            aria-hidden="true"
            className="text-outline shrink-0 font-mono text-[min(6vw,clamp(26px,6vh,104px))] leading-[0.78] font-bold">
            {num}
          </span>
        </div>
      </Tabs>

      <motion.div
        {...rise(0.1)}
        className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))] gap-[clamp(14px,2.4vw,36px)] border-t pt-[clamp(8px,1.4vh,16px)]">
        {meta.map(([k, v]) => (
          <div key={k} className="flex flex-col gap-[5px]">
            <span className="mono-label">{k}</span>
            <span className="text-sm text-fg2">{v}</span>
          </div>
        ))}
      </motion.div>

      <motion.div
        {...rise(0.18)}
        className="grid grid-cols-1 items-start gap-[clamp(20px,3.4vw,56px)] md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <p
          className="text-[clamp(14px,1.35vw,19px)] leading-[1.42] tracking-[-0.015em] text-pretty text-fg2"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: build-time HTML from our own src/content Markdown
          dangerouslySetInnerHTML={{ __html: w.summaryHtml }}
        />
        <div className="grid grid-cols-1 gap-[clamp(14px,2vw,28px)] sm:grid-cols-3">
          {w.points.map((p, i) => (
            <div
              key={p}
              className="flex flex-col gap-[7px] border-t pt-[clamp(7px,1.2vh,14px)]">
              <span className="font-mono text-[10px] tracking-[0.12em] text-primary">
                {pad(i + 1)}
              </span>
              <span className="text-[13px] leading-[1.45] text-pretty text-muted-foreground">
                {p}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </Screen>
  );
}
