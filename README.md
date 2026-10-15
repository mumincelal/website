# Mümin Celal Pinar — Portfolio

A full-screen, no-scroll portfolio built with **Vite + React + TypeScript**, styled with **Tailwind CSS v4** and **shadcn/ui** on **Base UI** primitives, animated with **Motion**. All copy lives in **Markdown** files under [`src/content/`](src/content).

It implements a Claude Design prototype. The original handoff bundle (prototype HTML, design transcripts and screenshots) is in this repository's first commit.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build → dist/
npm run preview   # serve the build
```

## Navigation

Six screens, one at a time: Index, Work, About, Path, Open source, Contact.

| Input | Action |
| --- | --- |
| Header nav, `1`–`6` | Jump to a section |
| `↑` `↓` | Previous / next section |
| `←` `→` | Move the Work carousel, or step through a case study or repo; on other screens, change section |
| `Esc` | Leave a case study, repo, or index view |
| `T` | Toggle dark / light |
| Swipe (touch) | Move the Work carousel |

### URLs

Every screen has its own address, kept in the query string with [nuqs](https://nuqs.dev) (`src/utils/query.ts`). Links can be shared or bookmarked, and the browser's Back and Forward buttons move between screens.

| URL | Screen |
| --- | --- |
| `/` | Index |
| `?section=about` · `path` · `contact` | That section |
| `?section=work&project=harbor` | Work carousel on Harbor |
| `?section=work&view=all` | All works |
| `?section=work&case=harbor&shot=2` | Harbor case study, screenshot 02 |
| `?section=open-source&view=all` | All repos |
| `?section=open-source&repo=pg-outbox` | Repo detail |

Slugs are the content file names without their number prefix (`02-harbor.md` → `harbor`). Default values are left out of the URL. Unknown values fall back to the section's main screen, and `shot` is limited to the screenshots that exist. Changing section or opening and closing a detail view adds a history entry. Moving the carousel or switching screenshot tabs replaces the current entry instead. The theme is a preference, not a page, so it stays out of the URL.

Below 860px, screens stop being fixed frames and scroll their own content. The carousel stacks, and the nav collapses to numerals with only the active section labelled. Below 680px, the secondary columns step aside. `prefers-reduced-motion` removes all movement and keeps only fades.

## Editing content

Each file is YAML front matter plus an optional body. The body is a paragraph rendered as inline Markdown, so **bold**, _italic_ and [links](#) work. The files are parsed at build time by a small Vite plugin in `vite.config.ts`, so no Markdown or YAML parser ships to the browser.

| File | Drives |
| --- | --- |
| `src/content/site.md` | Name, role, email, the Index screen (body = intro paragraph), footer marquee, Contact links |
| `src/content/about.md` | About screen (body = the large statement) |
| `src/content/path.md` | Experience rows |
| `src/content/archive.md` | "All works" index. Set `case: <slug>` to link a row to a case study |
| `src/content/works/NN-slug.md` | One carousel slide and case study per file (body = summary) |
| `src/content/repos/NN-slug.md` | One open-source card and detail page per file (body = summary) |

The numeric filename prefix sets the order. The slug is the filename without it, so `03-cadence.md` has the slug `cadence`.

**Adding a project:** create `src/content/works/05-something.md` with the same fields as an existing one. The carousel, dots, counters, case study and prev/next all pick it up. Add a matching row in `archive.md` with `case: something`.

**Adding a repo:** create `src/content/repos/06-name.md`. Cards show the first six. All repos are listed in the "All repos" index, which splits into two columns past ten.

## Structure

```
components.json           shadcn/ui config (base-nova style = Base UI, CSS variables, @/ alias)
src/
  content/                Markdown content (see above)
  main.tsx                Entry: mounts <App /> and loads the global styles
  app.tsx                 View state, keyboard shortcuts, theme, intro curtain
  pages/                  One file per screen
    home.tsx              01 Index
    work.tsx              02 Work carousel
    all-works.tsx         02 All works index
    work-detail.tsx       02 Case study
    about.tsx             03 About
    path.tsx              04 Path
    open-source.tsx       05 Open source cards
    all-repos.tsx         05 All repos index
    repo-detail.tsx       05 Repo detail
    contact.tsx           06 Contact
  components/             Shared pieces: header, footer, curtain, texture, primitives
    ui/                   shadcn components on Base UI: button, card, tabs, separator
  styles/globals.css      Tailwind entry: theme tokens, motion travel variables, custom utilities
  utils/
    cn.ts                 cn() — clsx + tailwind-merge
    content.ts            Typed access to the parsed Markdown content
    nav.ts                Section list and URL slugs
    query.ts              URL state (nuqs): parsers, current screen, navigation actions
    motion.ts             Motion presets: one easing curve, shared durations
