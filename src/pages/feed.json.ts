import type { APIContext } from 'astro';
import {
  getPostEntries,
  getTilEntries,
  getLinkEntries,
  getQuoteEntries,
} from '../lib/content';
import { buildJsonFeed } from '../lib/feed';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

// JSON Feed sibling of /rss.xml — the whole firehose, full content, newest first.
export async function GET(context: APIContext) {
  const [tils, posts, links, quotes] = await Promise.all([
    getTilEntries(),
    getPostEntries(),
    getLinkEntries(),
    getQuoteEntries(),
  ]);
  return buildJsonFeed(context, {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    sources: [
      { entries: tils, prefix: 'til' },
      { entries: posts, prefix: 'blog' },
      { entries: links, prefix: 'links' },
      { entries: quotes, prefix: 'quotes' },
    ],
  });
}
