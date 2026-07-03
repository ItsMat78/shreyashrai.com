import type { APIContext } from 'astro';
import {
  getPostEntries,
  getTilEntries,
  getLinkEntries,
  getQuoteEntries,
} from '../lib/content';
import { buildFeed } from '../lib/feed';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

// The primary, combined feed — the whole firehose: TILs + posts + links + quotes.
export async function GET(context: APIContext) {
  const [tils, posts, links, quotes] = await Promise.all([
    getTilEntries(),
    getPostEntries(),
    getLinkEntries(),
    getQuoteEntries(),
  ]);
  return buildFeed(context, {
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
