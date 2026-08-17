import { getCollection } from 'astro:content';
import { COLLECTION_DIR, normalizeTags } from './content';

// The constellation behind /map.
//
// Everything here runs at BUILD time: the graph is assembled from the content
// collections, laid out with a small deterministic force simulation, and
// rendered as a plain inline <svg>. No layout library, no client-side physics —
// the page ships coordinates, not a solver. The seed is fixed, so the same
// content always produces the same picture (a rebuild doesn't reshuffle the
// map under the reader).

export type GraphKind = 'til' | 'blog' | 'links' | 'quotes' | 'projects';

export type GraphNode = {
  id: string;
  kind: GraphKind;
  title: string;
  url: string;
  tags: string[]; // tags, or `tech` for projects
  degree: number; // edges touching this node — drives the dot size
  x: number;
  y: number;
  r: number;
};

// How two entries are related. Three strengths, three visual weights on the
// map: an explicit [[wikilink]] is the strongest signal, a shared series next,
// a shared tag (or shared tech, between projects) the faintest.
export type EdgeKind = 'wikilink' | 'series' | 'tag';

export type GraphEdge = {
  a: string; // node id
  b: string;
  kind: EdgeKind;
  weight: number;
  shared: string[]; // the tags/series behind a tag or series edge
};

export type Graph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width: number;
  height: number;
};

const includeDrafts = import.meta.env.DEV;

