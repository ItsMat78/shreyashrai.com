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

## Writing with Obsidian

This repository can be opened directly as an [Obsidian](https://obsidian.md/)
vault. It includes two site-specific additions so Markdown looks closer to the
published website and common content blocks are easier to author:

- **Shreyashrai theme** — `.obsidian/themes/Shreyashrai/`. Styles reading view
  and Live Preview, including semantic `<figure>` and `<figcaption>` blocks.
- **Site Commands plugin** — `.obsidian/plugins/site-commands/`. Adds authoring
  commands and makes site-root image paths such as `/images/photo.png` resolve
  from `public/images/photo.png` in Obsidian's rendered preview.

Both require Obsidian **1.4.0 or newer**. The bundled theme is version **1.0.0**
and Site Commands is version **1.0.1**; their manifests are the authoritative
source for current compatibility information.

Only these maintained additions are committed. Personal Obsidian settings,
workspace layout, caches, and third-party plugin data remain ignored.

### Set up the vault

1. Install Obsidian and choose **Open folder as vault**.
2. Select the repository root—the folder containing this README and
   `src/content/`.
3. Open **Settings → Appearance → Themes**, then select **Shreyashrai**.
4. Open **Settings → Community plugins**, turn off **Restricted mode** if
   prompted, and enable **Site Commands** under **Installed plugins**.
5. If the theme or plugin is not listed immediately, use **Reload app without
   saving** from Obsidian's command palette or restart Obsidian.

The plugin is local to this repository and is not installed from Obsidian's
community marketplace. Its source is available at
`.obsidian/plugins/site-commands/main.js` for review before enabling it.

### Site Commands

Open the command palette (`Ctrl/Cmd+P`) and search for **Site Commands**, or use
Obsidian's slash-command interface when enabled:

| Command | Purpose |
|---------|---------|
| Figure | Insert a semantic `<figure>`, `<img>`, and `<figcaption>` block |
| TIL | Fill an empty note with valid TIL frontmatter |
| Blog | Fill an empty note with valid blog frontmatter |
| Link | Fill an empty note with valid link frontmatter |
| Quote | Fill an empty note with valid quote frontmatter |
| Project | Fill an empty note with valid project frontmatter |

The content templates only operate on empty notes. Figure insertion works at
the current cursor position. Keep website image URLs rooted at `/images/` or
`/header/`; the plugin translates them for Obsidian preview without changing
the Markdown used by Astro.

After pulling updates to either addition, restart Obsidian or reload the app so
its CSS and plugin code are refreshed.

---

## Deploy (Cloudflare Pages)

1. Push this repo to GitHub.
2. Cloudflare Pages → **Create a project** → connect the repo.
3. Framework preset: **Astro**. Build command: `npm run build`. Output:
   `dist`.
4. Add the custom domain `shreyashrai.com`.

Every push to main redeploys.

Optional integrations (all gated — empty config ships nothing):

- **Analytics:** Cloudflare Web Analytics, page views, privacy-first. Two ways
  in — **use one, never both**, or every hit is counted twice:
  1. *(simplest)* Workers & Pages → this project → **Metrics** → **Enable**
     under Web Analytics. Cloudflare injects its own beacon on the next build.
     Leave `PUBLIC_CF_ANALYTICS_TOKEN` unset; the wiring below stays idle.
     Note the Metrics tab ALSO shows Pages' own request/bandwidth numbers,
     which are server-side and always on — those are not page views.
  2. Self-injected: get the site token (dashboard → Analytics & Logs → **Web
     Analytics**, which is account-level, not inside the domain — direct link
     `https://dash.cloudflare.com/?to=/:account/web-analytics` → add site →
     Manage site → the `data-cf-beacon` token in the snippet), then set
     `PUBLIC_CF_ANALYTICS_TOKEN` in the Pages project under Settings →
     Variables (Production, plus Preview to count preview traffic) and in a
     local `.env` for dev. See `.env.example`. The repo is public, so the token
     is kept out of it; no variable set means no script ships.

  Either way the beacon is JS, so feed readers hitting `/rss.xml` never appear
  in it — those show up in Cloudflare's server-side traffic view instead.
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
