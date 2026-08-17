import { MONKEYTYPE_USER } from '../consts';

// Monkeytype stats for /type, fetched ONCE at build time.
//
// This deliberately uses the PUBLIC profile endpoint
// (GET /users/{name}/profile) rather than the authenticated ApeKey endpoints.
// The site is a static, open-source, publicly deployed thing: an ApeKey would
// have to live in the build environment to be useful, and any client-side use
// would hand the key to every visitor. The public profile carries everything
// worth showing here — personal bests, tests completed, time typing, streak —
// and needs no secret at all.
//
// Because it's a build-time snapshot, the numbers move only when the site
// rebuilds. That's stated on the page rather than hidden.

const API = 'https://api.monkeytype.com';
const TIMEOUT_MS = 6000;

// An average is the one thing the public profile does NOT carry — it exposes
// totals and personal bests only. Averaging means reading actual test results,
// which needs an ApeKey.
//
// Read from the environment, never from consts.ts, and deliberately WITHOUT a
// PUBLIC_ prefix: a PUBLIC_ variable is inlined into the client bundle, which
// would hand the key to every visitor. This is used at build time only, and
// only aggregates ever reach the HTML. Optional — with no key the section drops
// the averages and everything else still works.
const APE_KEY =
  ((import.meta.env.MONKEYTYPE_APE_KEY as string | undefined) ||
    process.env.MONKEYTYPE_APE_KEY ||
    '').trim();

// How many recent tests to average over. The endpoint caps at 1000.
const RESULTS_LIMIT = 1000;

// One personal best as the API returns it. Several entries can exist per
// submode (different language, punctuation, difficulty), so the best is chosen
// by wpm rather than assumed to be first.
type RawBest = {
  wpm: number;
  acc: number;
  raw: number;
  consistency?: number;
  timestamp: number;
  language: string;
  difficulty: string;
  punctuation?: boolean;
  numbers?: boolean;
};

type RawProfile = {
  data?: {
    name?: string;
    xp?: number;
    streak?: number;
    maxStreak?: number;
    typingStats?: {
      completedTests?: number;
      startedTests?: number;
      timeTyping?: number; // seconds
    };
    personalBests?: {
      time?: Record<string, RawBest[]>;
      words?: Record<string, RawBest[]>;
    };
  };
};

export type PersonalBest = {
  label: string; // "15s", "60 words"
  wpm: number;
  acc: number;
  raw: number;
  consistency?: number;
  language: string;
  date: Date;
};

// Averages across real tests. Present only when an ApeKey is configured.
export type MonkeytypeAverages = {
  wpm: number;
  accuracy: number;
  sample: number; // how many tests the average covers
  recentWpm: number; // last 10 tests, the figure Monkeytype itself shows
};

export type MonkeytypeProfile = {
  name: string;
  url: string;
  xp: number;
  streak: number;
  maxStreak: number;
  completedTests: number;
  timeTypingHours: number;
  timeBests: PersonalBest[]; // 15 / 30 / 60 / 120 second tests
  wordBests: PersonalBest[]; // 10 / 25 / 50 / 100 word tests
  averages: MonkeytypeAverages | null;
  fetchedAt: Date;
};

// The submodes worth showing, in the order Monkeytype itself lists them.
const TIME_MODES = ['15', '30', '60', '120'];
const WORD_MODES = ['10', '25', '50', '100'];

function pickBest(entries: RawBest[] | undefined, label: string): PersonalBest | null {
  if (!entries || entries.length === 0) return null;
  const best = [...entries].sort((a, b) => b.wpm - a.wpm)[0];
  if (!best || typeof best.wpm !== 'number') return null;
  return {
    label,
    wpm: Math.round(best.wpm),
    acc: Math.round(best.acc),
    raw: Math.round(best.raw),
    consistency: typeof best.consistency === 'number' ? Math.round(best.consistency) : undefined,
    language: best.language ?? 'english',
    date: new Date(best.timestamp),
  };
}

