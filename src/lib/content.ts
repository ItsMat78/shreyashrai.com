import { getCollection, type CollectionEntry } from 'astro:content';

// Every page and feed pulls entries through this module. Draft filtering,
// sorting, and tag normalisation live here and nowhere else, so a page can't
// forget one of them (e.g. leak a draft or sort a list the wrong way).

export type Til = CollectionEntry<'til'>;
export type Post = CollectionEntry<'blog'>;
export type Project = CollectionEntry<'projects'>;
export type Link = CollectionEntry<'links'>;
export type Quote = CollectionEntry<'quotes'>;

// Every dated content kind that flows through the unified stream.
export type Kind = 'til' | 'blog' | 'links' | 'quotes';

// A flattened, list-friendly shape shared by the home page, index pages, and
// tag pages. `collection` drives the small "til" / "blog" marker in mixed lists.
export type EntryItem = {
  id: string;
  collection: Kind;
  title: string;
  date: Date;
  tags: string[];
  url: string; // the on-site permalink
  description?: string; // blog teaser
  // Link-blog extras: the outbound target + attribution.
  linkUrl?: string;
  via?: string;
  viaUrl?: string;
  // Quote extras: who said it, and where.
  source?: string;
  sourceUrl?: string;
  // Raw body text (quotes = the quote; links = the commentary) for stream teasers.
  excerpt?: string;
};

// Which content folder holds a given slug — used to resolve [[wikilinks]] and
// to build backlinks across collections. Kept here so link resolution and the
// pages agree on where each collection lives.
export const COLLECTION_DIR: Record<'til' | 'blog' | 'projects' | 'links' | 'quotes', string> = {
  til: 'til',
  blog: 'blog',
  projects: 'projects',
  links: 'links',
  quotes: 'quotes',
};

// Drafts are visible while writing (`npm run dev`) but never in a build.
const includeDrafts = import.meta.env.DEV;

// Lowercase + trim so "C++", "c++", and " c++ " are one tag everywhere.
export function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

export function normalizeTags(tags: string[]): string[] {
  return [...new Set(tags.map(normalizeTag))];
}

// Newest first. `id` (the filename) is a stable tiebreak so two entries sharing
// a date keep a fixed order between builds instead of shuffling.
function byDateDesc(a: EntryItem, b: EntryItem): number {
  const diff = b.date.getTime() - a.date.getTime();
  return diff !== 0 ? diff : a.id.localeCompare(b.id);
}

// Same ordering, on raw collection entries (used by the detail pages, which
// need the entry itself to render its body).
function byEntryDateDesc(a: Til | Post, b: Til | Post): number {
  const diff = b.data.date.getTime() - a.data.date.getTime();
  return diff !== 0 ? diff : a.id.localeCompare(b.id);
}

function toItem(
  collection: Kind,
  entry: Til | Post | Link | Quote,
): EntryItem {
  const d = entry.data;
  const base = {
    id: entry.id,
    collection,
    date: d.date,
    tags: normalizeTags(d.tags),
    url: `/${collection}/${entry.id}`,
  };
  if (collection === 'quotes') {
    // Quotes have no title — the source is the heading; the body is the quote.
    return {
      ...base,
      title: 'source' in d ? d.source : '',
      source: 'source' in d ? d.source : undefined,
      sourceUrl: 'sourceUrl' in d ? d.sourceUrl : undefined,
      via: 'via' in d ? d.via : undefined,
      viaUrl: 'viaUrl' in d ? d.viaUrl : undefined,
      excerpt: (entry.body ?? '').trim(),
    };
  }
  if (collection === 'links') {
    return {
      ...base,
      title: 'title' in d ? d.title : '',
      linkUrl: 'url' in d ? d.url : undefined,
      via: 'via' in d ? d.via : undefined,
      viaUrl: 'viaUrl' in d ? d.viaUrl : undefined,
      excerpt: (entry.body ?? '').trim(),
    };
  }
  return {
    ...base,
    title: 'title' in d ? d.title : '',
    description: 'description' in d ? d.description : undefined,
  };
}

// Raw, draft-filtered, sorted entries. The detail pages ([slug].astro) build
// their static paths from these so the draft filter is never re-implemented.
export async function getTilEntries(): Promise<Til[]> {
  const entries = await getCollection('til', ({ data }) => includeDrafts || !data.draft);
  return entries.sort(byEntryDateDesc);
}

