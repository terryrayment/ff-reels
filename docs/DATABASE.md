# FF Reels — Database Schema

PostgreSQL on [Neon](https://neon.tech), managed via Prisma ORM. 18 models, 3 enums.

---

## Entity Relationship Overview

```
User ──────────────┐
  │                │
  │ (createdBy)    │ (author)
  ▼                ▼
Reel            Update
  │                ▲
  │ (items)        │ (auto-created)
  ▼                │
ReelItem ──────► Project ◄──── FrameGrab
  │                │
  │                │ (belongs to)
  │                ▼
  │             Director ◄──── LookbookItem
  │                ◄────────── TreatmentSample
  │
  ▼
ScreeningLink ──► Contact ──► Company
  │
  │ (views)
  ▼
ReelView ──────► SpotView

ReelGalleryImage ──► Reel + Project (dual FK)

IndustryCredit (standalone, populated by scraper)
Account / Session / VerificationToken (NextAuth)
```

---

## Enums

### Role
```
ADMIN      Full access + user management
PRODUCER   Directors, upload, reels, analytics
REP        Build/share reels, own analytics
VIEWER     Screening links only (default)
```

### ReelType
```
PORTFOLIO  General "best of" for a director
CUSTOM     Built for a specific opportunity (default)
CATEGORY   Category-specific (e.g. "food reel")
```

### UpdateType
```
SPOT_ADDED       Auto: new spot uploaded
REEL_CREATED     Auto: new reel built
DIRECTOR_ADDED   Auto: new director added
ADMIN_NOTE       Manual: admin posts a note
REEL_VIEWED      Auto: screening link viewed
```

---

## Models

### User

Authentication and team management.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | CUID | PK | |
| name | String? | | |
| email | String | unique | |
| passwordHash | String? | | bcrypt, null until invite accepted |
| emailVerified | DateTime? | | |
| image | String? | | |
| role | Role | default: VIEWER | |
| inviteToken | String? | unique | UUID, 7-day expiry |
| inviteTokenExpires | DateTime? | | |
| createdAt | DateTime | default: now() | |
| updatedAt | DateTime | auto | |

**Relations:** Account[], Session[], ReelView[], Update[], Reel[]

### Director

Talent profiles with portfolio metadata.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | CUID | PK | |
| name | String | | |
| slug | String | unique | Auto-generated from name |
| bio | String? | @db.Text | |
| statement | String? | @db.Text | Artistic philosophy |
| videoIntroUrl | String? | | Mux playback ID for 60s intro |
| headshotUrl | String? | | |
| websiteUrl | String? | | Personal website |
| categories | String[] | | e.g. ["comedy", "automotive"] |
| awards | Json? | | Structured awards data |
| pressLinks | Json? | | Links to press features |
| clientLogos | String[] | | URLs to client logo images |
| rosterStatus | String | default: "ROSTER" | "ROSTER" or "OFF_ROSTER" |
| heroProjectId | String? | | FK to Project (no constraint) |
| isActive | Boolean | default: true | |
| sortOrder | Int | default: 0 | |
| createdAt | DateTime | default: now() | |
| updatedAt | DateTime | auto | |

**Relations:** Project[], Reel[], LookbookItem[], TreatmentSample[], Update[]

### Project

Individual spots, case studies, and short films.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | CUID | PK | |
| directorId | String | FK → Director | Cascade delete |
| title | String | | |
| brand | String? | | |
| agency | String? | | |
| productionCompany | String? | | |
| category | String? | | e.g. "comedy", "automotive" |
| year | Int? | | |
| description | String? | @db.Text | |
| contextNote | String? | @db.Text | e.g. "2-day shoot, practical effects" |
| contentType | String | default: "SPOT" | SPOT, CASE_STUDY, SHORT_FILM |
| muxAssetId | String? | unique | Mux asset identifier |
| muxPlaybackId | String? | | For streaming playback |
| muxStatus | String? | default: "waiting" | waiting, preparing, ready, errored |
| duration | Float? | | Seconds |
| aspectRatio | String? | | "16:9", "4:3", etc. |
| r2Key | String? | | Key in R2 bucket |
| originalFilename | String? | | |
| fileSizeMb | Float? | | |
| thumbnailUrl | String? | | |
| projectAwards | Json? | | |
| isPublished | Boolean | default: false | |
| sortOrder | Int | default: 0 | |
| createdAt | DateTime | default: now() | |
| updatedAt | DateTime | auto | |

**Relations:** FrameGrab[], ReelItem[], ReelGalleryImage[], Update[]

### Reel

Curated playlists of projects for specific opportunities.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | CUID | PK | |
| directorId | String | FK → Director | Cascade delete |
| title | String | | |
| description | String? | @db.Text | |
| curatorialNote | String? | @db.Text | Rep's note: "Look at humor in spots 2 and 4" |
| brand | String? | | Opportunity brand |
| agencyName | String? | | Opportunity agency |
| campaignName | String? | | Opportunity campaign |
| producer | String? | | Opportunity producer |
| reelType | ReelType | default: CUSTOM | |
| createdById | String? | FK → User | SetNull on delete |
| galleryStatus | String? | | none, generating, ready, failed |
| createdAt | DateTime | default: now() | |
| updatedAt | DateTime | auto | |

**Relations:** ReelItem[], ScreeningLink[], ReelGalleryImage[], User?

### ReelItem

Join table linking projects to reels with sort order.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | CUID | PK | |
| reelId | String | FK → Reel | Cascade delete |
| projectId | String | FK → Project | Cascade delete |
| sortOrder | Int | default: 0 | |

**Unique:** `(reelId, projectId)` — a project can appear in a reel only once.

### ScreeningLink

Shareable, trackable reel links.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | CUID | PK | |
| reelId | String | FK → Reel | Cascade delete |
| token | String | unique, default: cuid() | URL token |
| recipientName | String? | | |
| recipientEmail | String? | | |
| recipientCompany | String? | | Agency name |
| contactId | String? | FK → Contact | SetNull on delete |
| expiresAt | DateTime? | | |
| isActive | Boolean | default: true | |
| password | String? | | Stored but not enforced |
| createdAt | DateTime | default: now() | |
| updatedAt | DateTime | auto | |

**Relations:** ReelView[], Contact?, Reel

### ReelView

Individual view sessions for a screening link.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | CUID | PK | |
| screeningLinkId | String | FK → ScreeningLink | Cascade delete |
| viewerName | String? | | Self-reported at gate |
| viewerEmail | String? | | Self-reported at gate |
| userId | String? | FK → User | Optional |
| viewerIp | String? | | Auto-detected |
| viewerCity | String? | | Vercel geo headers |
| viewerCountry | String? | | Vercel geo headers |
| userAgent | String? | | |
| device | String? | | "desktop", "mobile", "tablet" |
| startedAt | DateTime | default: now() | |
| endedAt | DateTime? | | Set by beacon on page close |
| totalDuration | Float? | | Seconds |
| isForwarded | Boolean | default: false | Different IP from prior views |

**Relations:** SpotView[], ScreeningLink, User?

### SpotView

Per-spot engagement metrics within a view session.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | CUID | PK | |
| reelViewId | String | FK → ReelView | Cascade delete |
| projectId | String | | FK concept (no Prisma relation) |
| watchDuration | Float? | | Seconds |
| totalDuration | Float? | | Spot length |
| percentWatched | Float? | | 0-100 |
| rewatched | Boolean | default: false | |
| skipped | Boolean | default: false | |
| startedAt | DateTime | default: now() | |

### Contact

CRM contact records.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | CUID | PK | |
| name | String | | |
| email | String | unique | |
| companyId | String? | FK → Company | SetNull on delete |
| role | String? | | "Creative Director", "Producer", etc. |
| phone | String? | | |
| notes | String? | @db.Text | |
| tags | String[] | | |
| createdAt | DateTime | default: now() | |
| updatedAt | DateTime | auto | |

**Relations:** ScreeningLink[], Company?

### Company

Agency, brand, or production company records.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | CUID | PK | |
| name | String | unique | |
| type | String? | | "Agency", "Brand", "Production Company" |
| domain | String? | | Extracted from email |
| createdAt | DateTime | default: now() | |
| updatedAt | DateTime | auto | |

**Relations:** Contact[]

### Update

Activity feed entries (auto-generated + manual).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | CUID | PK | |
| type | UpdateType | | |
| title | String | | |
| body | String? | @db.Text | Markdown-friendly |
| imageUrl | String? | | Optional media attachment |
| directorId | String? | FK → Director | SetNull |
| projectId | String? | FK → Project | SetNull |
| authorId | String? | FK → User | SetNull |
| isPinned | Boolean | default: false | |
| createdAt | DateTime | default: now() | |

**Relations:** Director?, Project?, User?

### IndustryCredit

Scraped commercial production credits from industry sources.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | CUID | PK | |
| brand | String | | |
| campaignName | String? | | |
| agency | String? | | |
| productionCompany | String? | | |
| directorName | String? | | |
| category | String? | | e.g. "automotive", "tech" |
| territory | String? | | "EAST", "MIDWEST", "WEST" |
| sourceUrl | String? | | Link to original article |
| sourceName | String? | | e.g. "SHOTS", "Adweek" |
| thumbnailUrl | String? | | |
| publishedAt | DateTime? | | When the work was published |
| scrapedAt | DateTime | default: now() | |
| isVerified | Boolean | default: false | |
| isHidden | Boolean | default: false | |
| dp | String? | | Director of Photography (AI) |
| editor | String? | | (AI-extracted) |
| musicCompany | String? | | (AI-extracted) |
| executiveProducer | String? | | (AI-extracted) |
| isAiExtracted | Boolean | default: false | |
| createdAt | DateTime | default: now() | |

**Indexes:**
- `(brand, campaignName, directorName)` — deduplication lookups
- `(createdAt DESC)` — chronological listing
- `(territory)` — territory filtering

### FrameGrab

Still frames extracted from project videos.

| Column | Type | Constraints |
|--------|------|-------------|
| id | CUID | PK |
| projectId | String | FK → Project, Cascade |
| imageUrl | String | |
| caption | String? | |
| sortOrder | Int | default: 0 |

### LookbookItem

Director inspiration/mood board images.

| Column | Type | Constraints |
|--------|------|-------------|
| id | CUID | PK |
| directorId | String | FK → Director, Cascade |
| imageUrl | String | |
| caption | String? | |
| source | String? | e.g. "Film: Blade Runner 2049" |
| sortOrder | Int | default: 0 |
| createdAt | DateTime | default: now() |

### TreatmentSample

Director treatment PDFs for pitches.

| Column | Type | Constraints |
|--------|------|-------------|
| id | CUID | PK |
| directorId | String | FK → Director, Cascade |
| title | String | |
| brand | String? | |
| previewUrl | String | |
| pageCount | Int? | |
| isRedacted | Boolean | default: false |
| createdAt | DateTime | default: now() |

### ReelGalleryImage

AI-generated gallery images (best frames from reels).

| Column | Type | Constraints |
|--------|------|-------------|
| id | CUID | PK |
| reelId | String | FK → Reel, Cascade |
| projectId | String | FK → Project, Cascade |
| r2Key | String | Key in R2 bucket |
| thumbnailR2Key | String? | |
| timeOffset | Float | Seconds into video |
| aiScore | Float? | GPT-4o-mini score (1-10) |
| width | Int | |
| height | Int | |
| sortOrder | Int | default: 0 |
| createdAt | DateTime | default: now() |

**Index:** `(reelId)`

### Account / Session / VerificationToken

Standard NextAuth tables. See [NextAuth Prisma Adapter docs](https://authjs.dev/getting-started/adapters/prisma).

---

## Cascade Behavior

| Parent | Child | On Delete |
|--------|-------|-----------|
| User | Account, Session | Cascade |
| Director | Project, Reel, LookbookItem, TreatmentSample | Cascade |
| Project | FrameGrab, ReelItem, ReelGalleryImage | Cascade |
| Reel | ReelItem, ScreeningLink, ReelGalleryImage | Cascade |
| ScreeningLink | ReelView | Cascade |
| ReelView | SpotView | Cascade |
| User → Reel | createdBy | SetNull |
| Company → Contact | companyId | SetNull |
| Contact → ScreeningLink | contactId | SetNull |
| Director/Project/User → Update | all FKs | SetNull |

**Implication:** Deleting a Director cascades through Projects → ReelItems → Reels → ScreeningLinks → ReelViews → SpotViews. All analytics for that director are lost.

---

## Unique Constraints

| Model | Column(s) |
|-------|-----------|
| User | email, inviteToken |
| Account | (provider, providerAccountId) |
| Session | sessionToken |
| VerificationToken | token, (identifier, token) |
| Director | slug |
| Project | muxAssetId |
| Company | name |
| Contact | email |
| ScreeningLink | token |
| ReelItem | (reelId, projectId) |

---

## Missing Indexes (Recommended)

These columns are frequently queried but lack explicit indexes:

| Table | Column(s) | Query Pattern |
|-------|-----------|---------------|
| Project | directorId | Director detail page, reel builder |
| Reel | directorId | Director detail page, reel listing |
| Reel | createdById | REP-filtered reel listing |
| ScreeningLink | reelId | Reel detail page |
| ReelView | screeningLinkId | Analytics, view counts |
| ReelView | startedAt | Time-based analytics |
| SpotView | reelViewId | Per-spot analytics |
| Update | createdAt | Activity feed ordering |
