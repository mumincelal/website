import fs from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { marked } from "marked";
import { defineConfig, type Plugin } from "vite";
import { parse as parseYaml } from "yaml";

/*
 * Vite config (at the bottom) plus the site's three build-time plugins, all in one file:
 *   1. markdownContent  — /src/content/*.md → { data, html, text } modules (no parser shipped to the browser)
 *   2. seo              — head tags, JSON-LD, static fallback, sitemap, robots, llms.txt, manifest
 *   3. preloadFonts     — <link rel="preload"> for the fonts the first screen needs
 * Everything here runs in Node during `vite dev` / `vite build`; none of it ships to the browser.
 */

/* ==========================================================================================
   1. Markdown content: parse front matter + inline Markdown at build time
   ========================================================================================== */

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

interface ParsedMarkdown<T = Record<string, unknown>> {
  /** YAML front matter. */
  data: T;
  /** Body rendered as inline Markdown (HTML). */
  html: string;
  /** Body with Markdown syntax stripped. */
  text: string;
}

/** Splits a content file into front matter and body, rendering the body as inline Markdown. */
function parseMarkdown<T = Record<string, unknown>>(
  src: string
): ParsedMarkdown<T> {
  const m = FRONT_MATTER.exec(src);
  const data = (m ? (parseYaml(m[1]) ?? {}) : {}) as T;
  const body = (m ? m[2] : src).trim();
  const html = body
    ? (marked.parseInline(body, { async: false }) as string)
    : "";
  const text = body
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return { data, html, text };
}

/**
 * Turns `*.md` imports into `{ data, html, text }` at build time, so the browser
 * receives plain data instead of a YAML and Markdown parser.
 */
function markdownContent(): Plugin {
  return {
    name: "markdown-content",
    transform(src, id) {
      if (!id.endsWith(".md")) {
        return null;
      }
      return {
        code: `export default ${JSON.stringify(parseMarkdown(src))};`,
        map: null
      };
    }
  };
}

/* ==========================================================================================
   Content reader (Node side, mirrors src/utils/content.ts) — used by the SEO plugin
   ========================================================================================== */

/**
 * Node-side reader for /src/content, used at build time by the SEO plugin.
 * Mirrors src/utils/content.ts (same files, same ordering and slugs).
 */

interface SeoSettings {
  url: string;
  title: string;
  description: string;
  locale: string;
  topics: string[];
  location: {
    city: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
  };
}

interface SiteContent {
  name: string;
  role: string;
  email: string;
  intro: string;
  index: { eyebrow: string; headline: string[]; facts: string[][] };
  contact: { links: { label: string; href: string }[] };
  seo: SeoSettings;
  about: { statement: string; columns: { title: string; text: string }[] };
  path: {
    label: string;
    entries: { when: string; title: string; text: string }[];
  };
  archive: {
    range: string;
    entries: { year: string; title: string; kind: string; case?: string }[];
  };
  works: {
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
    summary: string;
  }[];
  repos: {
    slug: string;
    name: string;
    stars: string;
    forks: string;
    license: string;
    since: string;
    url: string;
    install: string;
    points: string[];
    summary: string;
  }[];
}

const slugOf = (file: string) =>
  file.replace(/\.md$/, "").replace(/^\d+[-_]/, "");

