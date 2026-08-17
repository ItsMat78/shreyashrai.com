import { getCollection } from 'astro:content';
import { normalizeTags, readingTime, type Kind } from './content';

// Numbers about the archive itself, computed at build time for /stats.
// Everything here is counted from the content collections — there is no
// analytics data involved, and nothing about readers is measured.

const includeDrafts = import.meta.env.DEV;

export type KindStat = {
  kind: Kind | 'projects';
  label: string;
  count: number;
  words: number;
};

export type MonthCell = {
  year: number;
  month: number; // 1-12
  count: number;
  level: number; // 0-4, the sequential step for the heat grid
};

export type YearStat = { year: number; count: number; words: number };

export type Stats = {
  total: number; // every piece, quotes included
  words: number; // MY words only — quote bodies are excluded
  minutes: number; // reading time of the above, same exclusion
  kinds: KindStat[];
  // Everything below is MY pieces only. Quotes carry the date the line was
  // said, not a publication date, so they'd distort every one of these.
  years: YearStat[];
  months: MonthCell[]; // one row per year, 12 cells each
  monthMax: number;
  tags: { tag: string; count: number }[]; // tags DO span quotes
  tagTotal: number;
  first?: Date;
  last?: Date;
  busiest?: { year: number; month: number; count: number };
  longestPiece?: { title: string; url: string; words: number };
  daysSinceFirst: number;
};

function wordCount(body: string | undefined): number {
  return (body ?? '').trim().split(/\s+/).filter(Boolean).length;
}

export async function getStats(): Promise<Stats> {
  const [tils, posts, links, quotes, projects] = await Promise.all([
    getCollection('til', ({ data }) => includeDrafts || !data.draft),
    getCollection('blog', ({ data }) => includeDrafts || !data.draft),
    getCollection('links', ({ data }) => includeDrafts || !data.draft),
    getCollection('quotes', ({ data }) => includeDrafts || !data.draft),
    getCollection('projects', ({ data }) => includeDrafts || !data.draft),
  ]);

  // Dated pieces, flattened to just what the counters need.
  const dated = [
    ...tils.map((e) => ({
      kind: 'til' as const, date: e.data.date, tags: e.data.tags,
      title: e.data.title, url: `/til/${e.id}/`, body: e.body,
    })),
    ...posts.map((e) => ({
      kind: 'blog' as const, date: e.data.date, tags: e.data.tags,
      title: e.data.title, url: `/blog/${e.id}/`, body: e.body,
    })),
    ...links.map((e) => ({
      kind: 'links' as const, date: e.data.date, tags: e.data.tags,
      title: e.data.title, url: `/links/${e.id}/`, body: e.body,
    })),
    ...quotes.map((e) => ({
      kind: 'quotes' as const, date: e.data.date, tags: e.data.tags,
      title: e.data.source ?? 'Quote', url: `/quotes/${e.id}/`, body: e.body,
    })),
  ];

  // Quotes are somebody else's words. They still count as pieces published —
  // choosing and keeping them is the work — but they're excluded from every
  // word-derived number (total words, reading minutes, per-year words, longest
  // piece), which would otherwise credit me with writing I didn't write.
  const mine = dated.filter((e) => e.kind !== 'quotes');

  const words = mine.reduce((sum, e) => sum + wordCount(e.body), 0);

  const kinds: KindStat[] = [
    { kind: 'til', label: 'TIL', count: tils.length, words: tils.reduce((s, e) => s + wordCount(e.body), 0) },
    { kind: 'blog', label: 'Writing', count: posts.length, words: posts.reduce((s, e) => s + wordCount(e.body), 0) },
    { kind: 'links', label: 'Links', count: links.length, words: links.reduce((s, e) => s + wordCount(e.body), 0) },
    { kind: 'quotes', label: 'Quotes', count: quotes.length, words: quotes.reduce((s, e) => s + wordCount(e.body), 0) },
    { kind: 'projects', label: 'Projects', count: projects.length, words: projects.reduce((s, e) => s + wordCount(e.body), 0) },
  ];

  // Per-year totals, oldest first (time reads left to right). Quotes are out of
  // this too — see the note on the timeline below.
  const yearMap = new Map<number, { count: number; words: number }>();
  for (const e of mine) {
    const y = e.date.getUTCFullYear();
    const cur = yearMap.get(y) ?? { count: 0, words: 0 };
    cur.count += 1;
    cur.words += wordCount(e.body);
    yearMap.set(y, cur);
  }
  const years: YearStat[] = [...yearMap.entries()]
    .map(([year, v]) => ({ year, ...v }))
    .sort((a, b) => a.year - b.year);

  // The timeline runs on MY pieces only. A quote's `date` is when the line was
  // said or written down, not when anything was published here — the oldest one
  // predates the site by years, which would stretch the grid over empty rows and
  // make "days since the first" measure someone else's sentence.
  const dates = mine.map((e) => e.date).sort((a, b) => a.getTime() - b.getTime());
  const first = dates[0];
  const last = dates[dates.length - 1];

  const counts = new Map<string, number>();
  for (const e of mine) {
    const k = `${e.date.getUTCFullYear()}-${e.date.getUTCMonth() + 1}`;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }

  const months: MonthCell[] = [];
  if (first && last) {
    const y0 = first.getUTCFullYear();
    const y1 = last.getUTCFullYear();
    for (let y = y0; y <= y1; y++) {
      for (let m = 1; m <= 12; m++) {
        months.push({ year: y, month: m, count: counts.get(`${y}-${m}`) ?? 0, level: 0 });
      }
    }
  }
  const monthMax = months.reduce((max, c) => Math.max(max, c.count), 0);
  // Four filled steps of ONE hue (plus an empty step) — a sequential ramp, not
  // a set of categorical colours.
  for (const cell of months) {
    cell.level = cell.count === 0 ? 0 : Math.min(4, Math.ceil((cell.count / monthMax) * 4));
  }

  const busiestCell = months.reduce<MonthCell | undefined>(
    (best, c) => (c.count > 0 && (!best || c.count > best.count) ? c : best),
    undefined,
  );

  // Tags across every dated kind, most used first.
  const tagCounts = new Map<string, number>();
  for (const e of dated) {
    for (const t of normalizeTags(e.tags)) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  }
  const tags = [...tagCounts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

  const longest = mine
    .map((e) => ({ title: e.title, url: e.url, words: wordCount(e.body) }))
    .sort((a, b) => b.words - a.words)[0];

  const daysSinceFirst = first
    ? Math.max(1, Math.round((Date.now() - first.getTime()) / 86400000))
    : 0;

  return {
    total: dated.length,
    words,
    minutes: mine.reduce((sum, e) => sum + readingTime(e.body), 0),
    kinds,
    years,
    months,
    monthMax,
    tags,
    tagTotal: tags.length,
    first,
    last,
    busiest: busiestCell
      ? { year: busiestCell.year, month: busiestCell.month, count: busiestCell.count }
      : undefined,
    longestPiece: longest,
    daysSinceFirst,
  };
}
