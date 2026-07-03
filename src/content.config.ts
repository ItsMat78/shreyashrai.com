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

export const collections = { til, blog };
