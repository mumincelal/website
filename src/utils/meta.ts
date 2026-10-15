import { useEffect } from "react";
import { ABOUT, PATH, REPOS, SITE, WORKS } from "@/utils/content";
import { S } from "@/utils/nav";

interface PageView {
  active: number;
  detail: number | null;
  all: boolean;
  repo: number | null;
  allRepos: boolean;
}

/** Title, description and canonical query for the screen currently showing. */
function metaFor(v: PageView): {
  title: string;
  description: string;
  query: Record<string, string> | null;
} {
  const name = SITE.name;
  const page = (label: string) => `${label} — ${name}`;
  if (v.active === S.work && v.detail !== null) {
    const w = WORKS[v.detail];
    return {
      title: page(`${w.title}: ${w.kicker}`),
      description: w.summaryText,
      query: { section: "work", case: w.slug }
    };
  }
  if (v.active === S.open && v.repo !== null) {
    const r = REPOS[v.repo];
    return {
      title: page(`${r.name} · Open source`),
      description: r.summaryText,
      query: { section: "open-source", repo: r.slug }
    };
  }
  switch (v.active) {
    case S.work:
      return v.all
        ? {
            title: page("All works"),
            description: `Every project by ${name}, newest first.`,
            query: { section: "work", view: "all" }
          }
        : {
            title: page("Work"),
            description: `Selected case studies by ${name}: ${WORKS.map((w) => w.title).join(", ")}.`,
            query: { section: "work" }
          };
    case S.about:
      return {
        title: page("About"),
        description: ABOUT.columns.map((c) => c.text).join(" "),
        query: { section: "about" }
      };
    case S.path:
      return {
        title: page(PATH.label),
        description: `${PATH.entries.map((e) => `${e.title} (${e.when})`).join("; ")}.`,
        query: { section: "path" }
      };
    case S.open:
      return v.allRepos
        ? {
            title: page("All repositories"),
            description: `Open-source projects by ${name}.`,
            query: { section: "open-source", view: "all" }
          }
        : {
            title: page("Open source"),
            description: `Open-source projects by ${name}: ${REPOS.map((r) => r.name).join(", ")}.`,
            query: { section: "open-source" }
          };
    case S.contact:
      return {
        title: page("Contact"),
        description: `Get in touch with ${name}: ${SITE.email}.`,
        query: { section: "contact" }
      };
    default:
      return {
        title: SITE.seo.title,
        description: SITE.seo.description,
        query: null
      };
  }
}

function setMeta(selector: string, attr: "content" | "href", value: string) {
  document.head.querySelector(selector)?.setAttribute(attr, value);
}

/**
 * Keeps the tab title, meta description and canonical link in step with the screen,
 * so engines that render JavaScript index each case study and repo under its own title.
 * The static defaults for the home page are written into index.html at build time.
 */
export function useDocumentMeta(view: PageView) {
  const { title, description, query } = metaFor(view);
  // Built here so the effect depends on a string, not the fresh `query` object.
  const url = `${SITE.seo.url.replace(/\/$/, "")}/${query ? `?${new URLSearchParams(query)}` : ""}`;
  useEffect(() => {
    document.title = title;
    setMeta('meta[name="description"]', "content", description);
    setMeta('link[rel="canonical"]', "href", url);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", url);
  }, [title, description, url]);
}