// Recent test results, averaged. Returns null when no key is set, or on any
// failure — an average is a nice-to-have and must never take the section down
// with it, let alone the build.
async function getAverages(): Promise<MonkeytypeAverages | null> {
  if (!APE_KEY) return null;

  try {
    const response = await fetch(`${API}/results?limit=${RESULTS_LIMIT}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `ApeKey ${APE_KEY}`,
        'User-Agent': 'shreyashrai.com build',
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      // Deliberately logs the status only. Never the key, and never the body,
      // which can echo request details back into a public build log.
      console.warn(`[monkeytype] results returned ${response.status} — averages skipped.`);
      return null;
    }

    const body = (await response.json()) as { data?: unknown };
    const rows = Array.isArray(body?.data) ? body.data : [];
    // Results come back newest first. Keep only rows that actually carry a
    // number, so one malformed entry can't drag the mean to NaN.
    const tests = rows
      .filter(
        (r): r is { wpm: number; acc?: number } =>
          typeof r === 'object' && r !== null && typeof (r as { wpm?: unknown }).wpm === 'number',
      )
      .filter((r) => Number.isFinite(r.wpm) && r.wpm > 0);

    if (tests.length === 0) {
      console.warn('[monkeytype] results held no usable tests — averages skipped.');
      return null;
    }

    const mean = (nums: number[]) => nums.reduce((sum, n) => sum + n, 0) / nums.length;
    const accs = tests
      .map((t) => t.acc)
      .filter((a): a is number => typeof a === 'number' && Number.isFinite(a));

    return {
      wpm: Math.round(mean(tests.map((t) => t.wpm))),
      accuracy: accs.length > 0 ? Math.round(mean(accs)) : 0,
      sample: tests.length,
      recentWpm: Math.round(mean(tests.slice(0, 10).map((t) => t.wpm))),
    };
  } catch (error) {
    console.warn('[monkeytype] results fetch failed — averages skipped:', error);
    return null;
  }
}

export async function getMonkeytypeProfile(): Promise<MonkeytypeProfile | null> {
  // No username configured: the whole section ships nothing, same as the
  // newsletter and comments gates.
  if (!MONKEYTYPE_USER) return null;

  let raw: RawProfile;
  try {
    // A slow or down third-party API must never fail or hang the build, so the
    // request is time-boxed and every failure path returns null.
    const response = await fetch(
      `${API}/users/${encodeURIComponent(MONKEYTYPE_USER)}/profile`,
      {
        headers: { Accept: 'application/json', 'User-Agent': 'shreyashrai.com build' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      },
    );
    if (!response.ok) {
      console.warn(
        `[monkeytype] ${response.status} for user "${MONKEYTYPE_USER}" — skipping the section.`,
      );
      return null;
    }
    raw = (await response.json()) as RawProfile;
  } catch (error) {
    console.warn('[monkeytype] profile fetch failed, skipping the section:', error);
    return null;
  }

  const data = raw?.data;
  if (!data) {
    console.warn('[monkeytype] response had no data field, skipping the section.');
    return null;
  }

  const timeBests = TIME_MODES.map((m) =>
    pickBest(data.personalBests?.time?.[m], `${m}s`),
  ).filter((b): b is PersonalBest => b !== null);

  const wordBests = WORD_MODES.map((m) =>
    pickBest(data.personalBests?.words?.[m], `${m} words`),
  ).filter((b): b is PersonalBest => b !== null);

  // Only asked for once the profile is known to be good, so a bad username
  // doesn't spend a second request.
  const averages = await getAverages();

  return {
    name: data.name ?? MONKEYTYPE_USER,
    url: `https://monkeytype.com/profile/${encodeURIComponent(data.name ?? MONKEYTYPE_USER)}`,
    xp: Math.round(data.xp ?? 0),
    streak: data.streak ?? 0,
    maxStreak: data.maxStreak ?? 0,
    completedTests: data.typingStats?.completedTests ?? 0,
    timeTypingHours: Math.round(((data.typingStats?.timeTyping ?? 0) / 3600) * 10) / 10,
    timeBests,
    wordBests,
    averages,
    fetchedAt: new Date(),
  };
}
