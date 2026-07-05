---
title: Taxshila Companion
blurb: "A management and member-access app designed for my family's self-study hall business."
outcome: "200+ users and ~100k daily DB queries, live on the Play Store."
tech: ["Next.js", "React", "TypeScript", "Firebase", "Android"]
order: 3
cover: /images/admin-dashboard.png
live: https://taxshilacompanion.vercel.app/home
source: https://github.com/ItsMat78/taxshila-companion
---

*Taxshila Companion* is the operating system for a real, running study library.  
One QR code at the front desk turns attendance, study streaks, seats, fees, and push alerts into a single loop, on the web and on Android, from one codebase.

<a class="link-quiet" href="https://play.google.com/store/apps/details?id=co.median.android.yeeemel">
            Live on google play <span class="project__arrow"><svg viewBox="0 0 12 12" width="0.8em" height="0.8em" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 10 10 2M4 2h6v6"/></svg></span>
          </a>

## By the numbers

This isn't a demo. It runs a real library, in production, every day.

<div align="center">

| | | |
|:---:|:---:|:---:|
| **100K+** | **100+** | **1** |
| database reads & writes<br/>served per day | active members<br/>checking in daily | developer, designed,<br/>built & shipped end-to-end |
| **Web + Android** | **~25K** | **8** |
| one codebase,<br/>two platforms | lines of TypeScript<br/>across 144 files | service modules<br/>behind a clean API |

</div>


<figure>
<img src="/images/admin-dashboard.png" alt="Taxshila App">
<figsub>The app</figsub>
</figure>


## The one idea behind it

There is a **single printed QR code** taped to the reception desk. A member opens the app, taps **"Scan to check in,"** points the camera, and they are marked present, a short buzz confirms it. Checking out is one tap. That is the whole loop, and everything else exists to make that loop honest and keep people coming back tomorrow.

<div align="center">
  <img src="/images/QR_on_desk.png" alt="The check-in QR stand on the reception desk" width="280" />
  <br />
  <sub>The check-in QR stand on the reception desk</sub>
</div>

The scanner reads the code with the phone's built-in `BarcodeDetector` when it exists and **falls back to a hand-tuned `jsQR` decoder** on a cropped, downscaled frame otherwise. That fallback is the difference between "works" and "works instantly" on cheap phones and inside an Android WebView.

## The public face

A new person from Google Maps/JustDial meets a landing page built to *sell the room*, a bold **"Focus on Demand"** hero, amenities, pricing, reviews and FAQs, in a punchy editorial style that looks nothing like a templated dashboard.

<div align="center">
  <img src="/images/main_homepage.png" alt="Marketing landing page" width="600" />
  <br />
  <sub>Marketing landing page - Focus on Demand hero</sub>
</div>

And a **house-rules page**, "The Code of Conduct", that turns thirteen library rules into something people actually read: quiet-hours and monitoring badges up top, then plain-spoken, color-coded cards.

<div align="center">
  <img src="/images/rules_page.png" alt="House rules page" width="600" />
  <br />
  <sub>House rules - The Code of Conduct</sub>
</div>


## What members get

A member lives on **one screen**: a live session timer the moment they check in, their current day streak, hours logged this week, fee status, and their seat.

- 🟩 **A GitHub-style contribution grid** of study activity, paired with a two-week bar chart.
- 🔥 **Streak cards that warm up as the run grows**, the color and wording shift the longer the streak gets.
- 📅 **Attendance calendar** and a **fees & history** view (payment happens at the desk; the app just tells you exactly where you stand).
- ⚙️ **Profile controls**, seat/shift change requests and a one-tap notifications switch, plus an alerts inbox.

<table align="center">
  <tr>
    <td align="center">
      <img src="/images/member-dashboard-full.png" alt="Member dashboard" width="165" />
      <br />
      <sub>Member dashboard</sub>
    </td>
    <td align="center">
      <img src="/images/member-payments.png" alt="Member payments page" width="165" />
      <br />
      <sub>Fees &amp; payment history</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="/images/member-attendance.png" alt="Attendance calendar" width="165" />
      <br />
      <sub>Attendance calendar</sub>
    </td>
    <td align="center">
      <img src="/images/member_alerts.png" alt="Notifications & alerts inbox" width="165" />
      <br />
      <sub>Notifications &amp; alerts</sub>
    </td>
  </tr>