// Same wikilink shape the backlink builder uses: [[slug]], [[slug#heading]],
// [[slug|label]].
const WIKILINK = /\[\[\s*([^\]|#]+?)\s*(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g;

function outgoing(body: string | undefined): string[] {
  const out = new Set<string>();
  for (const m of (body ?? '').matchAll(WIKILINK)) out.add(m[1].trim());
  return [...out];
}

type Raw = {
  id: string;
  kind: GraphKind;
  title: string;
  tags: string[];
  series?: string;
  body?: string;
};

async function collect(): Promise<Raw[]> {
  const [tils, posts, links, quotes, projects] = await Promise.all([
    getCollection('til', ({ data }) => includeDrafts || !data.draft),
    getCollection('blog', ({ data }) => includeDrafts || !data.draft),
    getCollection('links', ({ data }) => includeDrafts || !data.draft),
    getCollection('quotes', ({ data }) => includeDrafts || !data.draft),
    getCollection('projects', ({ data }) => includeDrafts || !data.draft),
  ]);

  return [
    ...tils.map((e) => ({
      id: e.id,
      kind: 'til' as const,
      title: e.data.title,
      tags: normalizeTags(e.data.tags),
      series: e.data.series,
      body: e.body,
    })),
    ...posts.map((e) => ({
      id: e.id,
      kind: 'blog' as const,
      title: e.data.title,
      tags: normalizeTags(e.data.tags),
      series: e.data.series,
      body: e.body,
    })),
    ...links.map((e) => ({
      id: e.id,
      kind: 'links' as const,
      title: e.data.title,
      tags: normalizeTags(e.data.tags),
      body: e.body,
    })),
    ...quotes.map((e) => ({
      id: e.id,
      kind: 'quotes' as const,
      // Quotes have no title; the source stands in as the label.
      title: e.data.source ?? 'Quote',
      tags: normalizeTags(e.data.tags),
      body: e.body,
    })),
    ...projects.map((e) => ({
      id: e.id,
      kind: 'projects' as const,
      title: e.data.title,
      // A project's `tech` list plays the part tags play elsewhere.
      tags: normalizeTags(e.data.tech ?? []),
      body: e.body,
    })),
  ];
}

// Node ids are only unique WITHIN a collection, so the graph keys on
// `kind:id` and keeps the pair addressable.
function key(kind: GraphKind, id: string): string {
  return `${kind}:${id}`;
}

// ---- Deterministic layout -------------------------------------------------
// A tiny Fruchterman-Reingold: nodes push each other apart, edges pull their
// ends together, and the step size cools over the run. Seeded, so the map is
// stable between builds.

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WIDTH = 1000;
const HEIGHT = 660;
const PAD = 58; // keeps dots and their labels inside the frame

function layout(
  nodes: { id: string }[],
  edges: { a: string; b: string; weight: number }[],
): Map<string, { x: number; y: number }> {
  const n = nodes.length;
  const pos = new Map<string, { x: number; y: number }>();
  if (n === 0) return pos;

  const rand = mulberry32(0x5ca77e2);
  const index = new Map(nodes.map((node, i) => [node.id, i]));

  // Seed on a golden-angle spiral: evenly spread, no two nodes on top of each
  // other, and identical on every build.
  const px = new Float64Array(n);
  const py = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const angle = i * 2.399963229728653; // golden angle
    const radius = Math.sqrt(t) * (Math.min(WIDTH, HEIGHT) / 2 - PAD);
    px[i] = WIDTH / 2 + Math.cos(angle) * radius + (rand() - 0.5) * 8;
    py[i] = HEIGHT / 2 + Math.sin(angle) * radius + (rand() - 0.5) * 8;
  }

  const k = Math.sqrt((WIDTH * HEIGHT) / n) * 0.62; // ideal edge length
  const ITER = 420;
  let temp = Math.min(WIDTH, HEIGHT) / 8;
  const cool = temp / (ITER + 1);

  const dx = new Float64Array(n);
  const dy = new Float64Array(n);

  for (let step = 0; step < ITER; step++) {
    dx.fill(0);
    dy.fill(0);

    // Repulsion (every pair).
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        let vx = px[i] - px[j];
        let vy = py[i] - py[j];
        let d2 = vx * vx + vy * vy;
        if (d2 < 0.01) {
          // Perfectly coincident: nudge apart deterministically.
          vx = (i - j) * 0.01 + 0.01;
          vy = 0.01;
          d2 = vx * vx + vy * vy;
        }
        const d = Math.sqrt(d2);
        const force = (k * k) / d;
        const ux = (vx / d) * force;
        const uy = (vy / d) * force;
        dx[i] += ux;
        dy[i] += uy;
        dx[j] -= ux;
        dy[j] -= uy;
      }
    }

    // Attraction along edges, scaled by how strong the relation is.
    for (const e of edges) {
      const i = index.get(e.a);
      const j = index.get(e.b);
      if (i === undefined || j === undefined) continue;
      const vx = px[i] - px[j];
      const vy = py[i] - py[j];
      const d = Math.sqrt(vx * vx + vy * vy) || 0.01;
      const force = ((d * d) / k) * e.weight;
      const ux = (vx / d) * force;
      const uy = (vy / d) * force;
      dx[i] -= ux;
      dy[i] -= uy;
      dx[j] += ux;
      dy[j] += uy;
    }

    // Gentle pull to the middle so disconnected islands don't drift off-canvas.
    for (let i = 0; i < n; i++) {
      dx[i] += (WIDTH / 2 - px[i]) * 0.012;
      dy[i] += (HEIGHT / 2 - py[i]) * 0.012;
    }

    // Step, capped by the cooling temperature.
    for (let i = 0; i < n; i++) {
      const d = Math.sqrt(dx[i] * dx[i] + dy[i] * dy[i]) || 1;
      const move = Math.min(d, temp);
      px[i] += (dx[i] / d) * move;
      py[i] += (dy[i] / d) * move;
    }
    temp -= cool;
  }

  // Normalise the settled cloud into the viewBox with padding.
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < n; i++) {
    minX = Math.min(minX, px[i]);
    maxX = Math.max(maxX, px[i]);
    minY = Math.min(minY, py[i]);
    maxY = Math.max(maxY, py[i]);
  }
  // Each axis is fitted independently: keeping the aspect ratio leaves a
  // settled cloud floating in the middle of the plate with dead margins, and
  // this is an abstract map — only the topology has to survive, not the exact
  // geometry the simulation happened to land on.
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const scaleX = (WIDTH - PAD * 2) / spanX;
  const scaleY = (HEIGHT - PAD * 2) / spanY;

  for (let i = 0; i < n; i++) {
    px[i] = (px[i] - minX) * scaleX + PAD;
    py[i] = (py[i] - minY) * scaleY + PAD;
  }

  // The force pass settles a cloud far larger than the canvas, so scaling it
  // down squeezes tightly-bound cliques (a series, a shared tag) into a blob.
  // This second pass works in FINAL canvas units and enforces the two distances
  // legibility actually needs: dots that don't touch, and labels that don't sit
  // on the same line as a neighbour's.
  relax(px, py, n);

  for (const node of nodes) {
    const i = index.get(node.id)!;
    pos.set(node.id, { x: round(px[i]), y: round(py[i]) });
  }
  return pos;
}

const MIN_GAP = 74; // centre-to-centre, in canvas units
const LABEL_H = 24; // vertical clearance between two labels
const LABEL_W = 210; // how far a label reaches from its dot

