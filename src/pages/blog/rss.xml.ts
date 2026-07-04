import type { APIContext } from 'astro';
import { getPostEntries } from '../../lib/content';
import { buildFeed } from '../../lib/feed';
import { SITE_TITLE } from '../../consts';

// Blog-only feed, for people who want the long writeups without the TIL stream.
export async function GET(context: APIContext) {
  const posts = await getPostEntries();
  return buildFeed(context, {
    title: `${SITE_TITLE} — Writing`,
    description: 'Longer writeups and essays by Shreyash Rai.',
    sources: [{ entries: posts, prefix: 'blog' }],
  });
}
