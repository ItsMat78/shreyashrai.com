# shreyashrai.com

A small, fast, content-first personal site. Publishing is the whole point:
add a Markdown file, push to git, Cloudflare Pages rebuilds. Built with
[Astro](https://astro.build) 5, ships as a static site with almost no client
JavaScript (theme toggle and code-copy buttons only).

Light mode is the default. Visitors can switch to dark with the header toggle;
the choice persists in `localStorage`.

---

## The daily loop

Most days you add a **TIL** ("Today I Learned") — a short, dated, tagged note.

1. Create `src/content/til/my-slug.md` (filename → `/til/my-slug`), or scaffold
   one:

   ```bash
   npm run new:til -- "My title"
   ```

2. Fill frontmatter and write the body:

   ```markdown
   ---
   title: "Your title here"
   date: 2026-07-03
   tags: ["c++", "gotchas"]   # optional
   draft: true/false          # optional
   ---

   Your note. Code blocks get syntax highlighting automatically.
   ```

3. Commit and push. Cloudflare rebuilds in about a minute.

**Tags** are optional and case-insensitive. **`draft: true`** keeps something
out of the production build while you work on it (drafts still show in
`npm run dev`).

---

## Other content kinds

All content lives under `src/content/` as Markdown (or MDX for blog). Slug =
filename. Malformed frontmatter **fails the build** instead of shipping broken
pages.

| Kind | Path | URL | Notes |
|------|------|-----|-------|
| TIL | `til/*.md` | `/til/[slug]` | Short dated notes |
| Blog | `blog/*.{md,mdx}` | `/blog/[slug]` | Longer posts; optional `description` |
| Links | `links/*.md` | `/links/[slug]` | Link blog; requires `url` in frontmatter |
| Quotes | `quotes/*.md` | `/quotes/[slug]` | Commonplace book; `source` instead of title |
| Projects | `projects/*.md` | `/projects/[slug]` | Not dated; `blurb`, `order`, optional `live`/`source` |

**Series:** add matching `series` + `part` frontmatter across files for
prev/next navigation.

**Featured:** `featured: true` surfaces an entry in the home Featured slot.

**Cross-links:** `[[path to md file]]` or `[[path to md file|label]]` in any Markdown body links
across collections. The target page lists reverse mentions under "Mentioned in".

### Blog post example

```markdown
---
title: "Post title"
date: 2026-07-03
description: "One sentence for lists, meta, and feeds."
tags: ["astro"]
---

Body.
```

### Link example

```markdown
---
date: 2026-07-03
url: https://example.com/article
via: Author Name        # optional
viaUrl: https://...     # optional
tags: ["web"]
---

Your note about why this link is worth reading.
```

### Project example
```
title: Lagrange-Lock
blurb: "Secondary description"          # only visible on projects page
outcome: "Primary description"
tech: ["A","B"]
order: Number                           # What order it appears in
cover: /images/[project_image.png]      # what is showed for mobile users
headerArt: /header/[project_header.png] # what is showed to PC users
live: [Deployment link]
source: [Repository Link]
```

---

## Header art & images

**Header art** is an optional transparent-PNG element parked in the empty side of
a page header (hidden on phones).

- On a page — add `image="/header/Name.png"` to that page's `<PageHeader>`.
- On a project — set `headerArt: /header/Name.png` in the frontmatter; it shows
  in both the project's detail-page header and its row on the projects list.

Files go in `public/header/`. They use `object-fit: contain`, so the PNG scales
to fit its box (keeps aspect ratio, centers). Display boxes at full width:
masthead ~**410 × 350 px**, projects-list row **332 × 220 px**.

**Recommended export** — so images line up and stay crisp: a **3:2, 1200 × 800 px**
transparent PNG, element centered with **~10% empty margin** (so the drop-shadow
and edges aren't clipped), kept **under ~300 KB**.

**Images inside a post:** put the file in `public/images/` and reference it as
`/images/foo.png` (not `/public/images/...`, which 404s). Always set the real
`width`/`height` so the layout doesn't shift as it loads:

```html
<img src="/images/diagram.png" alt="what it shows" width="646" height="132">
```

---

## Deploy (Cloudflare Pages)

1. Push this repo to GitHub.
2. Cloudflare Pages → **Create a project** → connect the repo.
3. Framework preset: **Astro**. Build command: `npm run build`. Output:
   `dist`.
4. Add the custom domain `shreyashrai.com`.

Every push to main redeploys.

Optional integrations (all gated — empty config ships nothing):

- **Analytics:** set `CF_ANALYTICS_TOKEN` in `src/consts.ts`
- **Newsletter:** set `BUTTONDOWN_USER` (Buttondown auto-sends from RSS)
- **Comments:** set all four `GISCUS` fields (GitHub Discussions + giscus app)

---

## Where things live

```
src/
  content/              # all publishable Markdown (til, blog, links, quotes, projects)
  content.config.ts     # Zod frontmatter schemas
  consts.ts             # site title, nav, social links, optional service tokens
  lib/content.ts        # draft filtering, sorting, tags, wikilinks helpers
  lib/feed.ts           # RSS + JSON Feed builders
  lib/remark-wikilinks.mjs
  styles/global.css     # design system — colours are CSS custom properties
  layouts/ components/  # page shell and reusable pieces
  pages/                # routes (see below)
public/
  fonts/                # self-hosted Fraunces + Schibsted Grotesk (woff2)
  images/               # static assets — reference as /images/...
scripts/
  new-til.mjs           # TIL scaffolder
```

### Routes

**Pages:** `/` · `/til` · `/blog` · `/links` · `/quotes` · `/projects` ·
`/stream` (firehose of all dated kinds) · `/tags` · `/tags/[tag]` · `/search` ·
`/about` · `/now` · `/uses`

**Feeds:** `/rss.xml` (combined) · `/feed.json` · `/til/rss.xml` ·
`/blog/rss.xml` · `/links/rss.xml` · `/quotes/rss.xml` ·
`/tags/[tag]/rss.xml`

**Other:** `/404` · `/sitemap-index.xml` · `/og/...` (build-time share cards)

### Changing the look

Every colour and space is a CSS custom property at the top of
`src/styles/global.css`. The light-mode accent is `--accent` (electric blue);
dark mode switches to a warm gold. The scatter headline, frame grid, and Fraunces
display type are the signature — see `project_map.md` for the full design map.

---

## Astro version

Pinned to **Astro 5**. Astro 7 closes some XSS advisories, but those require
server-side rendering or untrusted input — neither applies to a fully static,
single-author site. Astro 7 also changes the markdown engine. Upgrade
deliberately and re-check Markdown/Shiki rendering; no urgency for security
reasons here.
