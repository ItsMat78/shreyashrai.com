// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// The canonical origin. Required for RSS, sitemap, and canonical URLs.
export default defineConfig({
  site: 'https://shreyashrai.com',
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      // Dual theme: Shiki emits both palettes as CSS variables and global.css
      // switches between them under prefers-color-scheme. See global.css.
      themes: {
        light: 'github-light',
        dark: 'github-dark-dimmed',
      },
      defaultColor: false,
      wrap: false,
    },
  },
});
