# shreyashrai.com

A small, fast, content-first personal site. Publishing is the whole point:
adding a post = adding a Markdown file and pushing to git. Built with
[Astro](https://astro.build), ships as a static site with near-zero client
JavaScript.

---

## Add a TIL (the daily loop)

A TIL ("Today I Learned") is a short, dated, tagged note. To add one:

1. Create a file `src/content/til/my-slug.md`. The filename becomes the URL
   (`/til/my-slug`). Or run `npm run new:til -- "My title"` to scaffold it.
2. Fill the frontmatter and write the body:

   ```markdown
   ---
   title: "Your title here"
   date: 2026-07-03
   tags: ["c++", "gotchas"]   # optional
   ---

   Your note. A few paragraphs, code blocks if you want — they get syntax
   highlighting automatically.
   ```

3. Commit and push:

   ```bash
   git add src/content/til/my-slug.md
   git commit -m "til: your title"
   git push
   ```

Cloudflare Pages rebuilds and deploys automatically in about a minute. That's
the entire workflow.

- **Tags** are optional and case-insensitive (`C++` and `c++` are the same tag).
- **Drafts:** add `draft: true` to the frontmatter to keep something out of the
  build while you work on it. Drafts still show up in `npm run dev`.

## Add a blog post

Same as a TIL, but the file goes in `src/content/blog/` and you can add a
`description` (used in list pages, the page's meta description, and the feed):

```markdown
---
title: "Post title"
date: 2026-07-03
description: "One sentence that shows up in lists and previews."
tags: ["astro"]
draft: false
---

Body.
```

If the frontmatter is malformed (missing title, bad date), the build **fails
loudly** instead of shipping something broken.

## Run it locally

```bash
npm install        # once
npm run dev        # local dev server with live reload, at http://localhost:4321
npm run build      # produce the static site in dist/
npm run preview    # serve the built dist/ locally to check it
```

## Deploy (Cloudflare Pages)

The site builds to a static `dist/` folder that any static host can serve. For
Cloudflare Pages:

1. Push this repo to GitHub.
2. In Cloudflare Pages, **Create a project → connect the repo**.
3. Framework preset: **Astro**. Build command: `npm run build`. Output
   directory: `dist`.
4. Add the custom domain `shreyashrai.com` in the Pages project. Only the apex
   domain changes — the existing `timetable.` and `lagrange-lock.` subdomains
   are untouched.

Every push to the main branch redeploys.

## Where things live

```
src/
  content/til/*.md      # TILs — add a file to publish
  content/blog/*.md     # blog posts
  content.config.ts     # frontmatter schemas (Zod) — the build validates against these
  data/projects.ts      # the /projects list — edit this to add a project
  consts.ts             # site title, description, GitHub/email links, nav
  lib/content.ts        # all draft-filtering, sorting, and tag logic (one place)
  lib/feed.ts           # RSS feed builder (full-content)
  styles/global.css     # the whole design system; the accent colour is --accent
  layouts/ components/  # page shell and reusable pieces
  pages/                # routes (see below)
public/
  fonts/                # self-hosted Fraunces + Schibsted Grotesk (woff2)
  favicon.svg, robots.txt
```

**Routes:** `/` · `/til` · `/til/[slug]` · `/blog` · `/blog/[slug]` ·
`/projects` · `/about` · `/tags` · `/tags/[tag]` · `/rss.xml` (combined feed) ·
`/til/rss.xml` · `/blog/rss.xml` · `/404`.

**Changing the look:** every colour and space is a CSS custom property at the
top of `src/styles/global.css`. The single accent colour is `--accent` (an
electric blue); change it in one place for both light and dark mode.

## A note on the Astro version

This is pinned to **Astro 5**. A newer major (Astro 7) exists and closes some
XSS advisories, but those advisories require server-side rendering, server
islands, or untrusted input — none of which a fully static, single-author site
like this has, so the practical exposure is nil. Astro 7 also swaps in a new
markdown engine. When you next revisit the site, upgrading is a good task to do
deliberately (test the Markdown/Shiki rendering after bumping); there's no
urgency for security reasons.
