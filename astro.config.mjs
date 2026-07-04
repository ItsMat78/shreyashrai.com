// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import remarkWikilinks from './src/lib/remark-wikilinks.mjs';

// The canonical origin. Required for RSS, sitemap, and canonical URLs.
export default defineConfig({
  site: 'https://shreyashrai.com',
  integrations: [mdx(), sitemap()],
  markdown: {
    // Obsidian-style [[slug]] cross-links (remark) + hoverable heading anchors
    // (rehype). Astro assigns the heading ids first; autolink wraps each one in
    // a self link with a class the CSS turns into a faint § on hover.
    remarkPlugins: [remarkMath, remarkWikilinks],
    rehypePlugins: [
      // LaTeX math rendering via KaTeX.
      rehypeKatex,
      // Assign heading ids ourselves first so autolink sees them (Astro's own
      // id pass otherwise runs after user plugins, leaving nothing to link).
      rehypeHeadingIds,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          // data-pagefind-ignore keeps the "#" out of the search index, so
          // sub-results read "Introduction", not "Introduction#".
          properties: {
            className: ['heading-anchor'],
            ariaHidden: true,
            tabIndex: -1,
            dataPagefindIgnore: true,
          },
          content: { type: 'text', value: '#' },
        },
      ],
    ],
    shikiConfig: {
      // Dual theme: Shiki emits both palettes as CSS variables; global.css
      // picks light by default and dark when [data-theme="dark"] is set.
      themes: {
        light: 'github-light',
        dark: 'github-dark-dimmed',
      },
      defaultColor: false,
      wrap: false,
      transformers: [
        {
          // Obsidian-style fence titles: ```cpp title:"My solution"
          // become a data-title attribute that CSS renders as a caption
          // above the block. The colon is optional so the common
          // title"..." typo still works. The language always lands in
          // data-language so CSS can show it in the same caption line.
          pre(node) {
            if (this.options.lang) {
              node.properties['data-language'] = this.options.lang;
            }
            const raw = this.options.meta?.__raw ?? '';
            const match = raw.match(/title:?\s*"([^"]+)"/);
            if (match) node.properties['data-title'] = match[1];
          },
        },
      ],
    },
  },
});
