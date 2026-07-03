import type { APIContext } from 'astro';
import { getQuoteEntries } from '../../lib/content';
import { buildFeed } from '../../lib/feed';
import { SITE_TITLE } from '../../consts';

// Quotes-only feed.
export async function GET(context: APIContext) {
  const quotes = await getQuoteEntries();
  return buildFeed(context, {
    title: `${SITE_TITLE} — Quotes`,
    description: 'A commonplace book of quotations kept by Shreyash Rai.',
    sources: [{ entries: quotes, prefix: 'quotes' }],
  });
}
