import { motion, type PanInfo, useDragControls } from "motion/react";
import { GUTTER, Screen, SectionTitle } from "@/components/primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { ARCHIVE, pad, WORKS, type Work } from "@/utils/content";
import { EASE, rise, slideIn } from "@/utils/motion";

interface Props {
  index: number;
  dir: 1 | -1;
  onStep: (d: 1 | -1) => void;
  onGo: (i: number) => void;
  onOpen: (i: number) => void;
  onOpenAll: () => void;
}

/** Deterministic placeholder bars derived from the title, so each project draws its own chart. */
function barsFor(w: Work) {
  const t = w.title;
  return Array.from(
    { length: 12 },
    (_, i) => 32 + ((t.charCodeAt(i % t.length) * (i + 3) + i * 11) % 64)
  );
}

/** A swipe counts past this distance (px) or this speed (px/s). */
const SWIPE_DISTANCE = 46;
const SWIPE_VELOCITY = 500;
/** How far the screen follows the finger: 0.32 of the drag distance. */
const SWIPE_DAMPING = 0.32;

export function WorkPage({
  index,
  dir,
  onStep,
  onGo,
  onOpen,
  onOpenAll
}: Props) {
  const w = WORKS[index];
  const drag = useDragControls();

  // Content enters from the side it came from; keyed by index so it replays per slide.
  const enter = slideIn(dir);

  // Swipe: the screen follows the pointer on the x axis (damped) and springs back on release;
  // vertical scrolling still works because the stage only claims horizontal pans.
  const onDragEnd = (_: PointerEvent, { offset, velocity }: PanInfo) => {
    if (
      Math.abs(offset.x) > SWIPE_DISTANCE ||
      Math.abs(velocity.x) > SWIPE_VELOCITY
    ) {
      onStep(offset.x < 0 ? 1 : -1);
    }
  };

  return (
    <Screen
      aria-label="Work"
      aria-roledescription="carousel"
      className="grid content-start md:grid-rows-[auto_minmax(0,1fr)] md:content-normal">
      <motion.div
        {...rise()}
        className={cn(
          "flex items-center justify-between gap-5 pt-[clamp(14px,2.4vh,32px)] pb-[clamp(12px,1.8vh,24px)]",
          GUTTER
        )}>
        <SectionTitle>Work</SectionTitle>
        <div className="flex items-center gap-[clamp(12px,1.5vw,22px)] font-mono text-[10px] tracking-[0.12em] uppercase">
          <span className="text-faint">
            {pad(index + 1)} / {pad(WORKS.length)}
          </span>
          <div className="hidden items-center gap-1.5 md:flex">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent"
              onClick={() => onStep(-1)}
              aria-label="Previous project">
              ←
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent"
              onClick={() => onStep(1)}
              aria-label="Next project">
              →
            </Button>
          </div>
          <Button
            variant="ghost"
            size="none"
            className="text-[10px] tracking-[0.12em]"
            onClick={onOpenAll}>
            <span className="hidden md:inline">
              All works ({pad(ARCHIVE.length)}) →
            </span>
            <span className="md:hidden">All ({pad(ARCHIVE.length)}) →</span>
          </Button>
        </div>
      </motion.div>

      <div className="grid md:min-h-0 grid-cols-1 border-t md:grid-cols-[clamp(102px,13vw,206px)_minmax(0,1fr)_clamp(192px,22vw,340px)] md:grid-rows-[minmax(0,1fr)]">
        {/* Rail: index numeral + progress dots */}
        <div className="flex md:min-h-0 items-center justify-between gap-[clamp(12px,2vh,26px)] px-[clamp(20px,5vw,26px)] pt-[clamp(12px,3vw,20px)] md:flex-col md:items-start md:px-[clamp(18px,2.4vw,34px)] md:py-[clamp(14px,2.2vh,28px)]">
          <motion.div
            key={`n${index}`}
            {...enter}
            className="text-[clamp(46px,7.4vw,128px)] leading-[0.8] font-extrabold tracking-[-0.06em]">
            {pad(index + 1)}
          </motion.div>
          <div className="flex items-center gap-[clamp(6px,0.8vw,9px)] pointer-coarse:gap-0">
            {WORKS.map((x, i) => (
              <button
                type="button"
                key={x.slug}
                onClick={() => onGo(i)}
                aria-label={`Project ${i + 1}: ${x.title}`}
                aria-current={i === index ? "true" : undefined}
                className="flex items-center py-3.5 pointer-coarse:px-[7px]">
                <motion.span
                  initial={false}
                  animate={{ width: i === index ? 28 : 10 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className={cn(
                    "block h-0.5 transition-colors duration-300",
                    i === index ? "bg-primary" : "bg-border"
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Stage: the project's screen */}
        <div
          onPointerDown={(e) => drag.start(e)}
          className="relative grid cursor-grab touch-pan-y place-items-center active:cursor-grabbing md:min-h-0 md:[container-type:size] overflow-hidden border-y bg-card p-[clamp(14px,4vw,26px)] md:border-x md:border-y-0 md:p-[clamp(16px,3vw,56px)]">
          <motion.div
            drag="x"
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={SWIPE_DAMPING}
            dragSnapToOrigin
            onDragEnd={onDragEnd}
            className="w-full max-w-[86vh] md:max-w-[min(1020px,160cqh)]">
            <motion.div
              key={`s${index}`}
              {...enter}
              className="grid aspect-[4/3] w-full grid-rows-[auto_minmax(0,1fr)] border bg-background md:aspect-[16/10]">
              <div className="flex items-center justify-between gap-3 border-b px-[clamp(11px,1.3vw,19px)] py-[clamp(9px,1.1vw,15px)] font-mono text-[9.5px] tracking-[0.14em] text-faint uppercase">
                <span className="min-w-0 truncate">{w.shots[0]}</span>
                <span className="shrink-0">{w.year}</span>
              </div>
              <div className="grid min-h-0 grid-cols-1 gap-[clamp(14px,1.8vw,30px)] p-[clamp(14px,1.9vw,30px)] sm:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
                <div className="flex min-h-0 flex-col justify-center gap-[clamp(7px,1.1vh,13px)]">
                  <i className="block h-[clamp(10px,1.7vh,17px)] w-[74%] bg-stripe" />
                  <i className="block h-[clamp(10px,1.7vh,17px)] w-[52%] bg-primary" />
                  <i className="block h-[5px] w-[88%] bg-stripe opacity-65" />
                  <i className="block h-[5px] w-[66%] bg-stripe opacity-65" />
                  <i className="block h-[5px] w-[78%] bg-stripe opacity-65" />
                </div>
                <div className="flex min-h-0 items-end gap-[clamp(3px,0.5vw,7px)]">
                  {barsFor(w).map((h, i) => (
                    <i
                      // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length decorative bars; position is the identity
                      key={i}
                      className={cn(
                        "block min-w-0 flex-1",
                        h > 82 ? "bg-primary" : "bg-stripe"
                      )}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Text: name, kicker, summary, call to action */}
        <div className="flex md:min-h-0 flex-col justify-between gap-[clamp(18px,3.2vh,44px)] px-[clamp(20px,5vw,26px)] pt-[clamp(16px,4vw,24px)] pb-[clamp(22px,6vw,32px)] md:px-[clamp(18px,2.4vw,34px)] md:py-[clamp(14px,2.2vh,28px)]">
          <motion.div
            key={`t${index}`}
            {...enter}
            className="flex flex-col gap-[clamp(6px,0.9vh,11px)]">
            <h3 className="text-[clamp(28px,2.9vw,46px)] leading-[0.9] font-extrabold tracking-[-0.04em] text-balance">
              {w.title}
            </h3>
            <span className="font-mono text-[10px] tracking-[0.14em] text-primary uppercase">
              {w.kicker}
            </span>
          </motion.div>
          <motion.p
            key={`p${index}`}
            {...enter}
            className="font-mono text-[clamp(10.5px,0.75vw,11.5px)] leading-[1.95] tracking-[0.06em] text-pretty text-fg2 uppercase"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: build-time HTML from our own src/content Markdown
            dangerouslySetInnerHTML={{ __html: w.summaryHtml }}
          />
          <Button
            variant="line"
            size="lg"
            className="self-stretch md:min-h-0 md:self-start"
            onClick={() => onOpen(index)}>
            View project
          </Button>
          <span className="text-center font-mono text-[9px] tracking-[0.18em] text-faint uppercase md:hidden">
            Swipe to move between projects
          </span>
        </div>
      </div>
    </Screen>
  );
}
