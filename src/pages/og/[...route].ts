import type { APIRoute } from 'astro';
import sharp, { type OverlayOptions } from 'sharp';
import path from 'node:path';
import {
  getTilEntries,
  getPostEntries,
  getProjectEntries,
  getLinkEntries,
} from '../../lib/content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../../consts';

type Card = {
  title: string;
  description: string;
  eyebrow: string;
  photo?: string;
};

const [tils, posts, projects, links] = await Promise.all([
  getTilEntries(),
  getPostEntries(),
  getProjectEntries(),
  getLinkEntries(),
]);

const pages: Record<string, Card> = {
  default: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    eyebrow: 'shreyashrai.com',
  },
};

for (const entry of tils) {
  pages[`til/${entry.id}`] = {
    title: entry.data.title,
    description: 'Today I learned',
    eyebrow: 'TIL · shreyashrai.com',
    photo: entry.data.ogPhoto,
  };
}

for (const entry of posts) {
  pages[`blog/${entry.id}`] = {
    title: entry.data.title,
    description: entry.data.description ?? 'Writing',
    eyebrow: 'Writing · shreyashrai.com',
    photo: entry.data.ogPhoto,
  };
}

for (const entry of projects) {
  pages[`projects/${entry.id}`] = {
    title: entry.data.title,
    description: entry.data.blurb,
    eyebrow: 'Selected work · shreyashrai.com',
    photo: entry.data.cover,
  };
}

for (const entry of links) {
  pages[`links/${entry.id}`] = {
    title: entry.data.title,
    description: 'A link worth your time',
    eyebrow: 'Link blog · shreyashrai.com',
    photo: entry.data.ogPhoto,
  };
}

export function getStaticPaths() {
  return Object.entries(pages).map(([route, card]) => ({
    params: { route: `${route}.png` },
    props: { card },
  }));
}

const escapeXml = (value: string) =>
  value.replace(/[<>&"']/g, (character) => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&apos;',
    };
    return entities[character];
  });

function wrap(value: string, limit: number, maxLines: number) {
  const words = value.trim().split(/\s+/);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= limit || !line) {
      line = candidate;
      continue;
    }
    lines.push(line);
    line = word;
    if (lines.length === maxLines) break;
  }
  if (lines.length < maxLines && line) lines.push(line);

  const consumed = lines.join(' ').replace(/…$/, '').split(/\s+/).length;
  if (consumed < words.length && lines.length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[.,;:!?-]+$/, '')}…`;
  }
  return lines.slice(0, maxLines);
}

function textElements(lines: string[], x: number, y: number, step: number) {
  return lines
    .map((line, index) => `<tspan x="${x}" y="${y + index * step}">${escapeXml(line)}</tspan>`)
    .join('');
}

export const GET: APIRoute = async ({ props }) => {
  const card = props.card as Card;
  const hasPhoto = Boolean(card.photo);
  const panelWidth = hasPhoto ? 720 : 1200;
  const textWidth = hasPhoto ? 570 : 1000;
  const titleLines = wrap(card.title, hasPhoto ? 19 : 31, 2);
  const descriptionLines = wrap(card.description, hasPhoto ? 38 : 58, 6);
  const descriptionY = 184 + titleLines.length * 64;

  const fontPath = path.join(process.cwd(), 'public/fonts/schibsted-grotesk-latin.woff2');
  const fontData = (await import('node:fs/promises')).readFile(fontPath).then((data) => data.toString('base64'));
  const embeddedFont = await fontData;

  const overlay = Buffer.from(`
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @font-face { font-family: 'Schibsted'; src: url(data:font/woff2;base64,${embeddedFont}); }
          text { font-family: 'Schibsted', sans-serif; }
        </style>
        <linearGradient id="fade" x1="0" x2="1">
          <stop offset="0" stop-color="#faf8f2"/>
          <stop offset="0.82" stop-color="#faf8f2"/>
          <stop offset="1" stop-color="#faf8f2" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${hasPhoto ? `<rect width="770" height="630" fill="url(#fade)"/>` : ''}
      <rect width="12" height="630" fill="#1f2ae6"/>
      <text x="80" y="82" font-size="25" font-weight="600" letter-spacing="2" fill="#625f58">${escapeXml(card.eyebrow.toUpperCase())}</text>
      <text font-size="57" font-weight="700" fill="#1f2ae6">${textElements(titleLines, 80, 154, 64)}</text>
      <text font-size="28" font-weight="400" fill="#38342c">${textElements(descriptionLines, 80, descriptionY, 41)}</text>
      <line x1="80" y1="570" x2="${Math.min(panelWidth - 80, textWidth + 80)}" y2="570" stroke="#d8d3c7" stroke-width="2"/>
    </svg>
  `);

  const canvas = sharp({
    create: { width: 1200, height: 630, channels: 3, background: '#faf8f2' },
  });
  const composites: OverlayOptions[] = [];

  if (card.photo) {
    const relativePhoto = card.photo.replace(/^\/+/, '');
    const publicRoot = path.resolve(process.cwd(), 'public');
    const photoPath = path.resolve(publicRoot, relativePhoto);
    if (!photoPath.startsWith(`${publicRoot}${path.sep}`)) {
      throw new Error(`Invalid Open Graph photo path: ${card.photo}`);
    }
    const photo = await sharp(photoPath)
      .resize(540, 630, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 86 })
      .toBuffer();
    composites.push({ input: photo, left: 660, top: 0 });
  }

  composites.push({ input: overlay, left: 0, top: 0 });
  const image = await canvas.composite(composites).png({ compressionLevel: 9 }).toBuffer();

  return new Response(image, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
