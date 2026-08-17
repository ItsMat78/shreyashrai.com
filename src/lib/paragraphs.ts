import { getCollection } from 'astro:content';

// Plain-text paragraphs pulled out of the site's own prose, for the typing test
// on /type. Extracted at build time: the page ships finished strings, and the
// browser only picks one at random.
//
// Quotes are deliberately not a source — those are somebody else's sentences,
// and the point of this test is typing my own words back.

export type TypingParagraph = {
  text: string;
  title: string;
  url: string;
};

const includeDrafts = import.meta.env.DEV;

// Markdown, minus everything you can't sensibly type: code blocks, math, HTML,
// images, link syntax. Link and wikilink TEXT survives; the URLs don't.
function stripMarkdown(body: string): string {
  return body
    .replace(/```[\s\S]*?```/g, '\n\n')
    .replace(/~~~[\s\S]*?~~~/g, '\n\n')
    .replace(/\$\$[\s\S]*?\$\$/g, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[\[([^\]|#]+?)(?:#[^\]|]*)?(?:\|([^\]]*))?\]\]/g, (_m, slug, label) => label || slug)
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(?<![a-zA-Z0-9])[*_]([^*_\n]+)[*_](?![a-zA-Z0-9])/g, '$1');
}

// Curly quotes, em dashes, and ellipses are miserable to type and would count
// as errors on every keyboard that can't produce them. Fold them to ASCII.
function toAscii(s: string): string {
  return s
    .replace(/[‘’‛′]/g, "'")
    .replace(/[“”″]/g, '"')
    .replace(/[–—−]/g, '-')
    .replace(/…/g, '...')
    .replace(/[   ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// A block is usable only if it's a real run of prose: not a heading, list item,
// table row, or blockquote, and printable ASCII from end to end once folded.
function isProse(block: string): boolean {
  if (/^\s*(#{1,6}\s|[-*+]\s|\d+[.)]\s|>\s|\||:{3}|---)/.test(block)) return false;
  if (block.includes('$')) return false; // leftover inline math
  return true;
}

const MIN_CHARS = 140;
const MAX_CHARS = 420;

export async function getTypingParagraphs(limit = 60): Promise<TypingParagraph[]> {
  const [tils, posts, links, projects] = await Promise.all([
    getCollection('til', ({ data }) => includeDrafts || !data.draft),
    getCollection('blog', ({ data }) => includeDrafts || !data.draft),
    getCollection('links', ({ data }) => includeDrafts || !data.draft),
    getCollection('projects', ({ data }) => includeDrafts || !data.draft),
  ]);

  const sources = [
    ...tils.map((e) => ({ body: e.body, title: e.data.title, url: `/til/${e.id}/` })),
    ...posts.map((e) => ({ body: e.body, title: e.data.title, url: `/blog/${e.id}/` })),
    ...links.map((e) => ({ body: e.body, title: e.data.title, url: `/links/${e.id}/` })),
    ...projects.map((e) => ({ body: e.body, title: e.data.title, url: `/projects/${e.id}/` })),
  ];

  const out: TypingParagraph[] = [];

  for (const source of sources) {
    const blocks = stripMarkdown(source.body ?? '').split(/\n\s*\n/);
    for (const block of blocks) {
      if (!isProse(block)) continue;
      const text = toAscii(block);
      if (text.length < MIN_CHARS || text.length > MAX_CHARS) continue;
      // Anything left outside printable ASCII (stray symbols, other scripts)
      // can't be typed on a plain keyboard, so it's dropped rather than scored
      // as a mistake the reader can't avoid.
      if (!/^[\x20-\x7E]+$/.test(text)) continue;
      // A paragraph the reader can't finish reading isn't a typing test.
      if (!/[a-z]{3}/i.test(text)) continue;
      out.push({ text, title: source.title, url: source.url });
    }
  }

  // Round-robin across pieces before capping. Taking the first N in document
  // order let one long post (a 56-paragraph trip writeup) eat the entire quota
  // and shut every other piece out of the test.
  const byPiece = new Map<string, TypingParagraph[]>();
  for (const p of out) {
    const bucket = byPiece.get(p.url) ?? [];
    bucket.push(p);
    byPiece.set(p.url, bucket);
  }

  // Stable order so the shipped JSON doesn't churn between builds; the browser
  // does the shuffling.
  const buckets = [...byPiece.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, list]) => list.sort((a, b) => a.text.localeCompare(b.text)));

  const picked: TypingParagraph[] = [];
  for (let round = 0; picked.length < limit; round++) {
    let tookAny = false;
    for (const bucket of buckets) {
      if (round >= bucket.length) continue;
      picked.push(bucket[round]);
      tookAny = true;
      if (picked.length >= limit) break;
    }
    if (!tookAny) break; // every bucket exhausted
  }
  return picked;
}