function relax(px: Float64Array, py: Float64Array, n: number): void {
  for (let step = 0; step < 260; step++) {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        let vx = px[i] - px[j];
        let vy = py[i] - py[j];
        let d = Math.sqrt(vx * vx + vy * vy);
        if (d < 0.001) {
          // Coincident: separate along a fixed axis so the result is stable.
          vx = 1;
          vy = 0;
          d = 1;
        }
        if (d < MIN_GAP) {
          const push = (MIN_GAP - d) / 2;
          const ux = (vx / d) * push;
          const uy = (vy / d) * push;
          px[i] += ux;
          py[i] += uy;
          px[j] -= ux;
          py[j] -= uy;
        }
        // Two dots on nearly the same baseline within a label's reach would
        // print their labels over each other — separate them vertically.
        if (Math.abs(vy) < LABEL_H && Math.abs(vx) < LABEL_W) {
          const push = (LABEL_H - Math.abs(vy)) / 2 + 0.5;
          const dir = vy >= 0 ? 1 : -1;
          py[i] += dir * push;
          py[j] -= dir * push;
        }
      }
    }
    // Keep everything on the plate.
    for (let i = 0; i < n; i++) {
      px[i] = Math.min(WIDTH - PAD, Math.max(PAD, px[i]));
      py[i] = Math.min(HEIGHT - PAD, Math.max(PAD, py[i]));
    }
  }
}

function round(v: number): number {
  return Math.round(v * 10) / 10;
}

// ---- The graph ------------------------------------------------------------

export async function getGraph(): Promise<Graph> {
  const raw = await collect();
  const byKey = new Map(raw.map((r) => [key(r.kind, r.id), r]));

  // Slug -> node key, for resolving [[wikilinks]] (which name a bare filename
  // slug, not a collection).
  const bySlug = new Map<string, string>();
  for (const r of raw) if (!bySlug.has(r.id)) bySlug.set(r.id, key(r.kind, r.id));

  // One edge per pair, strongest relation wins. `pair` keeps the key order
  // stable so A→B and B→A collapse into the same entry.
  const edges = new Map<string, GraphEdge>();
  const rank: Record<EdgeKind, number> = { tag: 1, series: 2, wikilink: 3 };

  function addEdge(a: string, b: string, kind: EdgeKind, weight: number, shared: string[]) {
    if (a === b) return;
    const [x, y] = a < b ? [a, b] : [b, a];
    const id = `${x}|${y}`;
    const existing = edges.get(id);
    if (existing && rank[existing.kind] >= rank[kind]) return;
    edges.set(id, { a: x, b: y, kind, weight, shared });
  }

  // 1. Shared tags (or shared tech, between projects). The faint web that makes
  //    a small site's map read as a constellation rather than scattered dust.
  const list = [...byKey.entries()];
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const [ka, ra] = list[i];
      const [kb, rb] = list[j];
      const shared = ra.tags.filter((t) => rb.tags.includes(t));
      if (shared.length === 0) continue;
      addEdge(ka, kb, 'tag', Math.min(shared.length, 3) * 0.35, shared);
    }
  }

  // 2. Same series — a deliberate sequence, drawn stronger than a shared tag.
  const seriesGroups = new Map<string, string[]>();
  for (const [k, r] of byKey) {
    if (!r.series) continue;
    const bucket = seriesGroups.get(r.series) ?? [];
    bucket.push(k);
    seriesGroups.set(r.series, bucket);
  }
  for (const [name, members] of seriesGroups) {
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        addEdge(members[i], members[j], 'series', 1.1, [name]);
      }
    }
  }

  // 3. Explicit [[wikilinks]] — the strongest tie. Unresolved slugs are simply
  //    skipped (the prose already flags them with .wikilink--missing).
  for (const [k, r] of byKey) {
    for (const slug of outgoing(r.body)) {
      const target = bySlug.get(slug);
      if (target) addEdge(k, target, 'wikilink', 1.8, []);
    }
  }

  const edgeList = [...edges.values()];

  const degree = new Map<string, number>();
  for (const e of edgeList) {
    degree.set(e.a, (degree.get(e.a) ?? 0) + 1);
    degree.set(e.b, (degree.get(e.b) ?? 0) + 1);
  }

  const positions = layout(
    [...byKey.keys()].map((id) => ({ id })),
    edgeList,
  );

  const nodes: GraphNode[] = [...byKey.entries()].map(([k, r]) => {
    const deg = degree.get(k) ?? 0;
    const p = positions.get(k) ?? { x: WIDTH / 2, y: HEIGHT / 2 };
    return {
      id: k,
      kind: r.kind,
      title: r.title,
      url: `/${COLLECTION_DIR[r.kind]}/${r.id}/`,
      tags: r.tags,
      degree: deg,
      x: p.x,
      y: p.y,
      // Dot size grows with connectedness but flattens fast, so one hub node
      // can't swallow the map.
      r: round(6 + Math.sqrt(deg) * 3.2),
    };
  });

  // Draw order: faint tag webbing first, explicit links on top.
  edgeList.sort((a, b) => rank[a.kind] - rank[b.kind]);

  return { nodes, edges: edgeList, width: WIDTH, height: HEIGHT };
}
