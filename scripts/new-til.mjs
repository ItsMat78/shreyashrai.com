#!/usr/bin/env node
// Create a new TIL with today's date and a frontmatter skeleton, so starting a
// post is one command. Zero dependencies.
//
//   npm run new:til -- "size_t underflow bit me again"
//
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const title = process.argv.slice(2).join(' ').trim();
if (!title) {
  console.error('Usage: npm run new:til -- "Title of the TIL"');
  process.exit(1);
}

// Filename-safe slug from the title.
const slug = title
  .toLowerCase()
  .replace(/[^\w\s-]/g, '')
  .trim()
  .replace(/\s+/g, '-');

const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD, UTC
const dir = path.join('src', 'content', 'til');
const file = path.join(dir, `${slug}.md`);

if (existsSync(file)) {
  console.error(`Already exists: ${file}`);
  process.exit(1);
}

const contents = `---
title: "${title.replace(/"/g, '\\"')}"
date: ${date}
tags: []
---

Write your TIL here.
`;

await mkdir(dir, { recursive: true });
await writeFile(file, contents, 'utf8');
console.log(`Created ${file}`);