function loadContent(root: string): SiteContent {
  const dir = path.join(root, "src", "content");
  const read = <T>(file: string) =>
    parseMarkdown<T>(fs.readFileSync(path.join(dir, file), "utf8"));
  const list = (sub: string) =>
    fs
      .readdirSync(path.join(dir, sub))
      .filter((f) => f.endsWith(".md"))
      .sort()
      .map((f) => ({
        slug: slugOf(f),
        doc: read<Record<string, unknown>>(path.join(sub, f))
      }));

  const site =
    read<
      Omit<
        SiteContent,
        "intro" | "about" | "path" | "archive" | "works" | "repos"
      >
    >("site.md");
  const about = read<{ columns: SiteContent["about"]["columns"] }>("about.md");
  const pathDoc = read<SiteContent["path"]>("path.md");
  const archive = read<SiteContent["archive"]>("archive.md");

  return {
    ...site.data,
    intro: site.text,
    about: { statement: about.text, columns: about.data.columns },
    path: pathDoc.data,
    archive: {
      ...archive.data,
      entries: archive.data.entries.map((e) => ({ ...e, year: String(e.year) }))
    },
    works: list("works").map(({ slug, doc }) => {
      const d = doc.data as Record<string, unknown>;
      return {
        ...(d as object),
        slug,
        year: String(d.year),
        url: String(d.url ?? "#"),
        summary: doc.text
      } as SiteContent["works"][number];
    }),
    repos: list("repos").map(({ slug, doc }) => {
      const d = doc.data as Record<string, unknown>;
      return {
        ...(d as object),
        slug,
        stars: String(d.stars),
        forks: String(d.forks),
        since: String(d.since),
        url: String(d.url ?? "#"),
        summary: doc.text
      } as SiteContent["repos"][number];
    })
  };
}

/* ==========================================================================================
   2. SEO + GEO
   ========================================================================================== */

/**
 * SEO + GEO at build time, generated from /src/content so there is one source of truth.
 *
 *  index.html   <head>: title, description, canonical, Open Graph / Twitter, icons, manifest,
 *               geo meta, and a JSON-LD graph (WebSite, ProfilePage, Person, projects, repos).
 *               <div id="root">: the whole site as static semantic HTML, so crawlers and AI
 *               answer engines that don't run JavaScript still read every page. React replaces
 *               it on load; a one-line head script hides it first, so visitors never see it.
 *  sitemap.xml, robots.txt (AI crawlers explicitly allowed), llms.txt, llms-full.txt,
 *  site.webmanifest — emitted into dist/ and served by the dev server.
 */

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Page URLs in the same query scheme the app writes with nuqs (src/utils/query.ts). */
function urlsFor(c: SiteContent) {
  const base = c.seo.url.replace(/\/$/, "");
  const page = (q?: Record<string, string>) =>
    `${base}/${q ? `?${new URLSearchParams(q)}` : ""}`;
  const rel = (q: Record<string, string>) => `/?${new URLSearchParams(q)}`;
  return {
    base,
    page,
    rel,
    caseQ: (slug: string) => ({ section: "work", case: slug }),
    repoQ: (slug: string) => ({ section: "open-source", repo: slug })
  };
}

const isWeb = (href: string) => /^https?:\/\//.test(href);

/** "Staff product engineer · Brightline Labs" → "Brightline Labs" */
const orgOf = (title: string) => title.split(" · ").slice(1).join(" · ").trim();

/* ---------------------------------------------------------------- head */

