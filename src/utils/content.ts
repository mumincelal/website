/**
 * All copy lives in /src/content as Markdown with YAML front matter.
 * The `markdown-content` plugin in vite.config.ts parses each file at build time
 * into { data, html, text }: front matter carries structured fields, and the body
 * is the main paragraph (inline Markdown, so **bold**, _italic_ and [links](…) work).
 */

interface RawDoc {
  data: unknown;
  /** Body rendered as inline HTML. */
  html: string;
  /** Body with Markdown syntax stripped, for truncation and labels. */
  text: string;
}

interface Doc<T> extends RawDoc {
  data: T;
}

const parseDoc = <T>(doc: RawDoc) => doc as Doc<T>;

/** Sorted by filename, so a numeric prefix ("01-ledger.md") sets the order. */
function collection(files: Record<string, RawDoc>) {
  return Object.keys(files)
    .sort()
    .map((path) => ({ slug: slugOf(path), raw: files[path] }));
}

function slugOf(path: string): string {
  const base = path.slice(path.lastIndexOf("/") + 1).replace(/\.md$/, "");
  return base.replace(/^\d+[-_]/, "");
}

function single(files: Record<string, RawDoc>, name: string): RawDoc {
  const key = Object.keys(files).find((p) => p.endsWith(`/${name}.md`));
  if (!key) {
    throw new Error(`src/content/${name}.md is missing`);
  }
  return files[key];
}

const pages = import.meta.glob<RawDoc>("../content/*.md", {
  import: "default",
  eager: true
});
const workFiles = import.meta.glob<RawDoc>("../content/works/*.md", {
  import: "default",
  eager: true
});
const repoFiles = import.meta.glob<RawDoc>("../content/repos/*.md", {
  import: "default",
  eager: true
});

/* ---------- Types ---------- */

export interface Site {
  name: string;
  role: string;
  email: string;
  index: { eyebrow: string; headline: [string, string]; facts: string[][] };
  marquee: string;
  contact: { eyebrow: string; links: { label: string; href: string }[] };
  /** Search, social and AI-engine settings (also read at build time by the SEO plugin in vite.config.ts). */
  seo: { url: string; title: string; description: string };
  introHtml: string;
}

export interface About {
  eyebrow: string;
  columns: { title: string; text: string }[];
  statementHtml: string;
}

export interface PathEntry {
  when: string;
  title: string;
  text: string;
}

export interface Work {
  slug: string;
  title: string;
  year: string;
  role: string;
  client: string;
  kicker: string;
  scope: string;
  url: string;
  shots: string[];
  points: string[];
  summaryHtml: string;
  summaryText: string;
}

export interface ArchiveEntry {
  year: string;
  title: string;
  kind: string;
  /** Index into WORKS when the entry has a case study. */
  work: number | null;
}

export interface Repo {
  slug: string;
  name: string;
  stars: string;
  forks: string;
  license: string;
  since: string;
  url: string;
  install: string;
  points: string[];
  activity: number[];
  summaryHtml: string;
  summaryText: string;
}

/* ---------- Parsed content ---------- */

const siteDoc = parseDoc<Omit<Site, "introHtml">>(single(pages, "site"));
export const SITE: Site = { ...siteDoc.data, introHtml: siteDoc.html };

const aboutDoc = parseDoc<Omit<About, "statementHtml">>(single(pages, "about"));
export const ABOUT: About = { ...aboutDoc.data, statementHtml: aboutDoc.html };

const pathDoc = parseDoc<{ label: string; entries: PathEntry[] }>(
  single(pages, "path")
);
export const PATH = pathDoc.data;

export const WORKS: Work[] = collection(workFiles).map(({ slug, raw }) => {
  const d = parseDoc<Omit<Work, "slug" | "summaryHtml" | "summaryText">>(raw);
  return {
    ...d.data,
    year: String(d.data.year),
    url: d.data.url ?? "#",
    slug,
    summaryHtml: d.html,
    summaryText: d.text
  };
});

const archiveDoc = parseDoc<{
  range: string;
  entries: (Omit<ArchiveEntry, "work"> & { case?: string })[];
}>(single(pages, "archive"));
export const ARCHIVE_RANGE = archiveDoc.data.range;
export const ARCHIVE: ArchiveEntry[] = archiveDoc.data.entries.map(
  ({ case: c, ...e }) => {
    const i = c ? WORKS.findIndex((w) => w.slug === c) : -1;
    return { ...e, year: String(e.year), work: i >= 0 ? i : null };
  }
);

export const REPOS: Repo[] = collection(repoFiles).map(({ slug, raw }) => {
  const d = parseDoc<Omit<Repo, "slug" | "summaryHtml" | "summaryText">>(raw);
  return {
    ...d.data,
    stars: String(d.data.stars),
    forks: String(d.data.forks),
    since: String(d.data.since),
    url: d.data.url ?? "#",
    slug,
    summaryHtml: d.html,
    summaryText: d.text
  };
});

/** "01", "02", … */
export const pad = (n: number) => String(n).padStart(2, "0");