export async function getPostEntries(): Promise<Post[]> {
  const entries = await getCollection('blog', ({ data }) => includeDrafts || !data.draft);
  return entries.sort(byEntryDateDesc);
}

export async function getTils(): Promise<EntryItem[]> {
  return (await getTilEntries()).map((e) => toItem('til', e));
}

export async function getPosts(): Promise<EntryItem[]> {
  return (await getPostEntries()).map((e) => toItem('blog', e));
}

// Link blog + quotations — same draft-filter + newest-first contract.
export async function getLinkEntries(): Promise<Link[]> {
  const entries = await getCollection('links', ({ data }) => includeDrafts || !data.draft);
  return entries.sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id));
}

export async function getQuoteEntries(): Promise<Quote[]> {
  const entries = await getCollection('quotes', ({ data }) => includeDrafts || !data.draft);
  return entries.sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id));
}

export async function getLinks(): Promise<EntryItem[]> {
  return (await getLinkEntries()).map((e) => toItem('links', e));
}

export async function getQuotes(): Promise<EntryItem[]> {
  return (await getQuoteEntries()).map((e) => toItem('quotes', e));
}

// Every dated kind merged into one newest-first river — the "firehose" behind
// /stream, and the source for /tags (so tags span everything, Simon-style).
export async function getAllEntries(): Promise<EntryItem[]> {
  const [tils, posts, links, quotes] = await Promise.all([
    getTils(),
    getPosts(),
    getLinks(),
    getQuotes(),
  ]);
  return [...tils, ...posts, ...links, ...quotes].sort(byDateDesc);
}

// Semantic alias — the unified stream IS every entry, newest first.
export const getStream = getAllEntries;

export type TagCount = { tag: string; count: number };

