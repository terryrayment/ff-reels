# CLAUDE.md

Operational guide for contributors working in this repository.

## Project Overview

**Friends & Family Reels** is an internal platform for Friends & Family, a commercial production company. It manages director reels, screening links with viewer analytics, and industry intelligence.

- **App**: `reels.friendsandfamily.tv` (this repo, deployed on Vercel)
- **Marketing site**: Public pages at `/site/*` in this repo (also served from `reels.friendsandfamily.tv/site`). Legacy Webflow at `friendsandfamily.tv` may still exist for some URLs — verify live routing before assuming a single host.
- **Decision history**: `docs/LEDGER.md` (chronological; read before large marketing pivots)

Core workflows: build curated reels from director projects → send screening links to agency contacts → track engagement analytics → surface industry credits via nightly scraper.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router), React 18 |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL (Neon) via Prisma ORM |
| Auth | NextAuth 4 — JWT strategy, Credentials provider (email/password, bcryptjs) |
| Styling | Tailwind CSS (custom palette). No shadcn — custom UI primitives in `src/components/ui/` |
| Video | Mux (transcoding, streaming, thumbnails) |
| Storage | Cloudflare R2 (S3-compatible, original video files + gallery images) |
| Email | Gmail SMTP via nodemailer |
| AI | OpenAI gpt-4o-mini (frame scoring, credit extraction), Replicate Real-ESRGAN (upscaling) |
| Mobile | Capacitor (iOS/Android wrapper) |
| Hosting | Vercel (serverless functions, edge, cron) |
| Key libs | @dnd-kit (drag-drop), archiver (ZIP), cheerio (scraping), zod (validation), framer-motion, recharts, lucide-react |

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login, forgot-password, set-password
│   ├── (dashboard)/         # Protected team UI (sidebar layout)
│   │   ├── dashboard/       # Home — activity feed, signal widgets
│   │   ├── reels/           # List, build, quick-build, detail
│   │   ├── directors/       # Roster management, profiles
│   │   ├── analytics/       # Engagement dashboards
│   │   ├── contacts/        # Lightweight CRM
│   │   ├── industry/        # Industry Pulse (scraped credits)
│   │   ├── portfolio/       # DIRECTOR-role: own portfolio
│   │   ├── my-reels/        # DIRECTOR-role: own reels
│   │   ├── my-stats/        # DIRECTOR-role: anonymized analytics
│   │   └── users/           # ADMIN-only: user management
│   ├── (screening)/         # Public + tokenized playback
│   │   ├── s/[token]/       # Screening link viewer
│   │   └── preview/[token]/ # Admin preview (signed JWT in URL)
│   ├── (marketing)/         # Public marketing site (indexed — see SEO Rules)
│   │   └── site/            # Home splash, work, directors, about, contact, youth, colossal
│   │       └── home/preview* # Homepage mockup previews (noindex)
│   ├── api/                 # API routes (private routes return X-Robots-Tag: noindex)
│   └── commercial-production-company-los-angeles/  # SEO landing page
├── components/
│   ├── ui/                  # Button, Input, Badge, Modal, EmptyState, etc.
│   ├── marketing/           # Nav, footer, transitions, home-splash, directors-list, etc.
│   ├── reels/               # Reel builder, galleries, screening links
│   ├── directors/           # Roster grid, profile, headshot upload
│   ├── video/               # Mux player, screening tracker, carousel
│   ├── dashboard/           # Signal feed, activity widgets
│   ├── analytics/           # Charts, engagement tables
│   ├── contacts/            # Contact autocomplete, CRM UI
│   ├── auth/                # Login form
│   └── layout/              # Sidebar, navigation
├── lib/
│   ├── auth/                # NextAuth options + guard functions
│   ├── db/                  # Prisma client singleton
│   ├── mux/                 # Mux client + download resolution
│   ├── r2/                  # R2 client + presigned URLs
│   ├── email/               # Transactional email (invite/reset)
│   ├── gallery/             # Frame scoring, upscaling, generation
│   ├── scraper/             # Industry credits engine + 10 source adapters
│   ├── analytics/           # Scoring, device detection, geo, queries
│   ├── seo/                 # URL helpers, structured data
│   ├── marketing/           # canonical-source, transitions, carousel/splash data
│   └── utils.ts             # cn(), timeAgo(), formatDuration(), slugify()
├── types/
│   └── next-auth.d.ts       # Augmented Session type (role, directorId)
└── middleware.ts             # JWT validation + DIRECTOR route redirect
```

## Development Setup

```bash
cp .env.example .env         # Fill in all required values
npm install
npx prisma generate
npm run dev                  # http://localhost:3000
```

Required env vars are documented in `.env.example`. Key ones: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET`, `MUX_WEBHOOK_SECRET`, `R2_*` credentials, `GMAIL_USER`, `GMAIL_APP_PASSWORD`.

