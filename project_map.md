# project_map.md

Precise map of shreyashrai.com so any conversation can orient without reading
the whole codebase. Keep this updated when a feature is added.

## What it is

Static personal site (Astro 5, TypeScript, plain CSS, tiny client JS for the
theme toggle only). Content-first: every TIL/post is a Markdown file with typed
frontmatter. Editorial "brand-guidelines spread" design — huge Fraunces display
serif set in electric blue on warm cream, with the signature "scatter" headline
(a phrase broken into fragments that tumble down the page at mixed sizes/weights/
italics). Schibsted Grotesk carries body + the tiny uppercase specimen labels.
Dark/light is user-switchable. Deploys to Cloudflare Pages.

## Stack

- Astro 5.18 (`output: static`), `site: https://shreyashrai.com`
- Integrations: `@astrojs/mdx`, `@astrojs/sitemap`
- Feeds: `@astrojs/rss` + `markdown-it` + `sanitize-html` (full content)
- Shiki dual theme: `github-light` / `github-dark-dimmed`, `defaultColor: false`
- Fonts self-hosted in `public/fonts` (sourced from `@fontsource-variable/*`).
  Fraunces is the FULL variable build (opsz + wght + SOFT + WONK axes) plus an
  italic cut — that's what makes the playful high-contrast display work.

## Content model (`src/content.config.ts`)

- `til` — `src/content/til/*.md`. Frontmatter: `title`, `date`, `tags?`,
  `draft?`.
- `blog` — `src/content/blog/*.{md,mdx}`. Same + `description?`.
- Slug = filename. Zod-validated; malformed frontmatter fails the build.

## Key modules

- `src/lib/content.ts` — THE place for draft filtering, sorting (date desc, id
  tiebreak), tag normalisation. Exports: `getTils`, `getPosts`, `getTilEntries`,
  `getPostEntries`, `getAllEntries`, `getAllTags`, `getEntriesByTag`,
  `normalizeTag(s)`. Type `EntryItem` is the flattened list shape.
- `src/lib/feed.ts` — `buildFeed(context, {title, description, sources})`;
  renders full markdown to sanitised HTML, newest-first, capped at 30.
- `src/consts.ts` — `SITE_TITLE`, `SITE_DESCRIPTION`, `GITHUB_URL`, `EMAIL`,
  `NAV`.
- `src/data/projects.ts` — `projects: Project[]` for the /projects page.

## Components & layouts

- `layouts/Base.astro` — html shell (BaseHead + Header + main + Footer),
  imports `global.css`. Props: `title`, `description?`, `type?`.
- `layouts/Article.astro` — single TIL/post shell (display title + meta + prose
  slot). Props: `title`, `date`, `tags`, `description?`.
- `components/`: `BaseHead` (meta/canonical/OG/font-preload/feed link + inline
  no-flash theme script that sets `<html data-theme>` before paint),
  `Header` (name + nav + `ThemeToggle`), `Footer`, `FormattedDate` (UTC,
  `short`/`long`), `EntryList` (shared dated list; props `items`,
  `showDescription?`, `showKind?`), `TagList`.
- `components/ScatterHead.astro` — THE signature. Renders a display phrase as
  tumbling fragments. Prop `lines: Fragment[]` where each fragment has
  `text`, `size?` (`s|m|l|xl`), `weight?` (300–900), `italic?`, `shift?` (CSS
  indent), `wonk?` (0–1). `as?` picks the element (default `h1`).
- `components/PageHeader.astro` — the shared editorial opener on every page:
  a `FrameField` grid + blue `eyebrow` kicker + `ScatterHead` title + a deck
  passed as children (`<p class="masthead__deck">…</p>`). `dense` prop packs
  more frames (home hero). This is what makes the pages cohere.
- `components/FrameField.astro` — decorative loose grid of thin outlined
  rectangles behind a header (the "kinetic type" spread device). aria-hidden,
  non-interactive, clipped by the masthead so boxes bleed off-edge. `dense`
  adds extras. Frames beyond the 3rd hide on phones.
