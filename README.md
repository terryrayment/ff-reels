# FF Reels

Director portfolio and video reel management platform for **Friends & Family**, a commercial production company.

FF Reels lets the team manage their director roster, build curated reels for agency opportunities, share screening links with clients, and track detailed viewing analytics — all from a single internal tool.

**Production URL:** [reels.friendsandfamily.tv](https://reels.friendsandfamily.tv)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, React 18, TypeScript) |
| Database | PostgreSQL on [Neon](https://neon.tech) via Prisma ORM |
| Auth | NextAuth (JWT, credentials, role-based) |
| Video | [Mux](https://mux.com) (transcoding, streaming, thumbnails) |
| Storage | Cloudflare R2 (original files, thumbnails, gallery frames) |
| Email | [Resend](https://resend.com) (invites, transactional) |
| AI | OpenAI GPT-4o-mini (frame scoring, credit extraction) + Replicate Real-ESRGAN (upscaling) |
| Mobile | Capacitor (iOS + Android hybrid wrapper) |
| Styling | Tailwind CSS, Framer Motion, Lucide icons |
| Hosting | Vercel (serverless, edge, cron) |

---

## Features

### Director Management
Maintain a roster of directors with bios, artistic statements, categories, awards, press links, client logos, video intros, headshots, lookbook images, and treatment sample PDFs.

### Reel Building
Two builder modes for curating projects into reels:
- **Full Builder** — Drag-drop interface with multi-director support, spot filtering (newest, most-watched, by brand/category), and opportunity metadata (brand, agency, campaign, producer, curatorial note).
- **Quick Builder** — Streamlined 3-step wizard for fast reel creation.

### Video Pipeline
Upload spots through a dual pipeline: files go to Cloudflare R2 (permanent storage) and Mux (transcoding + streaming). Mux webhooks update playback status automatically. Projects store metadata like brand, agency, year, category, and context notes.

### Screening Links
Share reels via tokenized URLs with optional expiration dates, passwords, and recipient tracking. Each link is tied to a contact record for CRM tracking.

### Analytics
Per-view tracking captures:
- **Reel-level:** viewer name/email, device type, city/country (via Vercel geo headers), session duration, forwarding detection.
- **Spot-level:** watch duration, percent watched, rewatched, skipped.
- **Dashboards:** hot leads (3+ views/week), reel leaderboards, director scorecards, weekly/monthly digests.

### Contact CRM
Unified contact database with company extraction from email domains. Tracks screening link history, total views, average completion rate, and hot lead indicators.

### Industry Intelligence
Nightly scraper pulls commercial production credits from 10 industry sources (Muse by Clio, Adweek, SHOTS, SHOOT Online, Ads of the World, Champion Newsletter, LBB, Campaign Brief, Adland, and production company websites). AI enrichment via GPT-4o-mini extracts director, DP, editor, and music company credits. Territory mapping uses a curated database of ~200 US production companies and 40 major agencies.

### AI Gallery
Generate curated still galleries from reels: sample candidate frames from Mux thumbnails, score with GPT-4o-mini vision, upscale with Real-ESRGAN 2x, and store in R2. Downloadable as ZIP.

### Mobile App
Capacitor-based hybrid app for iOS and Android. Loads from the production web server with native haptic feedback, share sheet, and status bar integration.

### Team & Roles
Four access levels:
| Role | Access |
|------|--------|
| **ADMIN** | Full access: directors, upload, reels, analytics, contacts, users, industry |
| **PRODUCER** | Everything except user management |
| **REP** | Build/share reels, view own analytics and contacts |
| **VIEWER** | Screening links only (no dashboard) |

---

## Project Structure

```
ff-reels/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                 # Login + set-password pages
│   │   ├── (dashboard)/            # Protected pages (13 routes)
│   │   │   ├── dashboard/          # Main overview + activity feed
│   │   │   ├── directors/          # Roster management
│   │   │   ├── reels/              # Reel list + detail + builders
│   │   │   ├── contacts/           # CRM contacts
│   │   │   ├── analytics/          # Engagement dashboards
│   │   │   ├── upload/             # Video upload
│   │   │   ├── updates/            # Activity feed management
│   │   │   ├── treatments/         # Treatment sample gallery
│   │   │   ├── industry/           # Industry credit browser
│   │   │   ├── users/              # Team management (admin)
│   │   │   └── about/              # About page
│   │   ├── (screening)/s/[token]/  # Public screening page
│   │   └── api/                    # 30 REST endpoints
│   ├── components/                 # React components by feature
│   │   ├── ui/                     # Button, Input, Modal, Badge, EmptyState
│   │   ├── layout/                 # Sidebar navigation
│   │   ├── video/                  # ScreeningPlayer, ScreeningCarousel, Tracker
│   │   ├── reels/                  # ReelBuilder, QuickReelBuilder, ScreeningLinks
│   │   ├── dashboard/              # SignalFeed, ComposeUpdate, MyActivityToggle
│   │   ├── directors/              # DirectorGrid, DirectorHeader, DirectorSpots
│   │   ├── contacts/               # ContactsTable, ContactAutocomplete
│   │   ├── analytics/              # ReelAnalyticsTable, DateRangePicker
│   │   ├── updates/                # PostUpdateForm
│   │   └── upload/                 # UploadManager
│   ├── lib/                        # Services & utilities
│   │   ├── auth/                   # NextAuth configuration
│   │   ├── db/                     # Prisma client singleton
│   │   ├── mux/                    # Mux API client
│   │   ├── r2/                     # R2 presigned URLs + upload
│   │   ├── email/                  # Resend email service
│   │   ├── gallery/                # AI frame scoring + upscaling
│   │   ├── analytics/              # Device detection, geo, view signals
│   │   ├── scraper/                # Industry credit engine + 10 adapters
│   │   ├── utils.ts                # cn, timeAgo, formatDuration, slugify
│   │   └── native.ts              # Capacitor bridge with web fallbacks
│   └── types/                      # NextAuth type extensions
├── prisma/
│   ├── schema.prisma               # 18 models, 3 enums
│   └── migrations/                 # Migration history
├── scripts/                        # Data migration + utility scripts
├── ios/                            # Capacitor iOS project
├── android/                        # Capacitor Android project
├── public/                         # Static assets (favicon, icons)
└── docs/                           # Extended documentation
    ├── LEDGER.md                   # Decision + evolution history
    ├── ARCHITECTURE.md             # Technical architecture deep dive
    ├── API.md                      # Full API endpoint reference
    ├── DATABASE.md                 # Schema documentation
    └── DEPLOYMENT.md               # Setup, environment, operations
```

---

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL (or a [Neon](https://neon.tech) account)
- Mux account (video streaming)
- Cloudflare R2 bucket (file storage)
- Resend account (email)

### Setup

```bash
# Clone and install
git clone <repo-url> && cd ff-reels
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials (see docs/DEPLOYMENT.md)

# Set up database
npx prisma generate
npx prisma db push        # or: npx prisma migrate deploy

# Create first admin user
npx ts-node scripts/create-admin.ts

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with the admin account.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build for production (runs prisma generate) |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |
| `npm run cap:sync` | Sync Capacitor native projects |
| `npm run cap:ios` | Open iOS project in Xcode |
| `npm run cap:android` | Open Android project in Android Studio |
| `npm run cap:dev` | iOS dev with live reload |

---

## Documentation

| Document | Contents |
|----------|----------|
| [LEDGER.md](docs/LEDGER.md) | Complete decision history, design evolution, and milestone log |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Technical deep dive: services, data flows, patterns |
| [API.md](docs/API.md) | Full REST API reference (30 endpoints) |
| [DATABASE.md](docs/DATABASE.md) | Prisma schema: all 18 models, relations, constraints |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Environment setup, Vercel config, cron jobs, mobile builds |

---

## License

Private. Internal tool for Friends & Family.