function headTags(c: SiteContent, today: string) {
  const { base, page, caseQ, repoQ } = urlsFor(c);
  const { seo } = c;
  const image = `${base}/og-image.png`;
  const imageAlt = `${c.name} — ${c.index.headline.join(" ")}`;
  const [first, ...rest] = c.name.split(" ");
  const sameAs = c.contact.links.map((l) => l.href).filter(isWeb);
  const personId = `${base}/#person`;
  const job = c.path.entries[0];
  const school = c.path.entries.find((e) =>
    /\b(BSc|MSc|BA|MA|PhD|Univ)/.test(e.title)
  );

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: `${base}/`,
        name: c.name,
        description: seo.description,
        inLanguage: "en",
        publisher: { "@id": personId }
      },
      {
        "@type": "ProfilePage",
        "@id": `${base}/#profile`,
        url: `${base}/`,
        name: seo.title,
        isPartOf: { "@id": `${base}/#website` },
        mainEntity: { "@id": personId },
        dateModified: today,
        inLanguage: "en"
      },
      {
        "@type": "Person",
        "@id": personId,
        name: c.name,
        givenName: first,
        familyName: rest.join(" "),
        url: `${base}/`,
        image,
        email: `mailto:${c.email}`,
        jobTitle: c.role,
        description: c.intro,
        knowsAbout: seo.topics,
        address: {
          "@type": "PostalAddress",
          addressLocality: seo.location.city,
          addressRegion: seo.location.region,
          addressCountry: seo.location.country
        },
        homeLocation: {
          "@type": "Place",
          name: seo.location.city,
          geo: {
            "@type": "GeoCoordinates",
            latitude: seo.location.latitude,
            longitude: seo.location.longitude
          }
        },
        ...(job && orgOf(job.title)
          ? { worksFor: { "@type": "Organization", name: orgOf(job.title) } }
          : {}),
        ...(school && orgOf(school.title)
          ? {
              alumniOf: {
                "@type": "CollegeOrUniversity",
                name: orgOf(school.title)
              }
            }
          : {}),
        ...(sameAs.length ? { sameAs } : {})
      },
      {
        "@type": "ItemList",
        "@id": `${base}/#work`,
        name: "Selected work",
        itemListElement: c.works.map((w, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "CreativeWork",
            "@id": `${page(caseQ(w.slug))}#case-study`,
            url: page(caseQ(w.slug)),
            name: w.title,
            headline: `${w.title} — ${w.kicker}`,
            description: w.summary,
            abstract: w.points.join(" "),
            dateCreated: w.year,
            genre: w.kicker,
            creator: { "@id": personId },
            ...(w.client
              ? {
                  sourceOrganization: {
                    "@type": "Organization",
                    name: w.client
                  }
                }
              : {})
          }
        }))
      },
      {
        "@type": "ItemList",
        "@id": `${base}/#open-source`,
        name: "Open source",
        itemListElement: c.repos.map((r, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "SoftwareSourceCode",
            "@id": `${page(repoQ(r.slug))}#repository`,
            url: page(repoQ(r.slug)),
            name: r.name,
            description: r.summary,
            dateCreated: r.since,
            license: `https://spdx.org/licenses/${r.license}.html`,
            author: { "@id": personId },
            ...(isWeb(r.url) ? { codeRepository: r.url } : {})
          }
        }))
      }
    ]
  };
  // "<" is escaped so content can never close the script tag early.
  const jsonLd = JSON.stringify(graph, null, 2).replace(/</g, "\\u003c");

  return `
    <title>${esc(seo.title)}</title>
    <meta name="description" content="${esc(seo.description)}" />
    <meta name="author" content="${esc(c.name)}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
    <link rel="canonical" href="${base}/" />

    <!-- Icons -->
    <link rel="icon" href="/favicon.ico" sizes="48x48" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />

    <!-- Social previews -->
    <meta property="og:type" content="profile" />
    <meta property="og:site_name" content="${esc(c.name)}" />
    <meta property="og:locale" content="${esc(seo.locale)}" />
    <meta property="og:url" content="${base}/" />
    <meta property="og:title" content="${esc(seo.title)}" />
    <meta property="og:description" content="${esc(seo.description)}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(imageAlt)}" />
    <meta property="profile:first_name" content="${esc(first)}" />
    <meta property="profile:last_name" content="${esc(rest.join(" "))}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(seo.title)}" />
    <meta name="twitter:description" content="${esc(seo.description)}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:image:alt" content="${esc(imageAlt)}" />

    <!-- Location -->
    <meta name="geo.region" content="${esc(seo.location.region)}" />
    <meta name="geo.placename" content="${esc(seo.location.city)}" />
    <meta name="geo.position" content="${seo.location.latitude};${seo.location.longitude}" />
    <meta name="ICBM" content="${seo.location.latitude}, ${seo.location.longitude}" />

    <!-- AI answer engines: plain-text summary of the whole site -->
    <link rel="alternate" type="text/plain" href="/llms.txt" title="${esc(c.name)} — summary for language models" />

    <!-- Structured data -->
    <script type="application/ld+json">
${jsonLd}
    </script>

    <!-- With JavaScript the app replaces the static fallback below; hide it so it never flashes. -->
    <script>document.documentElement.classList.add("js")</script>
    <style>.js #seo-static{display:none}</style>`;
}

/* ---------------------------------------------------- static fallback */