Build command: `prisma generate && next build` (runs via `npm run build`).

## Architecture Patterns

### API Routes

Every route handler follows this flow:

1. `getServerSession(authOptions)` — get session
2. Role guard (`isTeamRole()`, or specific `canView*`/`canManage*`)
3. Fetch resource from Prisma
4. Access guard (verify the user can touch this specific resource)
5. Business logic
6. Respond with `NextResponse.json()`

**Response format**: `{ ...data }` on success, `{ error: "message" }` on failure.

**Status codes**: `200` OK, `201` Created, `400` Bad Request, `401` Unauthorized (no session or invalid token), `403` Forbidden (authenticated but wrong role/scope), `404` Not Found, `409` Conflict (resource exists or video still preparing), `500` Server Error.

### Authentication

- **JWT in cookie**, refreshed on every request (role + directorId re-read from DB)
- **Session duration**: 8 hours default, 90 days with "Remember Me"
- **Guards** in `src/lib/auth/guards.ts`:
  - `isTeamRole(role)` — true for ADMIN, PRODUCER, REP
  - `canViewDirector(session, directorId)` — team sees all; DIRECTOR sees own
  - Reel viewing — all team roles (ADMIN/PRODUCER/REP) see the full shared reel library; DIRECTOR sees own
  - Reel managing — ADMIN/PRODUCER manage all; REP edits/deletes only reels they created (by `createdById`; legacy reels with no creator stay open); any team role can duplicate any reel (copy is owned by the duplicator) — `canManageReel()` in `src/app/api/reels/[id]/route.ts`
  - `canAccessProject(session, projectDirectorId)` — team sees all; DIRECTOR sees own
- **`lastActiveAt`** on User is updated at most once per 5 minutes (throttled in JWT callback)

### Token-Based Access (Screening Links)

Download/gallery endpoints accept **either** a valid session **or** a screening token:

```
?token=<screening-link-token>
```

