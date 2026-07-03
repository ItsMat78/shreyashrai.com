// Single source of truth for site-wide constants (used in meta tags, header,
// footer, feeds). Change a link or the tagline here, not in ten places.

export const SITE_TITLE = 'Shreyash Rai';
export const SITE_DESCRIPTION =
  'Things I learn and projects I build — a running log of TILs and writeups by Shreyash Rai.';

export const GITHUB_URL = 'https://github.com/ItsMat78';
export const EMAIL = 'shreyashrai078@gmail.com';

// Header navigation, in order.
export const NAV = [
  { href: '/til', label: 'til' },
  { href: '/blog', label: 'blog' },
  { href: '/projects', label: 'projects' },
  { href: '/about', label: 'about' },
] as const;
