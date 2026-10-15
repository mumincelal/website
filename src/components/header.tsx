import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { pad, SITE } from "@/helpers/content.helper";
import { SECTIONS } from "@/helpers/nav.helper";
import { cn } from "@/lib/utils";

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
    <header className="relative z-2 flex items-stretch justify-between gap-2.5 px-4 sm:gap-[clamp(10px,1.6vw,26px)] sm:px-5.5">
      <div className="flex shrink-0 flex-col justify-center gap-0.5">
        <span className="text-emphasis leading-compact font-extrabold tracking-subtle">
          {SITE.name}
        </span>
        <span className="hidden font-mono text-micro leading-compact tracking-label text-muted-foreground uppercase sm:block">
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
              className="group flex shrink-0 items-center justify-center gap-1.25 px-1.25 whitespace-nowrap sm:gap-1.75 sm:px-[clamp(7px,1vw,16px)] md:min-w-0 md:shrink">
              <span className="font-mono text-label tracking-[0.08em] text-faint">
                {pad(i + 1)}
              </span>
              {/* Label rolls up inside a mask; a second copy rises into its place.
                  Below 860px only the active item keeps its label. */}
              <span
                aria-hidden="true"
                className={cn(
                  "h-roll overflow-hidden text-sm tracking-subtle",
                  isActive
                    ? "block font-semibold"
                    : "hidden font-normal md:block"
                )}>
                <span className="flex flex-col transition-transform duration-500 ease-expo group-hover:-translate-y-roll">
                  <span
                    className={cn(
                      "h-roll leading-roll",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}>
                    {label}
                  </span>
                  <span
                    className={cn(
                      "h-roll leading-roll",
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
        className="gap-2 self-center p-2 uppercase sm:px-2.75 sm:py-1.75">
        <i
          aria-hidden="true"
          className="size-2.25 rounded-full border border-current bg-[linear-gradient(90deg,currentColor_0_50%,transparent_50%_100%)]"
        />
        <span className="hidden sm:inline">
          {theme === "dark" ? "Light" : "Dark"}
        </span>
      </Button>
    </header>
  );
}
