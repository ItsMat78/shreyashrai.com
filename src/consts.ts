// Single source of truth for site-wide constants (used in meta tags, header,
// footer, feeds). Change a link or the tagline here, not in ten places.

export const SITE_TITLE = 'Shreyash Rai';
export const SITE_DESCRIPTION =
  'Things I learn and projects I build, a running log of TILs and writeups by Shreyash Rai.';

export const GITHUB_URL = 'https://github.com/ItsMat78';
// The repo this site is built from — used to link the footer's build hash to
// the exact commit that produced the page you're reading.
export const REPO_URL = 'https://github.com/ItsMat78/shreyashrai.com';
export const LINKEDIN_URL = 'https://linkedin.com/in/shreyash-rai-3aa123251';
export const EMAIL = 'contact@shreyashrai.com';

// Cloudflare Web Analytics. The site token comes from the Cloudflare dashboard
// (Analytics & Logs â†’ Web Analytics â†’ add site).
//
// It's read from the PUBLIC_CF_ANALYTICS_TOKEN environment variable â€” set it in
// the Cloudflare Pages project (Settings â†’ Variables, for Production AND
// Preview) and locally in a `.env` file, which git ignores. The repo is public,
// so the token stays out of it. `.env.example` documents the name.
//
// The fallback below is a deliberate escape hatch for a token you don't mind
// committing; leave it empty and no analytics script is shipped at all.
const CF_ANALYTICS_TOKEN_FALLBACK = '';

export const CF_ANALYTICS_TOKEN =
  import.meta.env.PUBLIC_CF_ANALYTICS_TOKEN || CF_ANALYTICS_TOKEN_FALLBACK;

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

// Monkeytype username, for the stats summary on /type. Empty string ships no
// section and makes no network call at build.
//
// This reads the PUBLIC profile endpoint, so it needs no API key: the username
// is all that's required, and everything shown is already public on the
// Monkeytype profile page. (An ApeKey would have to sit in the build env to
// reach the private endpoints, and could never be used client-side on a static
// site without handing it to every visitor.)
export const MONKEYTYPE_USER = 'ItsMat78';

// Primary navigation â€” three intent-level anchors, not the content taxonomy.
// "Notes" is the hub that gathers TILs, writing, links, stream, and quotes;
// search + the theme toggle ride alongside as utilities (see Header.astro).
export const NAV = [
  { href: '/notes', label: 'Notes' },
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
] as const;