// Every tag across both collections with its usage count, most-used first,
// then alphabetical. Powers /tags.
export async function getAllTags(): Promise<TagCount[]> {
  const entries = await getAllEntries();
  const counts = new Map<string, number>();
  for (const entry of entries) {
    for (const tag of entry.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

// All entries (both collections) carrying a given tag, newest first.
export async function getEntriesByTag(tag: string): Promise<EntryItem[]> {
  const target = normalizeTag(tag);
  const entries = await getAllEntries();
  return entries.filter((entry) => entry.tags.includes(target));
}

// Raw (body-carrying) entries for a tag, split by kind — used to build a
// per-tag RSS feed, which needs the entry bodies the flattened items don't hold.
export async function getTaggedEntries(
  tag: string,
): Promise<{ tils: Til[]; posts: Post[]; links: Link[]; quotes: Quote[] }> {
  const target = normalizeTag(tag);
  const [tils, posts, links, quotes] = await Promise.all([
    getTilEntries(),
    getPostEntries(),
    getLinkEntries(),
    getQuoteEntries(),
  ]);
  const has = (e: { data: { tags: string[] } }) =>
    normalizeTags(e.data.tags).includes(target);
  return {
    tils: tils.filter(has),
    posts: posts.filter(has),
    links: links.filter(has),
    quotes: quotes.filter(has),
  };
}

// Projects, draft-filtered and hand-ordered (order asc, 1 = top). The list
// page and the [slug] paths both come through here so the draft filter is
// never re-implemented — same guarantee the til/blog getters give.
export async function getProjectEntries(): Promise<Project[]> {
  const entries = await getCollection('projects', ({ data }) => includeDrafts || !data.draft);
  return entries.sort((a, b) => a.data.order - b.data.order);
}

// ---- Reading time -------------------------------------------------------
// Rough words-per-minute estimate from the raw markdown body. 200 wpm is the
// usual reading-speed convention; always at least 1 minute.
export function readingTime(body: string | undefined): number {
  const words = (body ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// ---- Related entries ----------------------------------------------------
// Other entries (either collection) that share the most tags with a given one,
// newest first as the tiebreak. Used for the "Read next" block on articles.
export async function getRelated(
  id: string,
  tags: string[],
  limit = 3,
): Promise<EntryItem[]> {
  const target = new Set(normalizeTags(tags));
  if (target.size === 0) return [];
  const entries = await getAllEntries();
  return entries
    .filter((e) => e.id !== id)
    .map((e) => ({ e, shared: e.tags.filter((t) => target.has(t)).length }))
    .filter((x) => x.shared > 0)
    .sort((a, b) => b.shared - a.shared || b.e.date.getTime() - a.e.date.getTime())
    .slice(0, limit)
    .map((x) => x.e);
}

// ---- Wikilinks & backlinks ----------------------------------------------
// The site is authored Obsidian-style: `[[slug]]` (or `[[slug|label]]`) inside
// a body links to another entry. The remark plugin renders those into anchors;
// here we build the reverse — every entry that links TO a given slug — so a
// page can show a "Mentioned in" list.
const WIKILINK = /\[\[\s*([^\]|#]+?)\s*(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g;

function outgoingSlugs(body: string | undefined): string[] {
  const out = new Set<string>();
  for (const m of (body ?? '').matchAll(WIKILINK)) out.add(m[1].trim());
  return [...out];
}

// Every linkable entry (all five collections), flattened with the slugs it
// links out to — so [[wikilink]] backlinks span the whole site.
async function allLinkable(): Promise<
  { id: string; collection: keyof typeof COLLECTION_DIR; title: string; body?: string }[]
> {
  const [tils, posts, projects, links, quotes] = await Promise.all([
    getCollection('til', ({ data }) => includeDrafts || !data.draft),
    getCollection('blog', ({ data }) => includeDrafts || !data.draft),
    getCollection('projects', ({ data }) => includeDrafts || !data.draft),
    getCollection('links', ({ data }) => includeDrafts || !data.draft),
    getCollection('quotes', ({ data }) => includeDrafts || !data.draft),
  ]);
  return [
    ...tils.map((e) => ({ id: e.id, collection: 'til' as const, title: e.data.title, body: e.body })),
    ...posts.map((e) => ({ id: e.id, collection: 'blog' as const, title: e.data.title, body: e.body })),
    ...projects.map((e) => ({ id: e.id, collection: 'projects' as const, title: e.data.title, body: e.body })),
    ...links.map((e) => ({ id: e.id, collection: 'links' as const, title: e.data.title, body: e.body })),
    ...quotes.map((e) => ({ id: e.id, collection: 'quotes' as const, title: e.data.source, body: e.body })),
  ];
}

export type LinkRef = {
  id: string;
  collection: keyof typeof COLLECTION_DIR;
  title: string;
  url: string;
};

// Entries whose body contains a `[[thisId]]` wikilink, so an article can list
// what mentions it. Slug match is exact (filenames are unique per collection).
export async function getBacklinks(id: string): Promise<LinkRef[]> {
  const all = await allLinkable();
  return all
    .filter((e) => e.id !== id && outgoingSlugs(e.body).includes(id))
    .map((e) => ({
      id: e.id,
      collection: e.collection,
      title: e.title,
      url: `/${COLLECTION_DIR[e.collection]}/${e.id}/`,
    }));
}

// ---- Series -------------------------------------------------------------
// All entries (til + blog) sharing a `series` name, ordered by `part` then
// date. Powers the prev/next series box on an article.
export async function getSeries(name: string): Promise<(EntryItem & { part?: number })[]> {
  const [tils, posts] = await Promise.all([getTilEntries(), getPostEntries()]);
  const inSeries = [...tils, ...posts].filter((e) => e.data.series === name);
  return inSeries
    .sort(
      (a, b) =>
        (a.data.part ?? Infinity) - (b.data.part ?? Infinity) ||
        a.data.date.getTime() - b.data.date.getTime(),
    )
    .map((e) => ({
      ...toItem(e.collection === 'blog' ? 'blog' : 'til', e),
      part: e.data.part,
    }));
}

// ---- Featured -----------------------------------------------------------
// Entries flagged `featured: true`, newest first. The home page surfaces the
// first one in a highlighted slot.
export async function getFeatured(): Promise<EntryItem[]> {
  const [tils, posts] = await Promise.all([getTilEntries(), getPostEntries()]);
  return [...tils, ...posts]
    .filter((e) => e.data.featured)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .map((e) => toItem(e.collection === 'blog' ? 'blog' : 'til', e));
}
