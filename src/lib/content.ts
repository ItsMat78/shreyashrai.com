import { getCollection, type CollectionEntry } from 'astro:content';

// Every page and feed pulls entries through this module. Draft filtering,
// sorting, and tag normalisation live here and nowhere else, so a page can't
// forget one of them (e.g. leak a draft or sort a list the wrong way).

export type Til = CollectionEntry<'til'>;
export type Post = CollectionEntry<'blog'>;

// A flattened, list-friendly shape shared by the home page, index pages, and
// tag pages. `collection` drives the small "til" / "blog" marker in mixed lists.
export type EntryItem = {
  id: string;
  collection: 'til' | 'blog';
  title: string;
  date: Date;
  tags: string[];
  description?: string;
  url: string;
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
  collection: 'til' | 'blog',
  entry: Til | Post,
): EntryItem {
  return {
    id: entry.id,
    collection,
    title: entry.data.title,
    date: entry.data.date,
    tags: normalizeTags(entry.data.tags),
    description: 'description' in entry.data ? entry.data.description : undefined,
    url: `/${collection}/${entry.id}`,
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

// Both collections merged into one dated list (used by /tags/[tag]).
export async function getAllEntries(): Promise<EntryItem[]> {
  const [tils, posts] = await Promise.all([getTils(), getPosts()]);
  return [...tils, ...posts].sort(byDateDesc);
}

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
