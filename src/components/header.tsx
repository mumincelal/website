import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { pad, SITE } from "@/utils/content";
import { SECTIONS } from "@/utils/nav";

interface Props {
  active: number;
  onGo: (i: number) => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export function Header({ active, onGo, theme, onToggleTheme }: Props) {
  const navRef = useRef<HTMLElement>(null);

  // When the nav overflows (phones), keep the active item in view.
  useEffect(() => {
    const nav = navRef.current;
    const item = nav?.children[active] as HTMLElement | undefined;
    if (!nav || !item || nav.scrollWidth <= nav.clientWidth) {
      return;
    }
    const left = item.offsetLeft - (nav.clientWidth - item.offsetWidth) / 2;
    nav.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  return (
    <header className="relative z-2 flex items-stretch justify-between gap-2.5 px-4 sm:gap-[clamp(10px,1.6vw,26px)] sm:px-[22px]">
      <div className="flex shrink-0 flex-col justify-center gap-0.5">
        <span className="text-[15px] leading-[1.1] font-extrabold tracking-[-0.01em]">
          {SITE.name}
        </span>
        <span className="hidden font-mono text-[9px] leading-[1.1] tracking-[0.12em] text-muted-foreground uppercase sm:block">
          {SITE.role}
        </span>
      </div>

      <nav
        ref={navRef}
        aria-label="Sections"
        className="no-scrollbar relative flex min-w-0 flex-1 items-stretch justify-center-safe overflow-x-auto">
        {SECTIONS.map((label, i) => {
          const isActive = i === active;
          return (
            <button
              type="button"
              key={label}
              onClick={() => onGo(i)}
              aria-current={isActive ? "page" : undefined}
              aria-label={label}
              className="group flex shrink-0 items-center justify-center gap-[5px] px-[5px] whitespace-nowrap sm:gap-[7px] sm:px-[clamp(7px,1vw,16px)] md:min-w-0 md:shrink">
              <span className="font-mono text-[10px] tracking-[0.08em] text-faint">
                {pad(i + 1)}
              </span>
              {/* Label rolls up inside a mask; a second copy rises into its place.
                  Below 860px only the active item keeps its label. */}
              <span
                aria-hidden="true"
                className={cn(
                  "h-[1.2em] overflow-hidden text-sm tracking-[-0.01em]",
                  isActive
                    ? "block font-semibold"
                    : "hidden font-normal md:block"
                )}>
                <span className="flex flex-col transition-transform duration-500 ease-expo group-hover:-translate-y-[1.2em]">
                  <span
                    className={cn(
                      "h-[1.2em] leading-[1.2em]",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}>
                    {label}
                  </span>
                  <span
                    className={cn(
                      "h-[1.2em] leading-[1.2em]",
                      isActive ? "text-primary" : "text-foreground"
                    )}>
                    {label}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      <Button
        variant="outline"
        size="sm"
        onClick={onToggleTheme}
        aria-label="Toggle colour theme"
        className="gap-2 self-center p-2 uppercase sm:px-[11px] sm:py-[7px]">
        <i
          aria-hidden="true"
          className="size-[9px] rounded-full border border-current bg-[linear-gradient(90deg,currentColor_0_50%,transparent_50%_100%)]"
        />
        <span className="hidden sm:inline">
          {theme === "dark" ? "Light" : "Dark"}
        </span>
      </Button>
    </header>
  );
}
