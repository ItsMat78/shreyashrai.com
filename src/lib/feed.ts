import rss, { type RSSFeedItem } from '@astrojs/rss';
import type { APIContext } from 'astro';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import type { Post, Til, Link, Quote, Kind } from './content';

// Feeds carry the FULL rendered post so people can read entirely in a reader —
// that's the point of offering feeds. We render each markdown body to HTML with
// markdown-it and sanitise it (the documented @astrojs/rss recipe). Code blocks
// appear unhighlighted in feeds, which is fine.
const parser = new MarkdownIt();

type FeedEntry = Til | Post | Link | Quote;
type Source = { entries: FeedEntry[]; prefix: Kind };

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

function toItem(entry: FeedEntry, prefix: Kind): RSSFeedItem {
  const d = entry.data;
  const link = `/${prefix}/${entry.id}/`;
  const body = renderContent(entry.body ?? '');

  if (prefix === 'quotes') {
    // No title on a quote — lead with the source when present; body is the quote.
    const source = 'source' in d ? d.source : undefined;
    return {
      title: source ? `“…” — ${source}` : '“…”',
      pubDate: d.date,
      link,
      content: `<blockquote>${body}</blockquote>${source ? `<p>— ${source}</p>` : ''}`,
      categories: d.tags,
    };
  }
  if (prefix === 'links' && 'url' in d && 'title' in d) {
    // Surface the outbound target under the commentary.
    return {
      title: d.title,
      pubDate: d.date,
      link,
      content: `${body}<p>Link: <a href="${d.url}">${d.url}</a></p>`,
      categories: d.tags,
    };
  }
  return {
    title: 'title' in d ? d.title : '',
    pubDate: d.date,
    link,
    description: 'description' in d ? d.description : undefined,
    content: body,
    categories: d.tags,
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

// JSON Feed 1.1 (jsonfeed.org) sibling of the RSS feed, for readers that prefer
// JSON. Same full-content, newest-first, capped items as buildFeed.
export function buildJsonFeed(context: APIContext, options: BuildOptions) {
  const site = context.site!.href.replace(/\/$/, '');
  const items = options.sources
    .flatMap((source) => source.entries.map((entry) => ({ entry, prefix: source.prefix })))
    .sort((a, b) => b.entry.data.date.valueOf() - a.entry.data.date.valueOf())
    .slice(0, MAX_ITEMS)
    .map(({ entry, prefix }) => {
      const d = entry.data;
      const url = `${site}/${prefix}/${entry.id}/`;
      const title =
        'title' in d
          ? d.title
          : prefix === 'quotes'
            ? `Quote${'source' in d && d.source ? ` — ${d.source}` : ''}`
            : '';
      const summary = 'description' in d ? d.description : undefined;
      let content = renderContent(entry.body ?? '');
      if ('url' in d) content += `<p>Link: <a href="${d.url}">${d.url}</a></p>`;
      return {
        id: url,
        url,
        title,
        ...(summary ? { summary } : {}),
        content_html: content,
        date_published: d.date.toISOString(),
        tags: d.tags,
      };
    });

  return new Response(
    JSON.stringify({
      version: 'https://jsonfeed.org/version/1.1',
      title: options.title,
      home_page_url: `${site}/`,
      feed_url: `${site}/feed.json`,
      description: options.description,
      items,
    }),
    { headers: { 'Content-Type': 'application/feed+json; charset=utf-8' } },
  );
}
