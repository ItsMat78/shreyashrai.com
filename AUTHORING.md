# Authoring guide

Every piece of content is a Markdown file with typed frontmatter. A malformed
frontmatter block **fails `astro build` loudly** instead of shipping a broken
page — so if the build passes, the page is valid.

---

## Content types at a glance

| Type | Folder | Route | Title? | What it's for |
| --- | --- | --- | --- | --- |
| **TIL** | `src/content/til/` | `/til/<slug>` | yes | Small, concrete things learned (a snippet + a gotcha) |
| **Writing** | `src/content/blog/` | `/blog/<slug>` | yes | Longer posts where you think something through |
| **Link** | `src/content/links/` | `/links/<slug>` | yes | A pointer OUT at someone else's thing + a line of commentary |
| **Quote** | `src/content/quotes/` | `/quotes/<slug>` | no (source is the heading) | Commonplace book |
| **Project** | `src/content/projects/` | `/projects/<slug>` | yes | Things you built |

**`/notes` is not a content type** — it's a page that pools the newest TILs,
Writing, Links, and Quotes into one river. To "post a note," post one of those
four. `/stream` does the same across everything.

The **filename** (minus `.md`) becomes the URL slug. Keep it lowercase-kebab
(e.g. `size-t-underflow.md` → `/til/size-t-underflow`).

---

## Publishing

1. `npm run dev` — preview locally (hot-reloads).
2. `npm run build` — **must pass**; it validates all frontmatter and builds the
   search index.
3. **Commit and push to `main`** — that deploys.

**Drafts:** set `draft: true` to keep an entry out of every build, list, feed,
and the search index until it's ready.

---

## Templates

Copy-paste these. Fields marked `# optional` can be deleted.

### TIL — `src/content/til/<slug>.md`

Shortcut: `npm run new:til -- "Your title here"` creates the file pre-filled
with today's date.

```md
---
title: "size_t is unsigned, so counting down past zero wraps"
date: 2026-07-05
tags: ["c++", "gotchas"]
---

Write the TIL here. Markdown, `code fences`, and $LaTeX$ math all work.
```

### Writing (blog) — `src/content/blog/<slug>.md` (`.mdx` also allowed)

```md
---
title: "How this site works"
date: 2026-07-05
description: "Short teaser — used in the list, the meta description, and the feed."
tags: ["meta"]
---

The long-form post.
```

### Link — `src/content/links/<slug>.md`

The `url` is the outbound target; the **body is your commentary**.

```md
---
title: "The Astro Content Layer API"
url: "https://docs.astro.build/en/guides/content-collections/"
date: 2026-07-05
tags: ["astro", "meta"]
via: "where you found it"            # optional
viaUrl: "https://source.example"     # optional
---

One or two lines on why it's worth reading.
```

### Quote — `src/content/quotes/<slug>.md`

**No title** — the `source` is the heading, the **body is the quote**. All
attribution is optional; a sourceless quote just renders with no cite line.

```md
---
date: 2026-07-05
source: "Who said it"                # optional
sourceUrl: "https://origin.example"  # optional
tags: []
via: "who pointed you to it"         # optional
viaUrl: "https://finder.example"     # optional
---

"The quote goes in the body."
```

### Project — `src/content/projects/<slug>.md`

Projects are hand-ordered pages (no `date`). The body is the writeup shown at
`/projects/<slug>`.

```md
---
title: "Lagrange-Lock"
blurb: "One-liner for the list teaser and the page meta description."
outcome: "The concrete result, led with (e.g. 'Held L1 orbit 5,000+ steps')."
tech: ["Python", "Reinforcement learning", "Numba", "Three.js"]
order: 1                          # 1 = top of the list (required)
cover: /images/lagrange-lock.png  # optional — the card image on phones
headerArt: /header/Satellite.png  # optional — transparent art in the header + list row
live: https://example.com         # optional
source: https://github.com/you/repo   # optional
---

The long-form writeup.
```

---

## Shared optional fields (TIL / Writing / Link)

| Field | Type | Effect |
| --- | --- | --- |
| `draft` | boolean | Hide the entry everywhere until ready (default `false`) |
| `tags` | string[] | Groups the entry; powers `/tags` and per-tag RSS feeds |
| `featured` | boolean | Surfaces the entry in the home page "Featured" slot |
| `series` + `part` | string + number | Give related entries the same `series` and a `part` number to get prev/next series navigation |

---

## Header art (the transparent PNG in the empty side of a header)

**On a page** (home, notes, projects list, about, uses, …) — add `image` to that
page's `<PageHeader>`:

```astro
<PageHeader eyebrow="…" lines={heading} image="/header/Name.png" imageAlt="">
```

**On a project** — set `headerArt` in the project's frontmatter (see template).
That one file shows in BOTH the project's detail-page header and its row on the
projects list.

Put the files in **`public/header/`** and reference them as `/header/Name.png`.
They're pinned to the empty side of the header with a hard drop-shadow, and are
**hidden on phones** (no empty side there).

### Recommended image dimensions

Images use `object-fit: contain` — the PNG scales to fit its box, keeps its
aspect ratio, and centers. The display boxes (at the site's full width):

| Where | Max display box |
| --- | --- |
| Page masthead | ~**410 × 350 px** (height varies slightly per page) |
| Projects-list row | **332 × 220 px** |

Export so they line up **and** stay crisp:

- **Aspect ratio 3:2** — fills the row exactly, and keeps the masthead art sized
  by its *width* so it's the same size on every page.
- **1200 × 800 px** transparent PNG — ~3× the display size, so it's retina-sharp.
- **~10% empty margin** around the element inside the canvas, so the drop-shadow
  and the element's edges don't get clipped by the header's `overflow: hidden`,
  and every element reads at a consistent size.
- Keep the file **under ~300 KB**.

---

## Images inside a post

Put the file in **`public/images/`** and reference it as `/images/foo.png` —
**not** `/public/images/...` (that path 404s).

Always set the real pixel `width` and `height` so the page doesn't jump when the
image loads (zero layout shift):

```html
<img src="/images/diagram.png" alt="what it shows" width="646" height="132">
```

Plain Markdown `![alt](/images/foo.png)` works too, but a raw `<img>` with
`width`/`height` is the zero-shift way.