Token validation: `isActive === true` AND (`expiresAt` is null OR in the future) AND token scopes to the requested resource (e.g., the project is in the reel's items).

**Preflight**: `?preflight=1` on download endpoints returns status (200/409/404) without streaming the file.

### Data Fetching

- **Server components**: Query Prisma directly (async page functions)
- **Client components**: `fetch()` to `/api/*` endpoints. No SWR or React Query.
- **After mutations**: `router.refresh()` to revalidate server data
- **Parallel queries**: Heavy use of `Promise.all()` for batch Prisma calls

### Components & Styling

- Custom UI primitives in `src/components/ui/` — Button (variants: primary/secondary/ghost/danger), Input, Badge, Modal, EmptyState
- `cn()` utility from `src/lib/utils.ts` (clsx + tailwind-merge)
- Tailwind utility classes inline, no CSS modules
- Custom color palette: `#F7F6F3` (cream background), `#1A1A1A` (text), `#EEEDEA` (dark cream)
- Icons from `lucide-react`
- Drag-and-drop via `@dnd-kit` (PointerSensor + TouchSensor + KeyboardSensor)

## Data Model

### Role Hierarchy

```
ADMIN      — Full access + user management
PRODUCER   — All data except user management
REP        — Build & send reels; see own reel analytics; CRM contacts
DIRECTOR   — Own portfolio, own reels, anonymized stats
VIEWER     — Screening links only (unauthenticated, token-based)
```

### Key Relationships

- **Director** → has many **Projects** (individual spots/work)
- **Reel** → has many **ReelItems** → each points to a **Project**
- **Reel** → has many **ScreeningLinks** → each has many **ReelViews** → each has many **SpotViews**
- **User.directorId** links DIRECTOR-role users to their Director profile
- **Reel.createdById** scopes REP access (REPs only see/manage reels they created)
- **IndustryCredit** is standalone (populated by nightly scraper, not linked to directors)

### Video Asset Lifecycle

`waiting` → `preparing` → `ready` (or `errored`)

Managed by Mux webhooks: `video.upload.asset_created` → `video.asset.ready` / `video.asset.errored`.

## External Services

### Mux (Video)

- Client: lazy singleton in `src/lib/mux/client.ts`
- Webhooks: `POST /api/mux/webhook` (signature verified via `MUX_WEBHOOK_SECRET`)
- Download priority: R2 original → Mux master → Mux static renditions (highest → capped-1080p → 720p)
- Thumbnails: `image.mux.com/{playbackId}/thumbnail.jpg`

### Cloudflare R2 (Storage)

- Client: S3-compatible in `src/lib/r2/client.ts`
- Presigned URLs for upload (`getUploadUrl`) and download (`getDownloadUrl`)
- Server-side upload via `uploadBuffer`
- Used for original video files + gallery images

### Email (Gmail SMTP)

- Client: nodemailer in `src/lib/email/resend.ts`
- Sends invite and password reset emails
- From: configured via `EMAIL_FROM` env var

### AI Services

- **OpenAI gpt-4o-mini**: Frame scoring (`src/lib/gallery/frame-scorer.ts`), credit extraction from scraped articles (`src/lib/scraper/ai-extract.ts`)
- **Replicate Real-ESRGAN**: 2x image upscaling for gallery frames (`src/lib/gallery/upscaler.ts`)

### Industry Scraper

- Engine: `src/lib/scraper/engine.ts` — 10 parallel source adapters (Muse by Clio, Adweek, SHOTS, Shoot Online, Ads of the World, LBB, Campaign Brief, Adland, Champion Newsletter, Production Company News)
- Triggered by Vercel cron at `/api/cron/scrape-industry` (3 AM EST daily)
- Auth: requires `CRON_SECRET` bearer token
- Max duration: 60 seconds (Vercel Pro limit)
- Deduplicates by brand + campaign + director within 7-day window
- AI enrichment pass for credits with article text but missing key fields

## Goal

Ship changes without surprising current users.

If a change can alter the normal reel/screening workflow, prefer:

1. additive behavior
2. stricter security with equivalent happy-path UX
3. explicit rollout and smoke testing before deploy

## Critical Invariants

Do not merge changes that violate these:

- `POST /api/reels/preview` must require authenticated team role.
- Reel/project download endpoints must require either a valid scoped screening token or an authorized session with resource access.
- `REP` users can read and duplicate any reel in the shared library, but cannot edit/delete reels they do not own (duplicated copies belong to the duplicator).
- `DIRECTOR` users can only access resources tied to `session.user.directorId`.
- Public tracking endpoints remain unauthenticated (`/api/tracking/*`) for screening playback.
- `POST /api/mux/webhook` must verify `MUX_WEBHOOK_SECRET`.
- Private/auth/tokenized routes (`/dashboard/*`, `/reels/*`, `/s/*`, `/preview/*`, auth pages) must stay non-indexable.
- `robots.txt` and `sitemap.xml` must not expose tokenized URLs or private app routes.

## SEO Rules

Indexable public routes are defined in `src/app/sitemap.ts` and allowlisted in `src/app/robots.ts`. As of the June 2026 marketing ship, this includes `/site`, `/site/work`, `/site/directors`, `/site/directors/[slug]`, `/site/about`, `/site/contact`, and `/commercial-production-company-los-angeles`. Partner imprint routes (`/site/youth`, `/site/colossal`) and homepage mockup previews (`/site/home/preview*`, `/site/preview/*`) are not in the sitemap — keep them `noindex` unless product explicitly expands indexability.

- Private/auth/tokenized/API routes get `X-Robots-Tag: noindex, nofollow` via `next.config.mjs` headers where applicable.
- `src/app/robots.ts` and `src/app/sitemap.ts` must stay in sync with indexability policy.
- Dashboard and screening layouts set `robots: { index: false, follow: false, nocache: true }` in metadata.
- If SEO behavior changes, update `docs/SEO.md` + `docs/DEPLOYMENT.md` + this file + `docs/LEDGER.md`.

## Required Local Checks Before Merge

Run all checks from repo root:

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run seo:audit -- --url=https://www.friendsandfamily.tv
```

If any check is skipped, call it out in PR notes.

If the PR touches marketing pages, components under `src/components/marketing/`, or `src/lib/marketing/`, also run:

```bash
npm run marketing:transition-qc
```

(See `docs/marketing/transitions/transition.md`. Production matrix hits `https://reels.friendsandfamily.tv`.)

## Auth Regression Smoke Test

Set:

```bash
APP_URL="http://localhost:3000" # or deployed URL
REEL_ID="..."
PROJECT_ID="..."
VALID_TOKEN="..."
```

Then run:

```bash
# Must be blocked when logged out
curl -i -X POST "$APP_URL/api/reels/preview" \
  -H "Content-Type: application/json" \
  -d '{"directorId":"x","projectIds":["y"],"title":"test"}'

# Token-based access works
curl -i "$APP_URL/api/reels/$REEL_ID/gallery/download?token=$VALID_TOKEN&preflight=1"
curl -i "$APP_URL/api/reels/$REEL_ID/download-videos?token=$VALID_TOKEN&preflight=1"
curl -i "$APP_URL/api/projects/$PROJECT_ID/download?token=$VALID_TOKEN&preflight=1"

# Invalid token fails when no session
curl -i "$APP_URL/api/reels/$REEL_ID/gallery/download?token=invalid"
```

Expected:

- unauthenticated preview: `401`
- valid token preflight: `200` or `409`
- invalid token w/o session: `401`

## Naming Conventions

- **Files**: kebab-case (`reel-builder.tsx`, `frame-scorer.ts`). Route directories match URL segments.
- **Components**: PascalCase exports (`ReelBuilder`, `SignalFeed`)
- **Utilities/guards**: camelCase named exports (`isTeamRole`, `canViewReel`, `timeAgo`)
- **Prisma**: camelCase fields, UPPERCASE enums (`ReelType`, `Role`, `UpdateType`)
- **URLs**: kebab-case paths (`/my-reels`, `/screening-links`)
- **Env vars**: `UPPER_SNAKE_CASE`. Client-exposed vars use `NEXT_PUBLIC_*` prefix.

## Common Gotchas

- **No test suite** — rely on `lint` + `tsc --noEmit` + `build` + manual smoke tests.
- **No global error boundaries** — some client components catch and silently swallow errors.
- **NextAuth type augmentation** uses `@ts-expect-error` for custom session fields (`role`, `directorId`). The actual types are in `src/types/next-auth.d.ts`.
- **Mux webhook verification is skipped** if `MUX_WEBHOOK_SECRET` env var is unset (dev convenience, logged as warning).
- **Scraper max duration** is 60 seconds (Vercel Pro limit). Source adapters must be fast.
- **`lastActiveAt`** updates are throttled to 5-minute intervals in the JWT callback — don't rely on it for real-time presence.
- **Preview tokens** use `NEXTAUTH_SECRET` for HMAC signing with a 1-hour expiry. Fallback secret exists but should never be used in production.

## Production Incident Triage

When a production issue is reported:

1. Identify endpoint and affected role (`ADMIN`, `PRODUCER`, `REP`, `DIRECTOR`, public token user).
2. Reproduce with `curl` using the exact role/token combination.
3. Check Vercel function logs for `/api/reels/*`, `/api/projects/*/download`, `/api/mux/webhook`, and `/api/cron/scrape-industry`.
4. If issue is auth-related, compare behavior against `docs/API.md` first.
5. Ship smallest safe patch and re-run smoke tests.

## Rollback-Safe Strategy

Prefer rollback-safe patches over schema changes during incidents:

- tighten/relax route guards without data migrations
- keep response shapes stable
- avoid UI restructuring in hotfixes
- do not delete data as part of emergency fixes

If migration is unavoidable, include:

- rollback plan
- backup scope
- post-migration verification query

## Documentation Rule

If any endpoint auth behavior changes, update all three in the same PR:

- `docs/API.md`
- `docs/DEPLOYMENT.md` (smoke tests/checklist)
- `CLAUDE.md` (if guardrails/invariants changed)

If SEO or marketing indexability changes, also update `docs/LEDGER.md` with the decision and commit hash.

If SEO behavior changes (metadata, robots, sitemap, canonical, indexability), update:

- `docs/SEO.md`
- `docs/DEPLOYMENT.md` (post-deploy SEO checks)
- `CLAUDE.md` (if SEO guardrails/invariants changed)

## Marketing site (`/site`)

**Read first:** `docs/LEDGER.md` (June 2026 section) and `docs/marketing/transitions/transition.md`.

### Routes and data

| Route | Purpose |
|-------|---------|
| `/site` | Production homepage — full-screen video splash (`HomeSplash`) |
| `/site/work` | Work archive grid + viewer transitions |
| `/site/directors` | Name-list index with hover preview (`DirectorsList`) |
| `/site/directors/[slug]` | Director portfolio viewer |
| `/site/about`, `/site/contact` | Static editorial pages |
| `/site/youth`, `/site/colossal` | Partner imprint pages (imprint nav hovers) |
| `/site/home/preview*` | Homepage mockup previews — **noindex** |

Canonical brands, directors, spots, thumbnails, and `?play=` ids: `src/lib/marketing/canonical-source.ts`.

### Visual system

- Marketing shell: `src/components/marketing/marketing-chrome.tsx` sets `data-ff-colorway="portfolio-olive"` and `data-ff-home-splash="true"` on `/site` only (footer hidden on splash).
- Tokens and marketing CSS: `src/app/globals.css` (search for `ff-site-theme`, `portfolio-olive`, `ff-home-splash`).
- Reversible colorway: remove the `data-ff-colorway` attribute and the olive token block in CSS.

### Homepage carousel (retained, not on `/site`)

`src/components/marketing/home-spot-carousel.tsx` implements the editorial split carousel (oversized active title, compact `NEXT` list, fixed-height progress indicator). It is **not** mounted on the production homepage after the splash pivot (`49fa40ac`); CSS and component remain for reuse and previews. Slide data: `src/lib/marketing/home-spot-carousel.ts`.

### Card-to-viewer transitions

Friends & Family marketing pages use a custom thumbnail-to-viewer morph. Do not change card click handlers, `view-transition.ts`, featured reel components, or transition CSS without reading the transition doc and running matrix QA:

```bash
npm run marketing:transition-qc
# or against a preview:
node scripts/marketing/run-transition-matrix-qc.mjs --url=http://localhost:3000
```

Locked invariants: one visible hero layer during morph, frozen source rect at click, destination hidden until morph finishes, no scroll during morph, portfolio `?play=` ids only.
