// Obsidian-style wikilinks for markdown bodies: `[[slug]]` or `[[slug|label]]`
// becomes a real link to that entry. The site is authored the way notes are
// kept, so cross-references stay ergonomic — you type a slug, not a full path.
//
// Resolution is by filename across the three content collections (til, blog,
// projects); the label defaults to the target's frontmatter title. Unresolved
// slugs render as plain text tagged with a class so they're easy to spot.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const CONTENT_ROOT = join(process.cwd(), 'src', 'content');
const DIRS = [
  ['til', '/til/'],
  ['blog', '/blog/'],
  ['projects', '/projects/'],
  ['links', '/links/'],
  ['quotes', '/quotes/'],
];

// Built once per process. Maps a slug to { url, title }. Later collections
// don't overwrite earlier ones, so a slug clash resolves to til > blog >
// projects (in practice slugs are unique).
function buildIndex() {
  const index = new Map();
  for (const [dir, base] of DIRS) {
    let files = [];
    try {
      files = readdirSync(join(CONTENT_ROOT, dir));
    } catch {
      continue; // a collection folder may not exist yet
    }
    for (const file of files) {
      const m = file.match(/^(.+)\.(md|mdx)$/);
      if (!m) continue;
      const slug = m[1];
      if (index.has(slug)) continue;
      let title = slug;
      try {
        const raw = readFileSync(join(CONTENT_ROOT, dir, file), 'utf8');
        const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        // Quotes carry no title — fall back to their `source`.
        const t =
          fm &&
          (fm[1].match(/^title:\s*["']?(.+?)["']?\s*$/m) ||
            fm[1].match(/^source:\s*["']?(.+?)["']?\s*$/m));
        if (t) title = t[1];
      } catch {
        /* fall back to the slug */
      }
      index.set(slug, { url: `${base}${slug}/`, title });
    }
  }
  return index;
}

let INDEX;
const WIKILINK = /\[\[\s*([^\]|#]+?)\s*(?:#[^\]|]*)?(?:\|\s*([^\]]*?)\s*)?\]\]/g;

export default function remarkWikilinks() {
  if (!INDEX) INDEX = buildIndex();

  return (tree) => {
    visit(tree);
  };

  // Walk the mdast, splitting any text node that contains wikilinks into a mix
  // of plain-text and link nodes. Skip code so `[[x]]` in a snippet is literal.
  function visit(node) {
    if (!node.children) return;
    const next = [];
    for (const child of node.children) {
      if (child.type === 'code' || child.type === 'inlineCode') {
        next.push(child);
        continue;
      }
      if (child.type === 'text' && child.value.includes('[[')) {
        next.push(...expand(child.value));
        continue;
      }
      visit(child);
      next.push(child);
    }
    node.children = next;
  }

  function expand(value) {
    const out = [];
    let last = 0;
    for (const m of value.matchAll(WIKILINK)) {
      if (m.index > last) out.push({ type: 'text', value: value.slice(last, m.index) });
      const slug = m[1].trim();
      const label = (m[2] && m[2].trim()) || null;
      const hit = INDEX.get(slug);
      if (hit) {
        out.push({
          type: 'link',
          url: hit.url,
          data: { hProperties: { className: ['wikilink'] } },
          children: [{ type: 'text', value: label || hit.title }],
        });
      } else {
        out.push({
          type: 'strong',
          data: { hProperties: { className: ['wikilink', 'wikilink--missing'] } },
          children: [{ type: 'text', value: label || slug }],
        });
      }
      last = m.index + m[0].length;
    }
    if (last < value.length) out.push({ type: 'text', value: value.slice(last) });
    return out;
  }
}
