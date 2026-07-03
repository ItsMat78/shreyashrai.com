import type { APIContext } from 'astro';
import { getPostEntries, getTilEntries } from '../lib/content';
import { buildFeed } from '../lib/feed';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

// The primary, combined feed: TILs + posts.
export async function GET(context: APIContext) {
  const [tils, posts] = await Promise.all([getTilEntries(), getPostEntries()]);
  return buildFeed(context, {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    sources: [
      { entries: tils, prefix: 'til' },
      { entries: posts, prefix: 'blog' },
    ],
  });
}
