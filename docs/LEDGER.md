# FF Reels — Decision Ledger

A chronological record of every major decision, design pivot, feature addition, and architectural choice made during the development of FF Reels. This ledger serves as institutional memory — the "why" behind the "what."

---

## Table of Contents

- [Day 1: Foundation (March 3, 2026)](#day-1-foundation-march-3-2026)
- [Day 2: Screening Experience + Industry Intelligence (March 3–4, 2026)](#day-2-screening-experience--industry-intelligence-march-3-4-2026)
- [Day 3: Mobile, Gallery, and Design Maturity (March 4, 2026)](#day-3-mobile-gallery-and-design-maturity-march-4-2026)
- [Day 4: Performance, Security, and Scale (March 5, 2026)](#day-4-performance-security-and-scale-march-5-2026)
- [Day 5: CRM, Team Management, and Polish (March 6, 2026)](#day-5-crm-team-management-and-polish-march-6-2026)
- [Design Philosophy](#design-philosophy)
- [Architectural Decisions](#architectural-decisions)
- [Known Debt & Open Questions](#known-debt--open-questions)

---

## Day 1: Foundation (March 3, 2026)

### `1dd7f5d` Initial scaffold: FF Reels platform
**Decision:** Next.js 14 App Router with TypeScript, Prisma + Neon PostgreSQL, Tailwind CSS.
**Why:** App Router gives server components for fast page loads. Neon provides serverless Postgres that scales to zero. Tailwind matches the rapid iteration speed needed.

### `cd0782f` Fix Vercel build: add prisma generate to build script
**Learning:** Vercel doesn't auto-run `prisma generate` — must be explicit in `build` script.

### `0495500` Add initial database migration
**Decision:** 18 models covering the full domain: User, Director, Project, Reel, ReelItem, ScreeningLink, ReelView, SpotView, Contact, Company, Update, IndustryCredit, FrameGrab, LookbookItem, TreatmentSample, ReelGalleryImage, plus NextAuth tables.
**Why:** Model the entire production company workflow upfront rather than iterating schema piecemeal.

### `9198d39` Switch auth from magic link to email + password
**Decision:** Dropped magic link auth in favor of credentials (email + bcrypt password).
**Why:** Magic links require reliable email delivery and create friction for internal team members who log in frequently. Password auth with 90-day JWT sessions is simpler for a small team.

### `822487b` Build Phase 1 UI: directors, reels, analytics, and upload flow
**Decision:** Server Components for data fetching, Client Components only for interactivity.
**Pattern:** Pages call Prisma directly (no API layer for reads), API routes handle mutations.

### `04562ff` – `156f54b` Logo + debug auth cycle
**Learning:** Auth debugging required temporary endpoints. Cleaned up immediately after resolution.

### `0639c09` Light theme redesign + Updates feed + 10 directors
**Decision:** Light cream (#F7F6F3) color palette instead of dark theme.
**Why:** Aligns with the premium, editorial aesthetic expected in the advertising industry. Dark themes feel tech-forward; cream feels sophisticated.

### `ca2eaa8` Refine design: sharper cards, director grid with sort/filter
**Decision:** Director grid layout with 5-across on desktop.

### `90e8af8` Add Wiredrive migration toolkit
**Decision:** Build custom migration scripts rather than manual data entry.
**Why:** Friends & Family had years of content in Wiredrive. Automated scraping + import preserved all metadata and saved weeks of manual work. Scripts include: wiredrive-scraper.js (browser console), wiredrive-import.ts, migrate-wiredrive.ts, mux-bulk-upload.ts.

### `72ea77f` Role-based access, editorial design, dashboard message board
**Decision:** Four roles — ADMIN, PRODUCER, REP, VIEWER.
**Why:** Reps need to build and share reels but shouldn't manage directors or users. Producers need upload access. Viewers are external (screening links only).

### `10070cc` Collins-level editorial redesign: serif typography, minimal chrome
**Pivot:** Tried serif typography inspired by Collins design agency.
**Reversed in:** `e00b9f7` — reverted to Inter typeface. Serif didn't match the tool's utilitarian nature.

### `e00b9f7` Revert to Inter typeface, add page transitions, New Work feed, Treatments page
**Decision:** Inter with tight letter-spacing (-0.02em, -0.03em) as the permanent typeface.
**Addition:** Framer Motion page transitions (fade-in + slide-up via `template.tsx`).
**Addition:** Treatments page for director treatment sample PDFs.

### `c2271f1` Add Industry Pulse feed with nightly scraper + territory mapping
**Decision:** Build an industry intelligence system that scrapes advertising trade publications.
**Why:** Reps need to know what directors are working on what brands — competitive intelligence is core to the business. Territory mapping (East/Midwest/West) follows the AICP regional model used in US commercial production.

### `63d9ee8` – `161eccf` Industry credits backfill + admin UI
**Decision:** Seed with 116 curated credits to demonstrate value before nightly scrape was live.

---

## Day 2: Screening Experience + Industry Intelligence (March 3–4, 2026)

### `336d262` Redesign Build Reel, directors grid 5-across, analytics depth
**Decision:** Reel builder gets opportunity metadata fields (brand, agency, campaign, producer).
**Why:** Reels aren't generic — they're tailored for specific pitches. Metadata lets the team track which reels were built for which opportunities.

### `ecad3cb` Reel builder: opportunity fields, frosted glass, spot filters, Signal rename
**Decision:** Rename "Updates" to "Signal" (the activity feed).
**Why:** "Updates" is generic. "Signal" communicates the intent: surfacing actionable intelligence about viewer behavior.

### `6e68c08` Deep analytics, view tracking, Mux player, upload page, off-roster directors
**Decision:** Track per-spot engagement (watch duration, percent watched, rewatched, skipped).
**Why:** Knowing that a creative director watched spot #3 three times but skipped spot #5 is actionable — it tells reps which work resonates.
**Decision:** Support off-roster directors.
**Why:** Friends & Family sometimes represents directors temporarily or for specific projects.

### `18b6d46` Screening carousel, director dropdown tiers, bio panel, portfolio stills
**Decision:** Screening page becomes a full-featured carousel experience, not just a video playlist.
**Why:** When a creative director opens a screening link, the experience should feel like a premium presentation — director bio, portfolio stills, company info, not just videos in a list.

### `bd2be1a` Share panel, download, company panel, cinema player, viewer identity
**Addition:** Gallery download, company panel showing F&F info, cinema-mode player.

### `7161f5c` Screening panel overhaul + remove Signal view notifications
**Decision:** Removed real-time view notifications from Signal feed.
**Why:** Too noisy. View signals were overwhelming the activity feed. Moved to dedicated analytics.

### `04660c8` – `b301ff0` Frame Grabs, Lookbook, and F&F panel styling
**Decision:** Add Frame Grabs gallery and Lookbook/Visual World panels to screening page.
**Why:** Directors' visual sensibility extends beyond their reel — lookbooks show their taste and artistic references.

### `06440b2` feat(scraper): AI-powered credit extraction via gpt-4o-mini
**Decision:** Use GPT-4o-mini to extract structured credits from unstructured article text.
**Why:** RSS feeds only give titles and categories. The actual director/DP/editor credits are buried in article bodies. AI extraction at $0.001/article is far cheaper than manual parsing.

### `ae64032` – `15a0ca3` Production company news adapter + US-only filtering
**Decision:** Add production company WordPress site scraping (Station Film, Superprime, etc.).
**Decision:** Filter industry credits to US-only.
**Why:** FF is a US production company. International credits create noise without actionable value.

### `57a05a3` feat: AI gallery pipeline + Caleb Slain customizations
**Decision:** Build AI-powered gallery generation: GPT-4o-mini scores candidate frames, Real-ESRGAN upscales winners.
**Why:** Clients want still images from reels for decks and internal presentations. AI scoring selects the most visually compelling frames automatically.

### `72ab215` feat(dashboard): add 5 dynamic features + UI polish
**Addition:** Hot right now (last 30 min), weekly digest, reel leaderboard, director scorecards, "My Activity" toggle.

### `fad5d5a` – `1450c06` Frosted glass aesthetic + dashboard overhaul
**Decision:** Frosted glass sidebar with backdrop blur. Kill dark dashboard banner.
**Why:** Glass aesthetic feels native and modern without competing with content.

---

## Day 3: Mobile, Gallery, and Design Maturity (March 4, 2026)

### `c69dda4` Add Gallery section to reel detail page
**Decision:** Gallery images viewable in lightbox from reel detail page. Downloadable as ZIP.

### `3141fca` Activate 6 scraper sources, add agency territory resolution
**Decision:** Go live with 6 out of 10 scraper adapters. Add agency-based territory resolution as fallback.
**Why:** Some adapters needed more testing. Agency territory (e.g., BBH → East) fills gaps when production company is unknown.

### `2419c63` Add PWA support and mobile Quick Reel builder
**Decision:** PWA manifest for mobile web, plus Quick Reel builder (simplified 3-step flow).
**Why:** Reps build reels from their phones. Quick builder with haptic feedback provides a native feel.

### `875e086` Add Capacitor native app shell with haptic feedback
**Decision:** Wrap the web app in Capacitor for iOS/Android distribution.
**Why:** App Store presence gives legitimacy. Capacitor avoids maintaining a separate mobile codebase — the app loads from the production server with native bridges for haptics, share sheet, and status bar.
**Config:** App loads `https://reels.friendsandfamily.tv` — no local bundle.

### `d346272` iPad glass aesthetic + Director roster page
**Decision:** iPad-optimized layout with glass card aesthetic for the roster page.

### `813a0ca` Remove Quick Reel, add logo to sidebar, burnt orange Build Reel button
**Pivot:** Removed Quick Reel builder from sidebar.
**Why:** Two builder modes caused confusion. Full builder handles all cases; quick builder was redundant.
**Note:** Quick Reel page still exists at `/reels/quick` — just removed from nav.

### `bb6a78a` FEDL-inspired design refresh
**Decision:** Design refresh inspired by FEDL (commercial production directory).
**Why:** FEDL is the industry standard visual language for production company tools.

### `59d42d4` Wiredrive-style analytics table with expandable view detail
**Decision:** Analytics table with expandable rows showing per-viewer timeline.
**Why:** Mirrors the Wiredrive analytics UX that FF's team already understood.

### `a8f2f6d` Login page redesign + 90-day sessions
**Decision:** 90-day JWT session expiry.
**Why:** Team members shouldn't have to log in every day. 90 days balances security with convenience for an internal tool.

### `393c351` Autoplay after 3 seconds + thumbnail hover tooltips
**Decision:** Screening page auto-starts video playback after 3 seconds.
**Why:** Reduces friction for viewers. They clicked the link to watch — don't make them click again.

### `fc2a9eb` Detect short films/case studies by title + sort spots by brand
**Decision:** Auto-detect content type from title keywords ("case study", "short film", "BTS").
**Why:** Directors have mixed content types. Separating them in the screening experience prevents a brand film from being sandwiched between TV spots.

### `933a0be` – `c676046` Playable panels + pause main player
**Decision:** Case studies and short films playable in their own panels. Main player pauses when any panel opens.
**Why:** Prevents audio overlap. Panel content should feel intentional, not accidental.

### `1263b46` Quick stats badges on reel cards
**Addition:** View count badges on reel cards in the list view.

---

## Day 4: Performance, Security, and Scale (March 5, 2026)

### `acc04db` Fix industry page crash + Signal 3x2 layout
**Fix:** Industry page crashed on empty data. Signal feed moved to 3x2 grid layout.

### `01d1774` Security + QC fixes: auth on upload API, query limits
**Decision:** Add auth check to upload API (was missing). Add `take` limits to all heavy Prisma queries.
**Why:** Upload endpoint was accidentally public. Query limits prevent Neon serverless timeouts on large datasets.

### `b43587a` fix(security+perf): Mux webhook verification, screening parallelization
**Decision:** Add Mux webhook signature verification. Parallelize screening page data loading.
**Why:** Webhook without verification allows anyone to spoof video status updates. Parallel queries (9 concurrent) cut screening page load time significantly.

### `8724a7d` feat(scraper): add 4 new source adapters
**Decision:** Expand from 6 to 10 scraper sources (Champion Newsletter, Campaign Brief, Adland, Ads of the World).
**Addition:** Expand production company database to ~200 entries.

### `6b79242` fix: reels page crash — simplify latestViews query
**Fix:** Complex join query timed out on Neon serverless. Simplified to avoid the timeout.
**Learning:** Neon has a 5-second query timeout on the free/starter tier. Complex aggregations need to be split or simplified.

### `6080c9b` – `65d5f5a` Fix server component onClick + screening link icons
**Fix:** Had an onClick handler on a Server Component — illegal in React Server Components.
**Learning:** Always check component boundary when adding interactivity.

### `87d8b51` Fix copy spot/reel link with clipboard fallback
**Decision:** Clipboard API with fallback to `document.execCommand('copy')`.
**Why:** Clipboard API requires HTTPS and user gesture. Fallback handles edge cases.

---

## Day 5: CRM, Team Management, and Polish (March 6, 2026)

### `6988ac7` Curated director thumbnails + fix letterboxing
**Decision:** Auto-select hero thumbnail per director using scoring heuristics (reel appearance, custom thumbnail, premium brand, duration, recency).
**Why:** Directors without curated thumbnails showed Mux default frames — often black or poorly composed.
**Fix:** Avoid letterboxed videos as hero thumbnails.

### `2baf978` Add Contact CRM with unified viewer history
**Decision:** Build a Contact CRM that unifies screening link recipients with view analytics.
**Why:** Before this, a rep couldn't see all interactions with a specific person across different reels and directors. The CRM connects the dots: "Jane at BBH viewed 3 different director reels this month."
**Features:** Hot lead detection (3+ views/week or 2+ directors viewed), engagement stats, device tracking.

### `a6533b9` Fix reel builder to support multi-director reels
**Fix:** Reel builder assumed single-director. Multi-director reels now show a warning and work correctly.
**Why:** Some opportunities call for showing multiple directors from the roster.

### `671eda0` Add team management + director transition cards
**Decision:** Full user management UI (invite, role assignment, resend invite, delete).
**Addition:** Director cards show transition animations.

### `6acf9e6` Move Users to standalone sidebar page
**Decision:** Users management gets its own sidebar entry instead of being buried in settings.
**Why:** Admins access it frequently enough to warrant top-level navigation.

### `4ca4037` – `370f397` Email configuration
**Decision:** Use Resend test address (`onboarding@resend.dev`) until custom domain fully verified.
**Decision:** Show email send errors in the invite UI rather than silently failing.
**Why:** Transparent error handling prevents admins from thinking invites were sent when they weren't.

### `f670af5` Update favicon and icons to FF logo
**Decision:** Custom favicon and app icons using the Friends & Family logo mark.

---

## Design Philosophy

### Visual Language
- **Cream palette** (#F7F6F3) — warm, editorial, not clinical
- **Inter typeface** with tight letter-spacing — clean without being cold
- **Frosted glass** sidebar and cards — modern without competing with content
- **Framer Motion** transitions — polish without performance cost
- **No dark mode** — single theme maintains brand consistency

### UX Principles
1. **Server-first rendering** — pages load fast, interactivity is progressive
2. **Parallel data loading** — screening page runs 9 concurrent queries
3. **Role-based visibility** — UI adapts to user permissions, no disabled buttons
4. **Optimistic updates** — `router.refresh()` after mutations for instant feedback
5. **Mobile-aware** — responsive layouts, haptic feedback, native share sheet

### Industry Alignment
- Analytics table modeled after Wiredrive (familiar to FF team)
- Territory mapping follows AICP regional model (East/Midwest/West)
- FEDL-inspired design language (production industry standard)
- Screening experience designed for creative directors at agencies

---

## Architectural Decisions

| Decision | Choice | Alternative Considered | Rationale |
|----------|--------|----------------------|-----------|
| Auth strategy | JWT (90-day) | Database sessions | Simpler for serverless; no session table queries per request |
| Auth provider | Credentials | Magic link / OAuth | Internal team, frequent logins. Magic links add email dependency friction |
| Video hosting | Mux | Cloudflare Stream, self-hosted | Mux is industry standard for ad tech. Thumbnail API, player SDK, webhooks |
| File storage | Cloudflare R2 | AWS S3, Vercel Blob | S3-compatible API, no egress fees, cheaper than S3 for video files |
| Database | Neon PostgreSQL | PlanetScale, Supabase | Serverless Postgres, scales to zero, Prisma native support |
| Mobile | Capacitor (web-loaded) | React Native, Flutter | Zero mobile-specific code. App loads from production URL |
| AI frame scoring | GPT-4o-mini | CLIP, custom model | Vision API scores aesthetics directly. No training data needed |
| Image upscaling | Real-ESRGAN (Replicate) | Sharp, Cloudinary | 2x upscale produces gallery-quality stills at $0.004/image |
| Scraper architecture | Adapter pattern | Single monolithic scraper | Each source has unique markup. Adapters isolate complexity |
| State management | React hooks + router.refresh() | Redux, Zustand | Server Components handle most state. Client state is local |
| Email | Resend | SendGrid, Postmark | Simple API, good DX, React email support |
| Styling | Tailwind + CVA | Styled-components, CSS modules | Rapid iteration, consistent design tokens, small bundle |

---

## Known Debt & Open Questions

### Technical Debt
1. **Project deletion doesn't clean up Mux/R2 assets** — orphaned video files and storage objects accumulate
2. **No input validation library** — manual checks are inconsistent across API routes (Zod is installed but unused)
3. **Screening link passwords stored but never enforced** — the password field exists in the schema and API but the screening page doesn't check it
4. **No self-service password reset** — users must ask an admin to resend their invite
5. **No rate limiting on public tracking endpoints** — view tracking APIs are unauthenticated and unlimited
6. **Gallery generation can orphan R2 images** — if DB insert fails after R2 upload, images are leaked
7. **Missing database indexes** — `Project.directorId`, `Reel.directorId`, `ScreeningLink.reelId`, and `ReelView.screeningLinkId+createdAt` would benefit from explicit indexes

### Open Questions
- Should screening link passwords actually be enforced? If so, where does the gate UI go?
- Should there be a "Sent" status on screening links (distinct from "created")?
- Should the nightly scraper send a summary email to admins?
- Should off-roster directors be hidden from the reel builder?
- What's the retention policy for ReelView/SpotView analytics data?

---

## Milestone Summary

| Date | Milestone | Commits |
|------|-----------|---------|
| Mar 3, 2026 | **Foundation** — Scaffold, auth, Phase 1 UI, Wiredrive migration, design system, industry scraper | 20 commits |
| Mar 3–4, 2026 | **Screening Experience** — Carousel, analytics, panels, AI gallery, scraper expansion | 20 commits |
| Mar 4, 2026 | **Mobile + Polish** — Capacitor, PWA, design maturity, autoplay, content types | 15 commits |
| Mar 5, 2026 | **Hardening** — Security fixes, performance (Neon timeouts), webhook verification, 4 new scrapers | 8 commits |
| Mar 6, 2026 | **CRM + Team** — Contact management, user invites, multi-director reels, email config | 9 commits |
| **Total** | | **72 commits in 4 days** |
