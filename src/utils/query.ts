import { parseAsIndex, parseAsStringLiteral, useQueryStates } from "nuqs";
import { useCallback, useMemo } from "react";
import { REPOS, WORKS } from "@/utils/content";
import { S, SECTION_SLUGS, SECTIONS, wrap } from "@/utils/nav";

const WORK_SLUGS = WORKS.map((w) => w.slug);
const REPO_SLUGS = REPOS.map((r) => r.slug);

/**
 * The URL is the source of truth for which screen is showing.
 *
 *   /                                        Index
 *   ?section=work&project=harbor             Work carousel on Harbor
 *   ?section=work&view=all                   All works
 *   ?section=work&case=harbor&shot=2         Harbor case study, screenshot 02
 *   ?section=open-source&view=all            All repos
 *   ?section=open-source&repo=pg-outbox      Repo detail
 *
 * Unknown slugs parse to null and fall back to the section's main screen.
 * Default values are left out of the URL.
 */
export const pageSearchParams = {
  section: parseAsStringLiteral(SECTION_SLUGS).withDefault("index"),
  /** Carousel position. */
  project: parseAsStringLiteral(WORK_SLUGS).withDefault(WORK_SLUGS[0]),
  /** Open case study. */
  case: parseAsStringLiteral(WORK_SLUGS),
  /** Case-study screenshot tab: 1-based in the URL, 0-based in code. */
  shot: parseAsIndex.withDefault(0),
  /** Open repo detail. */
  repo: parseAsStringLiteral(REPO_SLUGS),
  /** Index list of the current section (All works / All repos). */
  view: parseAsStringLiteral(["all"] as const)
};

/** Keys that describe a sub-view; cleared whenever the section changes. */
const CLEARED = {
  project: null,
  case: null,
  shot: null,
  repo: null,
  view: null
} as const;

/** Reads the current screen from the URL and returns navigation actions that write it back. */
export function usePageQuery() {
  // Moving between screens adds a history entry, so Back and Forward work.
  const [q, setQ] = useQueryStates(pageSearchParams, { history: "push" });

  const active = SECTION_SLUGS.indexOf(q.section);
  const inWork = active === S.work;
  const inOpen = active === S.open;
  const caseIdx = inWork && q.case ? WORK_SLUGS.indexOf(q.case) : -1;
  const repoIdx = inOpen && q.repo ? REPO_SLUGS.indexOf(q.repo) : -1;

  const view = {
    active,
    /** Open case study, index into WORKS. */
    detail: caseIdx >= 0 ? caseIdx : null,
    /** "All works" index. */
    all: inWork && caseIdx < 0 && q.view === "all",
    /** Open repo detail, index into REPOS. */
    repo: repoIdx >= 0 ? repoIdx : null,
    /** "All repos" index. */
    allRepos: inOpen && repoIdx < 0 && q.view === "all"
  };
  const slide = WORK_SLUGS.indexOf(q.project);
  const shot =
    caseIdx >= 0 ? Math.min(q.shot, WORKS[caseIdx].shots.length - 1) : 0;

  const go = useCallback(
    (i: number) => setQ({ ...CLEARED, section: SECTION_SLUGS[i] }),
    [setQ]
  );

  const actions = useMemo(
    () => ({
      go,
      stepSection: (d: number) =>
        setQ((old) => ({
          ...CLEARED,
          section:
            SECTION_SLUGS[
              wrap(SECTION_SLUGS.indexOf(old.section) + d, SECTIONS.length)
            ]
        })),

      // Carousel moves replace the entry, so Back leaves the section instead of rewinding slides.
      goSlide: (i: number) =>
        setQ({ project: WORK_SLUGS[i] }, { history: "replace" }),
      stepSlide: (d: number) =>
        setQ(
          (old) => ({
            project:
              WORK_SLUGS[
                wrap(WORK_SLUGS.indexOf(old.project) + d, WORKS.length)
              ]
          }),
          {
            history: "replace"
          }
        ),

      openAllWorks: () => setQ({ ...CLEARED, section: "work", view: "all" }),
      openWork: (i: number) =>
        setQ({ ...CLEARED, section: "work", case: WORK_SLUGS[i] }),
      stepWork: (d: number) =>
        setQ((old) => ({
          case: WORK_SLUGS[
            wrap(WORK_SLUGS.indexOf(old.case ?? old.project) + d, WORKS.length)
          ],
          shot: null
        })),
      setShot: (i: number) => setQ({ shot: i }, { history: "replace" }),
      // Closing a case study lands the carousel on the project that was open.
      closeDetail: () =>
        setQ((old) => ({
          case: null,
          shot: null,
          repo: null,
          project: old.case ?? old.project
        })),
      closeIndex: () => setQ({ view: null }),

      openAllRepos: () =>
        setQ({ ...CLEARED, section: "open-source", view: "all" }),
      openRepo: (i: number) =>
        setQ({ ...CLEARED, section: "open-source", repo: REPO_SLUGS[i] }),
      stepRepo: (d: number) =>
        setQ((old) => ({
          repo: REPO_SLUGS[
            wrap(
              REPO_SLUGS.indexOf(old.repo ?? REPO_SLUGS[0]) + d,
              REPOS.length
            )
          ]
        }))
    }),
    [go, setQ]
  );

  // `nav` keeps the memoized object, so it is stable enough to be an effect dependency.
  return { view, slide, shot, nav: actions };
}