function staticBody(c: SiteContent) {
  const { rel, caseQ, repoQ } = urlsFor(c);
  const li = (s: string) => `<li>${s}</li>`;
  const work = c.works
    .map(
      (w) => `
      <article id="${w.slug}">
        <h3><a href="${esc(rel(caseQ(w.slug)))}">${esc(w.title)}</a></h3>
        <p><strong>${esc(w.kicker)}</strong> · ${esc(w.year)} · ${esc(w.role)} · ${esc(w.client)} · ${esc(w.scope)}</p>
        <p>${esc(w.summary)}</p>
        <ul>${w.points.map((p) => li(esc(p))).join("")}</ul>
      </article>`
    )
    .join("");
  const archive = c.archive.entries
    .map((a) =>
      li(
        `${esc(a.year)} — ${a.case ? `<a href="${esc(rel(caseQ(a.case)))}">${esc(a.title)}</a>` : esc(a.title)} · ${esc(a.kind)}`
      )
    )
    .join("");
  const repos = c.repos
    .map(
      (r) => `
      <article id="${r.slug}">
        <h3><a href="${esc(rel(repoQ(r.slug)))}">${esc(r.name)}</a></h3>
        <p>${esc(r.stars)} stars · ${esc(r.forks)} forks · ${esc(r.license)} · since ${esc(r.since)}</p>
        <p>${esc(r.summary)}</p>
        <ul>${r.points.map((p) => li(esc(p))).join("")}</ul>
        <p><code>${esc(r.install)}</code></p>
      </article>`
    )
    .join("");

  return `
    <div id="seo-static">
      <style>
        #seo-static{height:100%;overflow:auto;background:#0f0f0f;color:#ababab;font:16px/1.6 "Bricolage Grotesque Variable",system-ui,sans-serif}
        #seo-static>*{max-width:760px;margin-inline:auto;padding-inline:24px}
        #seo-static h1,#seo-static h2,#seo-static h3{color:#fafafa;line-height:1.05;font-weight:800;letter-spacing:-.03em;margin:1.6em 0 .5em}
        #seo-static h1{font-size:44px;margin-top:.8em}#seo-static h2{font-size:30px}#seo-static h3{font-size:21px;margin-top:1.2em}
        #seo-static main{padding-bottom:64px}#seo-static ul,#seo-static ol{padding-left:1.2em;list-style:disc}#seo-static ol{list-style:decimal}
        #seo-static li{margin:.2em 0}#seo-static p{margin:.5em 0}#seo-static code{font-family:"JetBrains Mono Variable",monospace;font-size:.9em}
        #seo-static a{color:#fc7a1e}
        #seo-static nav{display:flex;flex-wrap:wrap;gap:8px 20px;padding-block:24px}
      </style>
      <header>
        <p><strong>${esc(c.name)}</strong> — ${esc(c.role)}</p>
        <nav aria-label="Sections">
          <a href="/">Index</a><a href="${esc(rel({ section: "work" }))}">Work</a><a href="${esc(rel({ section: "about" }))}">About</a>
          <a href="${esc(rel({ section: "path" }))}">Path</a><a href="${esc(rel({ section: "open-source" }))}">Open source</a><a href="${esc(rel({ section: "contact" }))}">Contact</a>
        </nav>
      </header>
      <main>
        <h1>${esc(c.index.headline.join(" "))}</h1>
        <p>${esc(c.intro)}</p>
        <ul>${c.index.facts
          .flat()
          .map((f) => li(esc(f)))
          .join("")}</ul>

        <section aria-labelledby="work"><h2 id="work">Work</h2>${work}</section>
        <section aria-labelledby="all-works"><h2 id="all-works">All works (${esc(c.archive.range)})</h2><ul>${archive}</ul></section>

        <section aria-labelledby="about">
          <h2 id="about">About</h2>
          <p>${esc(c.about.statement)}</p>
          ${c.about.columns.map((col) => `<h3>${esc(col.title)}</h3><p>${esc(col.text)}</p>`).join("")}
        </section>

        <section aria-labelledby="experience">
          <h2 id="experience">${esc(c.path.label)}</h2>
          <ol>${c.path.entries.map((e) => li(`<strong>${esc(e.title)}</strong> (${esc(e.when)}) — ${esc(e.text)}`)).join("")}</ol>
        </section>

        <section aria-labelledby="open-source"><h2 id="open-source">Open source</h2>${repos}</section>

        <section aria-labelledby="contact">
          <h2 id="contact">Contact</h2>
          <p><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></p>
          <ul>${c.contact.links
            .filter((l) => isWeb(l.href))
            .map((l) => li(`<a href="${esc(l.href)}">${esc(l.label)}</a>`))
            .join("")}</ul>
        </section>
      </main>
    </div>`;
}

