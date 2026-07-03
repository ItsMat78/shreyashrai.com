import type { APIContext } from 'astro';
import { getTilEntries } from '../../lib/content';
import { buildFeed } from '../../lib/feed';
import { SITE_TITLE } from '../../consts';

// TIL-only feed, for people who want the short notes without the long posts.
export async function GET(context: APIContext) {
  const tils = await getTilEntries();
  return buildFeed(context, {
    title: `${SITE_TITLE} — TIL`,
    description: "Today I Learned — short, dated notes from Shreyash Rai.",
    sources: [{ entries: tils, prefix: 'til' }],
  });
}
