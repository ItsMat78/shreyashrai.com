import rss, { type RSSFeedItem } from '@astrojs/rss';
import type { APIContext } from 'astro';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import type { Post, Til } from './content';

// Feeds carry the FULL rendered post so people can read entirely in a reader —
// that's the point of offering feeds. We render each markdown body to HTML with
// markdown-it and sanitise it (the documented @astrojs/rss recipe). Code blocks
// appear unhighlighted in feeds, which is fine.
const parser = new MarkdownIt();

type FeedEntry = Til | Post;
type Source = { entries: FeedEntry[]; prefix: 'til' | 'blog' };

const MAX_ITEMS = 30;

function renderContent(body: string): string {
  return sanitizeHtml(parser.render(body), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title'],
    },
  });
}

function toItem(entry: FeedEntry, prefix: 'til' | 'blog'): RSSFeedItem {
  const description =
    'description' in entry.data ? entry.data.description : undefined;
  return {
    title: entry.data.title,
    pubDate: entry.data.date,
    link: `/${prefix}/${entry.id}/`,
    description,
    content: renderContent(entry.body ?? ''),
    categories: entry.data.tags,
  };
}

interface BuildOptions {
  title: string;
  description: string;
  sources: Source[];
}

// Builds an RSS response from one or more collections, newest first, capped.
export function buildFeed(context: APIContext, options: BuildOptions) {
  const items = options.sources
    .flatMap((source) => source.entries.map((entry) => toItem(entry, source.prefix)))
    .sort((a, b) => b.pubDate!.valueOf() - a.pubDate!.valueOf())
    .slice(0, MAX_ITEMS);

  return rss({
    title: options.title,
    description: options.description,
    // `context.site` is the `site` from astro.config.mjs. Required.
    site: context.site!,
    items,
    trailingSlash: false,
  });
}
