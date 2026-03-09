# FF Reels — Architecture

Technical deep dive into how the system works, how services integrate, and how data flows through the platform.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                  │
│   Browser (Dashboard)    iOS/Android (Capacitor)    Public URL  │
└──────────────┬──────────────────┬──────────────────┬────────────┘
               │                  │                  │
               ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     VERCEL (Edge + Serverless)                  │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  App Router       │  │  API Routes      │  │  Cron Jobs   │  │
│  │  (Server/Client)  │  │  (30 endpoints)  │  │  (daily)     │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘  │
│           │                     │                     │          │
└───────────┼─────────────────────┼─────────────────────┼──────────┘
            │                     │                     │
     ┌──────┼─────────────────────┼─────────────────────┼──────┐
     │      ▼                     ▼                     ▼      │
     │  ┌────────┐  ┌────────┐  ┌────────┐  ┌──────────────┐  │
     │  │  Neon  │  │  Mux   │  │  R2    │  │  External    │  │
     │  │ Postgres│  │ Video  │  │Storage │  │  Services    │  │
     │  │(Prisma)│  │  API   │  │  (S3)  │  │              │  │
     │  └────────┘  └────────┘  └────────┘  │ OpenAI       │  │
     │                                       │ Replicate    │  │
     │                                       │ Resend       │  │
     │                                       │ RSS Feeds    │  │
     │                                       └──────────────┘  │
     └─────────────────────────────────────────────────────────┘
```

---

## Rendering Architecture

### Server Components (Default)
All pages are async Server Components that query Prisma directly. No client-side data fetching library (no SWR, React Query, or tRPC).

```
Page (Server Component)
  → prisma.director.findMany(...)  // Direct DB query
  → <ClientComponent data={directors} />  // Pass to client
```

**Why:** Eliminates loading spinners, reduces client JS bundle, enables parallel data fetching with `Promise.all()`.

### Client Components
Used only when interactivity is required: forms, modals, drag-drop, sorting, filtering. Marked with `"use client"` directive.

**Mutation pattern:**
```
User action → fetch("/api/...", { method: "POST" })
  → API route validates session + role
  → Prisma mutation
  → Response
  → router.refresh()  // Re-runs server components
```

### Page Transitions
`(dashboard)/template.tsx` wraps all dashboard pages in a Framer Motion `AnimatePresence` with fade-in + slide-up animation. Runs on every navigation.

---

## Authentication Flow

```
Login Form → POST /api/auth/[...nextauth]
  → CredentialsProvider.authorize()
    → prisma.user.findUnique({ email })
    → bcrypt.compare(password, passwordHash)
    → Return { id, email, name, role }
  → JWT token created (90-day expiry)
  → Stored in httpOnly cookie
```

**Session access:**
- Server: `getServerSession(authOptions)` → `{ user: { id, role, name, email } }`
- Client: `useSession()` from next-auth/react

**Role refresh:** The JWT callback queries the database on every request to refresh the user's role. This means role changes take effect immediately without re-login.

**Invite flow:**
```
Admin creates user → UUID invite token (7-day expiry)
  → Resend email with /set-password?token=xxx link
  → User sets password → token cleared, passwordHash stored
  → User logs in normally
```

---

## Video Pipeline

### Upload Flow
```
Client: Select file + director + metadata
  → POST /api/upload
    → Mux: Create direct upload URL
    → R2: Create presigned upload URL
    → Prisma: Create Project (muxStatus: "waiting")
    → Return { muxUploadUrl, r2UploadUrl, projectId }
  → Client uploads to both URLs simultaneously
  → Mux processes video asynchronously
```

### Mux Webhook Flow
```
Mux: video.asset.ready
  → POST /api/mux/webhook (signature verified)
  → Find Project by muxAssetId
  → Update: muxPlaybackId, duration, muxStatus = "ready"
  → Update: aspectRatio (from Mux track data)

Mux: video.asset.errored
  → Update: muxStatus = "errored"
