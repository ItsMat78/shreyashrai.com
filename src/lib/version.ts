import { execSync } from 'node:child_process';
import { REPO_URL } from '../consts';

// What the footer means by "version".
//
// A site like this has no releases, so a hand-maintained semver would be a
// number you'd forget to bump — and a stale version number is worse than none,
// because it claims something untrue. The commit that built the page IS the
// version: it can't drift, it needs no maintenance, and it points at the exact
// diff that produced what you're looking at.
//
// Resolved once, at build time.

export type SiteVersion = {
  commit: string; // short sha, or '' when it can't be determined
  commitUrl: string | null;
  builtAt: Date;
};

function shortSha(): string {
  // Cloudflare Pages hands the deployed commit to the build as an env var,
  // which is authoritative there and costs nothing to read.
  const fromPages = process.env.CF_PAGES_COMMIT_SHA;
  if (fromPages) return fromPages.slice(0, 7);

  // Local builds: ask git. Wrapped because the build must still work from a
  // plain source download with no .git directory and no git installed.
  try {
    return execSync('git rev-parse --short=7 HEAD', {
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
    }).trim();
  } catch {
    return '';
  }
}

export function getSiteVersion(): SiteVersion {
  const commit = shortSha();
  return {
    commit,
    commitUrl: commit ? `${REPO_URL}/commit/${commit}` : null,
    builtAt: new Date(),
  };
}
