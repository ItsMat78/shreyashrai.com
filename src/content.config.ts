import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Two collections, both authored as Markdown with typed frontmatter.
// A malformed frontmatter block fails `astro build` loudly instead of
// shipping a broken page — that is the whole point of validating here.

// Shared frontmatter fields. `date` accepts a plain `YYYY-MM-DD` string and
// coerces it to a Date. Tags default to an empty array so pages never have to
// guard against `undefined`.
const baseFields = {
  title: z.string(),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  // Drafts are excluded from every build, list, and feed. Present on both
  // collections so a half-written TIL can't ship by accident.
  draft: z.boolean().default(false),
  // Multi-part writing: give related entries the same `series` name and a
  // `part` number to get prev/next series navigation on each one.
  series: z.string().optional(),
  part: z.number().optional(),
  // Surface a standout entry in the "Featured" slot on the home page.
  featured: z.boolean().default(false),
};

const til = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/til' }),
  schema: z.object({
    ...baseFields,
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    ...baseFields,
    // Used in list pages, the meta description, and the feed item summary.
    description: z.string().optional(),
  }),
});

// Projects are pages, not dated entries: no date/tags, ordered by hand.
// The body is the long-form writeup shown at /projects/[slug].
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    // One-liner for the list page teaser and the page meta description.
    blurb: z.string(),
    // The concrete result, led with on the list/detail pages so a skimmer gets
    // impact before prose (e.g. "100+ users, ~60k daily DB queries").
    outcome: z.string().optional(),
    // Scannable stack tags (e.g. ["Python", "PyTorch"]).
    tech: z.array(z.string()).default([]),
    // Optional cover image (path under /public, e.g. "/images/foo.png").
    // Shown as the card image on phones and the slide-in behind the title on
    // desktop. Projects without one fall back to a tinted panel.
    cover: z.string().optional(),
    // Hand-set list position (1 = top).
    order: z.number(),
    live: z.string().url().optional(),
    source: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

// Link blog ("blogmarks", the Simon Willison staple): a short post that points
// OUT at someone else's thing with a line of commentary. `url` is the outbound
// target; the Markdown body is the note. `via` credits where it was found.
const links = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/links' }),
  schema: z.object({
    ...baseFields,
    url: z.string().url(),
    via: z.string().optional(),
    viaUrl: z.string().url().optional(),
  }),
});

// Quotations: a quote (the Markdown body) + who said it. No title — the source
// is the heading. Optional `sourceUrl` links the origin; `via` credits the
// finder. Deliberately tiny.
const quotes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/quotes' }),
  schema: z.object({
    date: z.coerce.date(),
    source: z.string(),
    sourceUrl: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    via: z.string().optional(),
    viaUrl: z.string().url().optional(),
  }),
});

export const collections = { til, blog, projects, links, quotes };
