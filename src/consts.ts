// Single source of truth for site-wide constants (used in meta tags, header,
// footer, feeds). Change a link or the tagline here, not in ten places.

export const SITE_TITLE = 'Shreyash Rai';
export const SITE_DESCRIPTION =
  'Things I learn and projects I build, a running log of TILs and writeups by Shreyash Rai.';

export const GITHUB_URL = 'https://github.com/ItsMat78';
export const LINKEDIN_URL = 'https://linkedin.com/in/shreyash-rai-3aa123251';
export const EMAIL = 'contact@shreyashrai.com';

// Cloudflare Web Analytics. Paste the site token from the Cloudflare
// dashboard (Analytics & Logs → Web Analytics → add site) to turn it on;
// empty string ships no script at all.
export const CF_ANALYTICS_TOKEN = '';

// Newsletter (Buttondown). Set to your Buttondown username to render the
// signup form; empty string ships no form at all. Buttondown's free tier can
// auto-send new posts from the RSS feed, so no other wiring is needed.
export const BUTTONDOWN_USER = '';

// Comments (giscus, backed by GitHub Discussions). Fill all four values from
// https://giscus.app to turn comments on; any empty value ships no widget.
// The repo must be public, have Discussions enabled, and the giscus app
// installed. `category` is a Discussions category (e.g. "Announcements").
export const GISCUS = {
  repo: '', // e.g. 'ItsMat78/shreyashrai.com'
  repoId: '',
  category: '',
  categoryId: '',
} as const;

// Header navigation, in order.
export const NAV = [
  { href: '/til', label: 'til' },
  { href: '/blog', label: 'blog' },
  { href: '/links', label: 'links' },
  { href: '/stream', label: 'stream' },
  { href: '/projects', label: 'projects' },
  { href: '/about', label: 'about' },
  { href: '/search', label: 'search' },
] as const;