```

All file names under `src/` are kebab-case. Components are imported through the `@/` alias, for example `@/pages/work-detail` or `@/components/ui/button`.

## Styling

The design tokens are mapped onto **shadcn's CSS variables** in `src/styles/globals.css`. Light values are on `:root` and dark values on `.dark`. `<html class="dark">` is the default, and `T` toggles the class.

| Design role | shadcn variable | Tailwind class |
| --- | --- | --- |
| Ground / text | `--background` / `--foreground` | `bg-background`, `text-foreground` |
| Accent `#FC7A1E` | `--primary` | `text-primary`, `bg-primary` |
| Panels, tiles | `--card` | `bg-card` |
| Hover surface | `--accent` | `hover:bg-accent` |
| Labels ("dim") | `--muted-foreground` | `text-muted-foreground` |
| Hairlines | `--border` | `border` (the default colour) |
| Secondary copy | `--fg2` | `text-fg2` |
| Faintest labels | `--faint` | `text-faint` |
| Sketch fills | `--stripe` | `bg-stripe` |

`--radius` is `0`, so shadcn components keep the design's square edges.

- **Breakpoints** come from the design and are mobile-first: base styles are for phones, `sm:` is ≥ 680px and `md:` is ≥ 860px (desktop, fixed frames).
- **Motion:** all animation runs on [Motion](https://motion.dev) (`motion/react`). Presets in `src/utils/motion.ts` (`fade`, `rise`, `wipe`, `maskUp`, `slideIn`, `roll`, `loop`) share one easing curve and duration scale: spread one onto a motion element, `<motion.div {...rise(0.28)} />`. Travel distances read the `--travel-x` / `--travel-y` CSS variables, which shrink below 860px. Base UI parts animate through their `render` prop (`<Separator render={<motion.div {...wipe()} />} />`). The carousel swipe uses Motion `drag`. `MotionConfig reducedMotion="user"` honours the OS setting: no movement, fades only, and the endless loops hold still. CSS keeps only simple hover transitions.
- **Custom utilities:** `mono-label`, `mono-eyebrow`, `text-outline` (ghost numerals) and `no-scrollbar`.
- **shadcn components** are built on [Base UI](https://base-ui.com) (`@base-ui/react`), not Radix. They were added as source and adapted to the design:
  - Button has `outline`, `line` and `ghost` variants, plus `none` and `lg` sizes.
  - Card takes Base UI's `render` prop, so a whole repo card can be a `<button>`: `<Card render={<button />}>`.
  - Tabs has a `line` variant, used for the case-study screenshot tabs. The active tab is styled through Base UI's `data-active` attribute.
- **Adding components:** run `npx shadcn@latest add <component>` (for example `dialog` or `tooltip`).

## Placeholders still to replace

- The screenshot areas in the carousel and case studies are abstract sketches. Swap in real images when you have them.
- The `url` and `href` values in content are `#`.
- The "GH" mark on repo cards is typographic. Use the official GitHub mark if you want the real logo.