</table>

## What admins get

The admin side is built for someone standing at a desk being asked questions all day.

- **A dashboard that leads with the numbers that matter**, headcount, revenue, seats in use, recent joins and exits, with virtualized live lists that stay smooth at scale.
- **A leaderboard** of top weekly hours and longest active streaks, so it's obvious who's grinding and who's about to break a good run. Tap anyone to open their profile.
- **Full student management**, register, edit, move between shifts and seats, and flag members who've gone quiet, with per-shift seat availability.
- **Fees**, dues, complete payment history, and revenue over time.
- **Communication**, broadcast or one-to-one alerts, and an inbox for the feedback that comes back.
- **One-click CSV import/export** of the whole dataset for backups and migrations.

<div align="center">
  <img src="/images/admin-dashboard2.png" alt="Admin dashboard" width="600" />
  <br />
  <sub>Admin dashboard - headcount, revenue &amp; live activity</sub>
</div>
<br />
<div align="center">
  <img src="/images/admin-students.png" alt="Student management" width="600" />
  <br />
  <sub>Student &amp; shift management</sub>
</div>

## Under the hood

The parts you'd care about.

**Two push channels, picked automatically.** Inside the Android app, notifications run through **OneSignal** (native registration on first launch). On the web, they run through **Firebase Cloud Messaging**. The app detects which surface it's on and routes fee reminders, attendance nudges, payment confirmations, and announcements down the right pipe.

**A real service layer, not scattered queries.** All data access lives behind a dedicated service layer, students, attendance, fees, communication, notifications, so pages read like intent (`getMemberStudyStats(...)`) instead of raw Firestore calls. Shared aggregation helpers mean the dashboard and the attendance page compute streaks from a *single* source of truth.

**Role-based access, enforced on both sides.** `admin` and `member` roles, plus a read-only **reviewer guest** account. The rule lives in one place (`src/lib/auth-utils.ts`) and is enforced client-side *and* re-verified server-side (`src/lib/api-auth.ts`), the client is never trusted alone.

**Server-authoritative writes.** Sensitive mutations (creating auth users, deleting students, bulk import/export) go through Next.js **API routes backed by `firebase-admin`**, with the service account kept server-only. The browser gets React Query caching and optimistic UI; the server gets the final say.

**Built to stay fast as it grows.** `@tanstack/react-virtual` keeps long student and attendance lists at 60fps, React Query dedupes and caches reads, and Turbopack keeps the dev loop tight.


## Engineering highlights

- **Dual-platform from one Next.js codebase**, the same app is the website and, wrapped with Median, the Android app.
- **Resilient QR pipeline**, native `BarcodeDetector` with a downscaled `jsQR` fallback, tuned for low-end hardware.
- **Type-safe end to end**, TypeScript in `strict` mode with builds that *fail* on type or lint errors (no `ignoreBuildErrors` escape hatch).
- **Validated everywhere**, `react-hook-form` + `zod` schemas guard every form and server boundary.
- **Tested where it counts**, 57 Vitest tests cover the auth rules, CSV import/export, and the fee & attendance service logic.
- **CI on every push**, GitHub Actions runs lint, type-check, and the full Vitest suite on every push and PR; Husky + lint-staged also lint staged files before they're committed.

## Tech stack

| Layer | Choices |
|---|---|
| **Framework** | Next.js 15 (App Router), React 19, TypeScript |
| **Backend & data** | Firebase, Firestore, Auth, Cloud Functions, `firebase-admin` on the server |
| **UI** | Tailwind CSS, Radix UI primitives, Recharts, Lucide |
| **State & forms** | TanStack Query, TanStack Virtual, react-hook-form, zod |
| **Push** | OneSignal (Android native) + Firebase Cloud Messaging (web) |
| **Scanning** | Browser `BarcodeDetector` + `jsQR` fallback |
| **Mobile** | Median Android wrapper |
| **Tooling** | Vitest, ESLint, Husky, lint-staged, Turbopack, GitHub Actions |

Designed, built, and shipped by **[Shreyash Rai](mailto:contact@shreyashrai.com)**.

<sub>Questions, feedback, or just want to say hi → contact@shreyashrai.com</sub>

</div>