```

### Playback
Videos stream via Mux's CDN using `@mux/mux-player-react`. The `muxPlaybackId` is the only value needed — Mux handles adaptive bitrate, thumbnails, and delivery.

### Thumbnail API
Mux provides frame-accurate thumbnails via:
```
https://image.mux.com/{playbackId}/thumbnail.png?time={seconds}&width={pixels}
```
Used for: gallery candidate frames, video thumbnails, reel cover images.

---

## AI Gallery Pipeline

Generates curated still image galleries from reel videos.

```
POST /api/reels/[id]/gallery/generate
  │
  ├─ 1. Fetch reel + projects with video
  ├─ 2. Delete old gallery images (R2 + DB)
  ├─ 3. Build candidate frames
  │     └─ Sample at 2-sec intervals, skip first/last 0.5s
  │     └─ ~15-30 candidates per project
  │
  ├─ 4. Score candidates (GPT-4o-mini vision)
  │     └─ Batch 16 frames per API call
  │     └─ Score 1-10: composition, visual impact, clarity, production value, storytelling
  │     └─ Most frames expected 4-6, 8+ only for exceptional
  │
  ├─ 5. Select best frames
  │     └─ Target: 16 total, min 1 per project, max 4 per project
  │     └─ First pass: top frame from each project (guarantees coverage)
  │     └─ Second pass: fill remaining with highest scores
  │
  ├─ 6. Process selected frames (3 concurrent)
  │     ├─ Fetch hi-res (1920px) from Mux
  │     ├─ Upscale via Real-ESRGAN (2x → ~3840px)
  │     ├─ Upload upscaled + thumbnail to R2
  │     └─ Create ReelGalleryImage record
  │
  └─ 7. Mark reel galleryStatus = "ready"
```

**Costs per gallery:** ~$0.01 AI scoring + ~$0.07 upscaling (16 images) = ~$0.08 total.

---

## Screening & View Tracking

### Screening Page Load
```
GET /s/[token]
  → Validate token, check expiration
  → 9 parallel queries:
    1. Screening link + reel + items + projects
    2. Director(s) data
    3. All director projects (for portfolio stills)
    4. Treatment samples
    5. Frame grabs
    6. Lookbook items
    7. Case studies + short films
    8. Gallery images (with signed R2 URLs)
    9. View history for this link
  → Render ScreeningCarousel
```

### View Tracking Flow
```
Page load → POST /api/tracking/view
  │ Body: { screeningLinkId }
  │ Auto-populated: device (UA parsing), geo (Vercel headers), IP
  │ Dedup: same IP within 30 seconds = same view
  │ Forwarding: different IP from prior views = forwarded flag
  │ Returns: { viewId }
  │
  ├─ Creates ReelView record
  └─ Creates Update (REEL_VIEWED) via signal system (5-min rate limit)

Per-spot engagement → POST /api/tracking/spot-view
  │ Body: { viewId, projectId, watchDuration, totalDuration, percentWatched, rewatched, skipped }
  │ Upserts on viewId + projectId (updates if replayed)
  │
  └─ Creates/updates SpotView record

Page unload → POST /api/tracking/view/end
  │ Sent via navigator.sendBeacon (survives tab close)
  │ Body: { viewId, totalDuration }
  │ Parsed as text/plain (beacon limitation)
  │
  └─ Updates ReelView.endedAt + totalDuration
```

### Engagement Reporting
The ScreeningPlayer reports spot engagement every 15 seconds while a video is playing. On video end or video change, a final report is sent. The ScreeningTracker context provider manages the viewId and provides reporting functions to child components.

---

## Industry Credit Scraper

### Architecture
```
Vercel Cron (8:00 AM UTC daily)
  → GET /api/cron/scrape-industry
    → runNightlyScrape()
      │
      ├─ 10 adapters execute in parallel
      │   ├─ RSS adapters (6): Muse, Adweek, SHOOT, LBB, Campaign Brief, Adland
      │   ├─ HTML scrapers (3): SHOTS, Ads of the World, Champion Newsletter
      │   └─ WordPress API (1): Production company sites (5 companies)
      │
      ├─ Deduplication
      │   └─ Key: brand|campaignName|directorName (lowercase)
      │   └─ Merge strategy: prefer entry with more fields filled
      │
      ├─ AI Enrichment (up to 25 credits)
      │   └─ GPT-4o-mini extracts: director, prodco, agency, brand, DP, editor, music, EP
      │   └─ Batch: 5 concurrent LLM calls
      │   └─ Input: articleText from adapters
      │
      ├─ Data Quality Filters
      │   └─ No HTML fragments
      │   └─ Length validation (brand ≤ 100, campaign ≤ 150, director ≤ 80)
      │   └─ Reject generic entries ("recent work", "latest work")
      │
      ├─ Duplicate Prevention
      │   └─ Check DB for matching brand+campaign+director in last 7 days
      │
      ├─ Territory Resolution
      │   └─ 1. Production company → territory (200 companies)
      │   └─ 2. Agency → territory (40 agencies)
      │   └─ 3. Fallback: null
      │
      └─ Insert IndustryCredit records
