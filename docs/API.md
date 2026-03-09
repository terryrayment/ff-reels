# FF Reels — API Reference

All endpoints live under `/api/`. Authentication uses NextAuth JWT sessions unless noted otherwise.

---

## Table of Contents

- [Authentication](#authentication)
- [Directors](#directors)
- [Projects](#projects)
- [Reels](#reels)
- [Screening Links](#screening-links)
- [Contacts](#contacts)
- [Companies](#companies)
- [Users](#users)
- [Updates](#updates)
- [Industry Credits](#industry-credits)
- [Upload](#upload)
- [Tracking (Public)](#tracking-public)
- [Webhooks](#webhooks)
- [Cron Jobs](#cron-jobs)

---

## Authentication

### `POST /api/auth/[...nextauth]`
NextAuth handler. Supports credentials provider (email + password).

### `POST /api/users/set-password`
**Auth:** Public (token-based)

Set password from invite link.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| token | string | yes | Invite token from email |
| password | string | yes | Min 8 characters |

**Response:** `{ success: true }`

**Errors:** 400 (invalid/expired token, short password)

---

## Directors

### `GET /api/directors`
**Auth:** Any session

List all directors with project and reel counts.

**Response:** Array of directors with `_count: { projects, reels }`, sorted by `sortOrder`.

### `POST /api/directors`
**Auth:** ADMIN

Create a new director. Auto-generates unique slug from name. Creates `DIRECTOR_ADDED` update.

| Field | Type | Required |
|-------|------|----------|
| name | string | yes |
| bio | string | no |
| statement | string | no |
| categories | string[] | no |

**Response:** `201` — Created director

### `GET /api/directors/[id]`
**Auth:** Any session

Get director with projects, reels (with item/link counts), and lookbook items.

### `PATCH /api/directors/[id]`
**Auth:** ADMIN

| Field | Type | Notes |
|-------|------|-------|
| name | string | |
| bio | string | |
| statement | string | |
| categories | string[] | |
| isActive | boolean | |
| sortOrder | number | |
| rosterStatus | string | "ROSTER" or "OFF_ROSTER" |
| heroProjectId | string | Project ID for hero thumbnail |

### `DELETE /api/directors/[id]`
**Auth:** ADMIN

Cascades: deletes all projects, reels, items, screening links, views, and analytics.

### `GET /api/directors/[id]/projects`
**Auth:** Any session

List all projects for a director, ordered by `sortOrder`.

### `POST /api/directors/[id]/projects`
**Auth:** ADMIN or REP

| Field | Type | Required |
|-------|------|----------|
| title | string | yes |
| brand | string | no |
| agency | string | no |
| category | string | no |
| year | number | no |
| description | string | no |
| contextNote | string | no |

**Response:** `201` — Created project

---

## Projects

### `GET /api/projects/[id]`
**Auth:** Any session

Get project with director and frame grabs.

### `PATCH /api/projects/[id]`
**Auth:** ADMIN or REP

| Field | Type |
|-------|------|
| title | string |
| brand | string |
| agency | string |
| category | string |
| year | number |
| description | string |
| contextNote | string |
| isPublished | boolean |
| sortOrder | number |
| thumbnailUrl | string |

### `DELETE /api/projects/[id]`
**Auth:** ADMIN

**Note:** Does not clean up Mux asset or R2 file (known debt).

### `POST /api/projects/[id]/thumbnail`
**Auth:** ADMIN

Generate presigned R2 upload URL for a custom thumbnail.

| Field | Type | Required |
|-------|------|----------|
| filename | string | yes |
| contentType | string | yes |

**Response:** `{ uploadUrl, downloadUrl, r2Key }`

---

## Reels

### `GET /api/reels`
**Auth:** ADMIN or REP

List reels. ADMIN sees all; REP sees only their own (filtered by `createdById`).

**Response:** Array of reels with director, item count, screening link count, and latest view timestamp.

### `POST /api/reels`
**Auth:** ADMIN or REP

Create a reel with projects. Auto-creates a screening link (30-day expiry) and `REEL_CREATED` update.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| directorId | string | yes | |
| title | string | yes | |
| description | string | no | |
| curatorialNote | string | no | Rep's note for the viewer |
| reelType | enum | no | PORTFOLIO, CUSTOM (default), CATEGORY |
| projectIds | string[] | yes | Ordered list |
| brand | string | no | Opportunity brand |
| agencyName | string | no | Opportunity agency |
| campaignName | string | no | Opportunity campaign |
| producer | string | no | Opportunity producer |

**Response:** `201` — Reel with `screeningUrl`

### `GET /api/reels/[id]`
**Auth:** Any session

Get reel with director, items (with projects), and screening links (with view counts).

### `PATCH /api/reels/[id]`
**Auth:** ADMIN or REP

| Field | Type |
|-------|------|
| title | string |
| description | string |
| curatorialNote | string |
| reelType | enum |

### `DELETE /api/reels/[id]`
**Auth:** ADMIN

Cascades: deletes items, screening links, views, spot views, gallery images.

### `PUT /api/reels/[id]/items`
**Auth:** ADMIN or REP

Replace all reel items. Runs in a transaction (delete all → create new).

| Field | Type | Required |
|-------|------|----------|
| projectIds | string[] | yes | In desired sort order |

---

## Screening Links

### `POST /api/reels/[id]/screening-links`
**Auth:** ADMIN or REP

Create a screening link for a reel. Auto-creates or links contact record.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| recipientName | string | no | |
| recipientEmail | string | no | Auto-creates Contact |
| recipientCompany | string | no | Auto-creates Company |
| expiresInDays | number | no | Default: 30 |
| password | string | no | Stored but not enforced |
| contactId | string | no | Link to existing contact |

**Response:** `201` — Screening link with `url`

### Gallery

### `GET /api/reels/[id]/gallery`
**Auth:** Any session

List gallery images with presigned R2 download URLs (1-hour expiry).

**Response:** `{ status, images: [{ id, imageUrl, thumbnailUrl, timeOffset, aiScore, width, height }] }`

### `POST /api/reels/[id]/gallery/generate`
**Auth:** ADMIN or REP

Trigger AI gallery generation. Returns 409 if already generating.

**Response:** `{ status: "ready", imageCount, candidatesScored, projectCount }`

### `GET /api/reels/[id]/gallery/download`
**Auth:** Session OR valid screening token (query param `?token=xxx`)

Download all gallery images as a ZIP file.

---

## Contacts

### `GET /api/contacts`
**Auth:** ADMIN or REP

List all contacts (max 200) with engagement stats.

**Response:** Array of contacts with `company`, `totalViews`, `reelsSent`, `avgCompletion`, `lastActive`, `uniqueDirectors`.

### `POST /api/contacts`
**Auth:** ADMIN or REP

Create or upsert a contact.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | yes | |
| email | string | yes | Unique — upserts if exists |
| companyName | string | no | Auto-creates Company |
| companyId | string | no | Link to existing |
| role | string | no | e.g. "Creative Director" |
| phone | string | no | |
| notes | string | no | |
| tags | string[] | no | |

**Response:** `201` — Contact with company

### `GET /api/contacts/search?q=xxx`
**Auth:** ADMIN or REP

Autocomplete search by name or email. Min 2 characters. Returns max 10 results.

### `GET /api/contacts/[id]`
**Auth:** ADMIN or REP

Contact with company, screening links, and full view history.

### `PATCH /api/contacts/[id]`
**Auth:** ADMIN or REP

| Field | Type |
|-------|------|
| name | string |
| role | string |
| phone | string |
| notes | string |
| tags | string[] |
| companyId | string |
| companyName | string |

### `DELETE /api/contacts/[id]`
**Auth:** ADMIN

Unlinks screening links (sets `contactId = null`) rather than cascading.

---

## Companies

### `GET /api/companies`
**Auth:** ADMIN or REP

List all companies ordered by name, with contact counts.

### `POST /api/companies`
**Auth:** ADMIN or REP

| Field | Type | Required |
|-------|------|----------|
| name | string | yes | Upserts (no-op if exists) |
| type | string | no | "Agency", "Brand", "Production Company" |

---

## Users

### `GET /api/users`
**Auth:** ADMIN

List team members (non-VIEWER roles) with invite status.

**Response:** Array of users with `status` ("active" | "invited"), `inviteExpired`, `inviteExpiresAt`.

### `POST /api/users`
**Auth:** ADMIN

Invite a new team member. Sends email with 7-day invite token.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | yes | |
| email | string | yes | |
| role | enum | yes | ADMIN, PRODUCER, REP |

**Response:** `201` — User with `status`, `invitePending`, `emailSent`, `emailError`

### `PATCH /api/users/[id]`
**Auth:** ADMIN

| Field | Type | Notes |
|-------|------|-------|
| role | enum | ADMIN, PRODUCER, REP. Cannot change own role |

### `DELETE /api/users/[id]`
**Auth:** ADMIN

Cannot delete self.

### `POST /api/users/resend-invite`
**Auth:** ADMIN

| Field | Type | Required |
|-------|------|----------|
| userId | string | yes |

Fails if user already set their password.

---

## Updates

### `GET /api/updates`
**Auth:** Any session

Paginated activity feed. Pinned items first, then by creation date.

| Param | Type | Default | Notes |
|-------|------|---------|-------|
| take | number | 20 | Max 50 |
| cursor | string | — | For pagination |

**Response:** `{ updates, nextCursor }`

### `POST /api/updates`
**Auth:** ADMIN or REP

Post an admin note to the activity feed.

| Field | Type | Required |
|-------|------|----------|
| title | string | yes |
| body | string | no |
| imageUrl | string | no |
| isPinned | boolean | no |
| directorId | string | no |

**Response:** `201` — Update with type `ADMIN_NOTE`

### `PATCH /api/updates/[id]`
**Auth:** Author or ADMIN

| Field | Type |
|-------|------|
| title | string |
| body | string |
| isPinned | boolean |

### `DELETE /api/updates/[id]`
**Auth:** Author or ADMIN

---

## Industry Credits

### `GET /api/industry-credits`
**Auth:** Any session

| Param | Type | Default |
|-------|------|---------|
| take | number | 50 (max 100) |
| skip | number | 0 |
| territory | string | — | Filter: "EAST", "MIDWEST", "WEST" |

**Response:** `{ credits, total }`

### `POST /api/industry-credits`
**Auth:** Any session

Manually add an industry credit. Deduplicates against 30-day window.

| Field | Type | Required |
|-------|------|----------|
| brand | string | yes |
| campaignName | string | no |
| agency | string | no |
| productionCompany | string | no |
| directorName | string | no |
| category | string | no |
| territory | string | no |
| sourceUrl | string | no |
| sourceName | string | no |

---

## Upload

### `POST /api/upload`
**Auth:** ADMIN

Initiate dual upload (Mux + R2) for a new spot.

| Field | Type | Required |
|-------|------|----------|
| directorId | string | yes |
| title | string | yes |
| filename | string | yes |
| contentType | string | yes |
| fileSizeMb | number | no |

**Response:** `{ projectId, muxUploadUrl, muxUploadId, r2UploadUrl }`

Creates project record with `muxStatus: "waiting"` and a `SPOT_ADDED` update.

---

## Tracking (Public)

These endpoints have **no authentication** — they are called from the public screening page.

### `POST /api/tracking/view`
Start a view session. Auto-populates device, geo, IP. Deduplicates same IP within 30 seconds. Detects forwarded screening links.

| Field | Type | Required |
|-------|------|----------|
| screeningLinkId | string | yes |

**Response:** `{ viewId }`

### `POST /api/tracking/spot-view`
Record per-spot engagement. Upserts on `viewId + projectId`.

| Field | Type | Required |
|-------|------|----------|
| viewId | string | yes |
| projectId | string | yes |
| watchDuration | number | no |
| totalDuration | number | no |
| percentWatched | number | no |
| rewatched | boolean | no |
| skipped | boolean | no |

### `POST /api/tracking/view/end`
Close a view session. Sent via `navigator.sendBeacon` (text/plain body).

| Field | Type | Required |
|-------|------|----------|
| viewId | string | yes |
| totalDuration | number | no |

**Note:** Always returns 200 for beacon reliability.

---

## Webhooks

### `POST /api/mux/webhook`
**Auth:** Mux signature verification (`MUX_WEBHOOK_SECRET`)

Handles Mux video processing events:
- `video.asset.ready` → Updates project with `muxPlaybackId`, `duration`, `aspectRatio`
- `video.asset.errored` → Sets `muxStatus = "errored"`

---

## Cron Jobs

### `GET /api/cron/scrape-industry`
**Auth:** `CRON_SECRET` header (Vercel auto-sets for cron jobs). Also accepts Bearer token for manual triggers.

**Schedule:** Daily at 8:00 AM UTC (configured in `vercel.json`)

**Max duration:** 60 seconds

Runs the full industry credit scraper pipeline (10 sources, AI enrichment, deduplication).

**Response:** `{ success, totalScraped, newCredits, duplicatesSkipped, aiEnriched, errors, sourceBreakdown, timestamp }`
