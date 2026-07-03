// Build-time Open Graph share cards — one 1200×630 PNG per entry plus a site
// default — so links shared to social show a designed card instead of a blank
// box. astro-og-canvas renders each card with canvaskit at build; the meta tags
// in BaseHead point at /og/<path>.png.
import { OGImageRoute } from 'astro-og-canvas';
import {
  getTilEntries,
  getPostEntries,
  getProjectEntries,
  getLinkEntries,
} from '../../lib/content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../../consts';

type Card = { title: string; description: string; eyebrow: string };

const [tils, posts, projects, links] = await Promise.all([
  getTilEntries(),
  getPostEntries(),
  getProjectEntries(),
  getLinkEntries(),
]);

// Keyed by the path segment after /og/. Matches the URLs BaseHead emits
// (/og/til/slug.png, /og/blog/slug.png, /og/projects/slug.png, /og/default.png).
const pages: Record<string, Card> = {
  default: { title: SITE_TITLE, description: SITE_DESCRIPTION, eyebrow: 'shreyashrai.com' },
};

for (const t of tils) {
  pages[`til/${t.id}`] = {
    title: t.data.title,
    description: 'Today I learned',
    eyebrow: 'TIL · shreyashrai.com',
  };
}
for (const p of posts) {
  pages[`blog/${p.id}`] = {
    title: p.data.title,
    description: p.data.description ?? 'Writing',
    eyebrow: 'Writing · shreyashrai.com',
  };
}
for (const pr of projects) {
  pages[`projects/${pr.id}`] = {
    title: pr.data.title,
    description: pr.data.blurb,
    eyebrow: 'Selected work · shreyashrai.com',
  };
}
for (const l of links) {
  pages[`links/${l.id}`] = {
    title: l.data.title,
    description: 'A link worth your time',
    eyebrow: 'Link blog · shreyashrai.com',
  };
}

export const { getStaticPaths, GET } = OGImageRoute({
  param: 'route',
  pages,
  getImageOptions: (_path, page: Card) => ({
    title: page.title,
    description: page.description,
    logo: undefined,
    // Warm cream paper → faint second surface, matching the site light theme.
    bgGradient: [
      [250, 248, 242],
      [241, 238, 228],
    ],
    border: { color: [31, 42, 230], width: 12, side: 'inline-start' },
    padding: 80,
    font: {
      title: { color: [31, 42, 230], size: 72, weight: 'Bold', lineHeight: 1.1 },
      description: { color: [56, 52, 44], size: 32, lineHeight: 1.4 },
    },
  }),
});