```

### Adapter Pattern
Each source implements:
```typescript
interface ScrapedCredit {
  brand?: string
  campaignName?: string
  directorName?: string
  agency?: string
  productionCompany?: string
  category?: string
  territory?: string
  sourceUrl?: string
  sourceName: string
  articleText?: string  // For AI enrichment
}
```

Adapters are isolated — one failing doesn't affect others. Results are merged and deduplicated centrally.

---

## Storage Architecture

### Cloudflare R2 (Object Storage)
```
ff-reels/                         # Bucket
├── uploads/                      # Original video files
│   └─ {directorId}/{filename}
├── thumbnails/                   # Custom project thumbnails
│   └─ {projectId}/{filename}
└── gallery/                      # AI gallery images
    └─ {reelId}/{projectId}/
        ├─ {timeOffset}.png       # Upscaled (3840px)
        └─ {timeOffset}-thumb.jpg # Thumbnail (960px)
```

**Access pattern:**
- Uploads: presigned PUT URL (1-hour expiry) for client-side upload
- Downloads: presigned GET URL (1-hour expiry) for gallery images
- Server uploads: `uploadBuffer()` for gallery frame processing

### Mux (Video Assets)
- Each Project has at most one Mux asset (`muxAssetId` unique)
- Playback via `muxPlaybackId` (public, no auth)
- Thumbnails via Mux Image API (public)
- Upload via Mux direct upload URL (authenticated, single-use)

---

## Component Architecture

### UI Primitives (`src/components/ui/`)
Small, unstyled base components using CVA (Class Variance Authority):
- **Button** — 4 variants (default, ghost, destructive, outline), 3 sizes, loading state
- **Input / Textarea** — Standard form elements with label support
- **Modal** — Dialog overlay with close button and backdrop
- **Badge** — Small colored tag
- **EmptyState** — Placeholder with icon and message

### Feature Components
Organized by domain, not by type:
```
components/
├── reels/           # Everything related to reel building and display
├── directors/       # Director cards, grids, headers
├── contacts/        # Table, autocomplete
├── analytics/       # Charts, tables, date pickers
├── video/           # Player, carousel, tracker
├── dashboard/       # Signal feed, compose, toggle
├── upload/          # Upload manager
└── layout/          # Sidebar
```

### Sidebar Navigation
The sidebar renders different nav items based on role:
- ADMIN: 9 items (Dashboard, Reels, Analytics, Contacts, Directors, Treatments, Industry, Users, Upload)
- PRODUCER: 8 items (same minus Users)
- REP: 6 items (Dashboard, Reels, Analytics, Contacts, Treatments, Industry)
- VIEWER: No sidebar (screening links only)

Mobile: hamburger menu with backdrop blur overlay.

---

## Native Mobile Integration

```
Capacitor App Shell
  └─ WebView loads https://reels.friendsandfamily.tv
  └─ Native bridges (via src/lib/native.ts):
      ├─ Haptics: impact, notification, selection feedback
      ├─ Share: native share sheet → Web Share API → clipboard fallback
      ├─ StatusBar: style (light/dark), background color
      └─ SplashScreen: hide after load
```

**Detection:** `window.Capacitor` check.
**Fallback:** All native calls are try/catch wrapped — web gets silent no-ops.

---

## Security Model

### Authentication Boundaries
- **Public:** `/s/[token]` (screening), `/login`, `/set-password`, tracking APIs, Mux webhook
- **Any session:** GET endpoints for directors, projects, reels, updates, industry credits
- **ADMIN + REP:** Reel CRUD, contact CRUD, screening link creation, company CRUD
- **ADMIN + PRODUCER + REP:** Project creation, director project management
- **ADMIN only:** Upload, user management, director CRUD, project delete

### Webhook Security
Mux webhook verifies signature using `MUX_WEBHOOK_SECRET` before processing events.

### Cron Security
`/api/cron/scrape-industry` validates `CRON_SECRET` header (set by Vercel automatically for cron jobs).

### Data Isolation
- REP users only see their own reels (`createdById` filter)
- Analytics filtered by role — REPs see only their own screening link data
- User management restricted to ADMIN role

---

## Performance Patterns

### Parallel Data Loading
The dashboard runs 13 parallel Prisma queries. The screening page runs 9. Pattern:
```typescript
const [directors, reels, views, ...] = await Promise.all([
  prisma.director.findMany(...),
  prisma.reel.findMany(...),
  prisma.reelView.findMany(...),
])
```

### Query Limits
All queries have explicit `take` limits to prevent Neon serverless timeouts:
- Dashboard: `take: 20` on most queries
- Lists: `take: 100-200`
- Analytics: `take: 50` with cursor pagination

### Beacon API
View end tracking uses `navigator.sendBeacon()` which survives tab/browser close. Body sent as `text/plain` (beacon limitation) and parsed server-side.

### Image Optimization
Next.js `<Image>` configured for remote sources:
- `image.mux.com` (video thumbnails)
- `*.r2.dev` (R2 gallery images)
- `cdn.prod.website-files.com` (external assets)
