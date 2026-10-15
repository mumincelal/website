import { useCallback, useEffect, useState } from "react";
import { Curtain } from "@/components/curtain";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Texture } from "@/components/texture";
import { AboutPage } from "@/pages/about";
import { ContactPage } from "@/pages/contact";
import { HomePage } from "@/pages/home";
import { OpenSourcePage } from "@/pages/open-source";
import { PathPage } from "@/pages/path";
import { AllReposPage } from "@/pages/repos";
import { RepoDetailPage } from "@/pages/repos/detail";
import { WorkPage } from "@/pages/work";
import { AllWorksPage } from "@/pages/works";
import { WorkDetailPage } from "@/pages/works/detail";
import { useDocumentMeta } from "@/utils/meta";
import { S } from "@/utils/nav";
import { usePageQuery } from "@/utils/query";

type Theme = "dark" | "light";

const INTRO_KEY = "nk-intro";

/** The overture plays once per browser session so it never taxes navigation. */
function shouldPlayIntro(): boolean {
  try {
    if (sessionStorage.getItem(INTRO_KEY) === "1") {
      return false;
    }
    sessionStorage.setItem(INTRO_KEY, "1");
  } catch {
    /* storage blocked: play it */
  }
  return true;
}

export function App() {
  const { view, slide, shot, nav } = usePageQuery();
  useDocumentMeta(view);
  const [theme, setTheme] = useState<Theme>("dark");
  const [dir, setDir] = useState<1 | -1>(1);
  const [intro, setIntro] = useState(shouldPlayIntro);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#0F0F0F" : "#FAFAFA");
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    []
  );

  // The carousel animates in from the side it came from.
  const stepSlide = (d: 1 | -1) => {
    setDir(d);
    nav.stepSlide(d);
  };
  const goSlide = (i: number) => {
    setDir(i >= slide ? 1 : -1);
    nav.goSlide(i);
  };

  const { active, detail, all, repo, allRepos } = view;
  const inDetail = detail !== null || repo !== null;
  const inIndex = all || allRepos;
  const onCarousel = active === S.work && !all && detail === null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }
      const k = e.key;

      if (k === "t" || k === "T") {
        return toggleTheme();
      }
      if (k === "Escape") {
        if (inDetail) {
          nav.closeDetail();
        } else if (inIndex) {
          nav.closeIndex();
        }
        return;
      }
      const forward = k === "ArrowRight" || k === "ArrowDown";
      const back = k === "ArrowLeft" || k === "ArrowUp";
      // Arrow keys inside a focused tab list belong to the tabs.
      if (
        (forward || back) &&
        (e.target as Element | null)?.closest?.('[role="tablist"]')
      ) {
        return;
      }
      if (forward || back) {
        e.preventDefault();
        const d = forward ? 1 : -1;
        const horizontal = k === "ArrowRight" || k === "ArrowLeft";
        if (detail !== null) {
          nav.stepWork(d);
        } else if (repo !== null) {
          nav.stepRepo(d);
        } else if (onCarousel && horizontal) {
          setDir(d);
          nav.stepSlide(d);
        } else {
          nav.stepSection(d);
        }
        return;
      }
      if (/^[1-6]$/.test(k)) {
        nav.go(Number(k) - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nav, detail, repo, inDetail, inIndex, onCarousel, toggleTheme]);

  return (
    <div className="fixed inset-0 grid grid-rows-[64px_1fr_52px] [@media(max-height:500px)]:grid-rows-[48px_1fr_40px] overflow-hidden bg-background font-sans text-foreground">
      <Header
        active={active}
        onGo={nav.go}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="relative z-2 min-h-0 overflow-hidden">
        {active === S.index && <HomePage />}

        {active === S.work && detail === null && !all && (
          <WorkPage
            index={slide}
            dir={dir}
            onStep={stepSlide}
            onGo={goSlide}
            onOpen={nav.openWork}
            onOpenAll={nav.openAllWorks}
          />
        )}
        {active === S.work && detail === null && all && (
          <AllWorksPage onOpen={nav.openWork} onClose={nav.closeIndex} />
        )}
        {active === S.work && detail !== null && (
          <WorkDetailPage
            index={detail}
            shot={shot}
            onShot={nav.setShot}
            onStep={nav.stepWork}
            onClose={nav.closeDetail}
          />
        )}

        {active === S.about && <AboutPage />}
        {active === S.path && <PathPage />}

        {active === S.open && repo === null && !allRepos && (
          <OpenSourcePage onOpen={nav.openRepo} onOpenAll={nav.openAllRepos} />
        )}
        {active === S.open && repo === null && allRepos && (
          <AllReposPage onOpen={nav.openRepo} onClose={nav.closeIndex} />
        )}
        {active === S.open && repo !== null && (
          <RepoDetailPage
            index={repo}
            onStep={nav.stepRepo}
            onClose={nav.closeDetail}
          />
        )}

        {active === S.contact && <ContactPage />}
      </main>

      <Footer active={active} />

      <Texture />
      {intro && <Curtain onDone={() => setIntro(false)} />}
    </div>
  );
}
