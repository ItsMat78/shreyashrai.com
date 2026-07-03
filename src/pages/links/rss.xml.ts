import type { APIContext } from 'astro';
import { getLinkEntries } from '../../lib/content';
import { buildFeed } from '../../lib/feed';
import { SITE_TITLE } from '../../consts';

// Link-blog-only feed.
export async function GET(context: APIContext) {
  const links = await getLinkEntries();
  return buildFeed(context, {
    title: `${SITE_TITLE} — Links`,
    description: 'The link blog — things worth pointing at, by Shreyash Rai.',
    sources: [{ entries: links, prefix: 'links' }],
  });
}