/* ------------------------------------------------------ generated files */

function sitemap(c: SiteContent, today: string) {
  const { page, caseQ, repoQ } = urlsFor(c);
  const entries: [string, number][] = [
    [page(), 1],
    [page({ section: "work" }), 0.9],
    ...c.works.map((w): [string, number] => [page(caseQ(w.slug)), 0.8]),
    [page({ section: "work", view: "all" }), 0.6],
    [page({ section: "about" }), 0.7],
    [page({ section: "path" }), 0.6],
    [page({ section: "open-source" }), 0.7],
    ...c.repos.map((r): [string, number] => [page(repoQ(r.slug)), 0.6]),
    [page({ section: "open-source", view: "all" }), 0.5],
    [page({ section: "contact" }), 0.6]
  ];
  const urls = entries
    .map(
      ([loc, priority]) =>
        `  <url><loc>${esc(loc)}</loc><lastmod>${today}</lastmod><priority>${priority.toFixed(1)}</priority></url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/** AI crawlers named explicitly, so a stricter default elsewhere never shuts them out. */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended"
];

function robots(c: SiteContent) {
  const { base } = urlsFor(c);
  return [
    "User-agent: *",
    "Allow: /",
    "",
    "# Generative search and AI assistants are welcome to read and cite this site.",
    ...AI_CRAWLERS.map((bot) => `User-agent: ${bot}\nAllow: /\n`),
    `Sitemap: ${base}/sitemap.xml`,
    ""
  ].join("\n");
}

/** llms.txt (llmstxt.org): a short Markdown map of the site for language models. */
function llms(c: SiteContent) {
  const { page, caseQ, repoQ } = urlsFor(c);
  return `# ${c.name}

> ${c.seo.description}

${c.intro} Based in ${c.seo.location.city}. Contact: ${c.email}.

## Work

${c.works.map((w) => `- [${w.title}](${page(caseQ(w.slug))}): ${w.kicker} (${w.year}). ${w.summary}`).join("\n")}

## Open source

${c.repos.map((r) => `- [${r.name}](${page(repoQ(r.slug))}): ${r.summary} ${r.license}, ${r.stars} stars.`).join("\n")}

## About

- [About](${page({ section: "about" })}): ${c.about.statement}
- [Experience](${page({ section: "path" })}): ${c.path.entries.map((e) => `${e.title} (${e.when})`).join("; ")}.
- [Contact](${page({ section: "contact" })}): ${c.email}

## Optional

- [Full text](${page().replace(/\/$/, "")}/llms-full.txt): every project, repository and role in one file.
`;
}

/** llms-full.txt: all site content as Markdown, so a model can answer without crawling each page. */
function llmsFull(c: SiteContent) {
  const { page, caseQ, repoQ } = urlsFor(c);
  return `# ${c.name} — ${c.role}

> ${c.seo.description}

- Location: ${c.seo.location.city}, ${c.seo.location.country}
- Email: ${c.email}
- Website: ${page()}
- Topics: ${c.seo.topics.join(", ")}

${c.intro}

${c.index.facts
  .flat()
  .map((f) => `- ${f}`)
  .join("\n")}

## Work

${c.works
  .map(
    (w) => `### ${w.title} — ${w.kicker}

- URL: ${page(caseQ(w.slug))}
- Year: ${w.year} · Role: ${w.role} · Client: ${w.client} · Scope: ${w.scope}

${w.summary}

${w.points.map((p) => `- ${p}`).join("\n")}`
  )
  .join("\n\n")}

### All works (${c.archive.range})

${c.archive.entries.map((a) => `- ${a.year} — ${a.title} (${a.kind})`).join("\n")}

## About

${c.about.statement}

${c.about.columns.map((col) => `- **${col.title}:** ${col.text}`).join("\n")}

## ${c.path.label}

${c.path.entries.map((e) => `- **${e.title}** (${e.when}): ${e.text}`).join("\n")}

## Open source

${c.repos
  .map(
    (r) => `### ${r.name}

- URL: ${page(repoQ(r.slug))}
- ${r.stars} stars · ${r.forks} forks · ${r.license} · since ${r.since}
- Install: \`${r.install}\`

${r.summary}

${r.points.map((p) => `- ${p}`).join("\n")}`
  )
  .join("\n\n")}

## Contact

- Email: ${c.email}
${c.contact.links
  .filter((l) => isWeb(l.href))
  .map((l) => `- ${l.label}: ${l.href}`)
  .join("\n")}
`;
}

function manifest(c: SiteContent) {
  return JSON.stringify(
    {
      name: `${c.name} — Portfolio`,
      short_name: c.name.split(" ")[0],
      description: c.seo.description,
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: "#0F0F0F",
      theme_color: "#0F0F0F",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        {
          src: "/icon-maskable-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable"
        },
        { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }
      ]
    },
    null,
    2
  );
}

/* --------------------------------------------------------------- plugin */

function seo(): Plugin {
  let root = process.cwd();
  const today = () => new Date().toISOString().slice(0, 10);
  const files = (c: SiteContent): Record<string, [string, string]> => ({
    "sitemap.xml": [sitemap(c, today()), "application/xml"],
    "robots.txt": [robots(c), "text/plain"],
    "llms.txt": [llms(c), "text/plain"],
    "llms-full.txt": [llmsFull(c), "text/plain"],
    "site.webmanifest": [manifest(c), "application/manifest+json"]
  });

  return {
    name: "seo-geo",
    configResolved(config) {
      root = config.root;
    },
    transformIndexHtml(html) {
      const c = loadContent(root);
      return html
        .replace("<!-- seo:head -->", headTags(c, today()))
        .replace(
          '<div id="root"></div>',
          `<div id="root">${staticBody(c)}\n    </div>`
        );
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const name = (req.url ?? "").split("?")[0].replace(/^\//, "");
        const file = files(loadContent(root))[name];
        if (!file) {
          return next();
        }
        res.setHeader("Content-Type", `${file[1]}; charset=utf-8`);
        res.end(file[0]);
      });
    },
    generateBundle() {
      for (const [fileName, [source]] of Object.entries(
        files(loadContent(root))
      )) {
        this.emitFile({ type: "asset", fileName, source });
      }
    }
  };
}

/* ==========================================================================================
   3. Font preloads
   ========================================================================================== */

/**
 * Preloads the font files the first screen needs, so the display type renders without
 * waiting for the stylesheet to be parsed. Matches built asset names, e.g.
 * assets/bricolage-grotesque-latin-opsz-normal-[hash].woff2. Build only (dev serves raw CSS).
 */
function preloadFonts(patterns: RegExp[]): Plugin {
  let base = "/";
  return {
    name: "preload-fonts",
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        if (!ctx.bundle) {
          return html;
        }
        // In pattern order (not bundle order), so the output is stable and the display font comes first.
        const names = Object.keys(ctx.bundle);
        const files = patterns.flatMap((p) => names.filter((f) => p.test(f)));
        return {
          html,
          tags: files.map((f) => ({
            tag: "link",
            attrs: {
              rel: "preload",
              href: base + f,
              as: "font",
              type: "font/woff2",
              crossorigin: ""
            },
            injectTo: "head-prepend" as const
          }))
        };
      }
    }
  };
}

/* ==========================================================================================
   Config
   ========================================================================================== */

export default defineConfig({
  plugins: [
    markdownContent(),
    seo(),
    // Latin subsets of the two Fontsource variable fonts: everything above the fold uses them.
    preloadFonts([
      /bricolage-grotesque-latin-opsz-normal-.*\.woff2$/,
      /jetbrains-mono-latin-wght-normal-.*\.woff2$/
    ]),
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
    tsconfigPaths: true
  },
  build: {
    outDir: "build",
    emptyOutDir: true
  }
});