- `components/ThemeToggle.astro` — the dark/light button + its tiny wiring
  script (flips `data-theme`, persists to `localStorage`, syncs its own icon).

## Routes (`src/pages`)

- `index.astro` — home: deck + latest 5 TILs + latest 3 posts + feed link.
- `til/index.astro` — all TILs, grouped by year. `til/[slug].astro` — one TIL.
- `blog/index.astro` — all posts. `blog/[slug].astro` — one post.
- `projects.astro`, `about.astro`.
- `tags/index.astro` — all tags + counts. `tags/[tag].astro` — mixed list.
- `rss.xml.ts` (combined), `til/rss.xml.ts`, `blog/rss.xml.ts`.
- `404.astro`. Sitemap auto-generated at `/sitemap-index.xml`.

## Design tokens & signature (`src/styles/global.css`)

CSS custom properties in `:root`: `--paper(#faf8f2) --paper-2 --ink --muted
--accent(#1f2ae6) --accent-strong --rule --code-bg`, font stacks, `--text-base`,
spacing `--space-1..5`, widths `--page(64rem) --measure(66ch) --measure-read`.
- **Dark mode** keys off `:root[data-theme='dark']` (explicit user choice) AND
  `@media (prefers-color-scheme: dark) :root:not([data-theme='light'])` (no-JS
  system fallback). Shiki dark switch mirrors the same two rules. The head
  script always sets `data-theme` so the toggle has something to flip.
  Dark palette is "dark russian yellow": deep warm brown-black paper, parchment
  ink, and a mustard-gold `--accent(#e3b23c)` — so headings glow gold in dark,
  blue in light (accent flips, everything else follows).
- **Paper grain**: `body::before` fixed overlay, inline SVG `feTurbulence`,
  desaturated, blended at `--tex-opacity` / `--tex-blend` (multiply light,
  soft-light dark). Purely decorative, behind all content.
- **Frames**: `.frames`/`.frame` outlined boxes; colour `--frame-line`
  (`color-mix` of accent, so blue in light / gold in dark). Masthead is
  `isolation:isolate; overflow:hidden` so frames sit behind the text at z-1.
- **Kinetic tilt**: scatter fragments take an optional `rot` (deg); section &
  year heads are accent-coloured and tilted ~-1.2°, spreading the scattered
  look through the whole page, not just the header.
- **`.scatter` / `.scatter__line--{s,m,l,xl}`** = the tumbling headline. Size via
  class; weight/italic/`--shift`/`--wonk` set inline per fragment. `--shift`
  capped at `22vw` so a big indent never causes horizontal scroll on a phone.
- **`.masthead` + `.eyebrow`** = the per-page editorial header (blue kicker,
  scatter title, deck, hairline underneath).
- `.display--title` = single-entry (TIL/post) title, big blue Fraunces.
- Annotation voice = 0.75rem uppercase for all metadata. Hairline rules between
  list entries; entry titles are Fraunces serif.

## Authoring

- Add TIL: create `src/content/til/slug.md` (or `npm run new:til -- "Title"`),
  push. Cloudflare rebuilds. `draft: true` hides from build.
- `scripts/new-til.mjs` — zero-dep scaffolder.

## Deviations / decisions

- Pinned Astro 5 (not 7): 7's XSS advisories don't apply to a static
  single-author site and 7 changes the markdown engine. See README.
- Manual dark/light toggle IS present (was deferred in v1): a ~20-line inline
  script is the only client JS. Everything else still ships zero JS.
- Faithful-not-literal to the reference spread: the reference is all-blue type
  on cream (a specimen, not a reading page). We keep blue for the display/hero
  and accents but ink for body/lists/prose so content stays readable.
- v2 candidates (deferred): Pagefind search, OG images, per-tag feeds,
  /til pagination.
