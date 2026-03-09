# FF Reels — Deployment & Operations

Setup, environment configuration, deployment, cron jobs, mobile builds, and operational procedures.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in all values.

### Database (Required)

```bash
# Neon PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host/ff-reels?sslmode=require"
```

Get this from [Neon Console](https://console.neon.tech) → Project → Connection Details.

### NextAuth (Required)

```bash
# Base URL of the app
NEXTAUTH_URL="http://localhost:3000"  # Production: https://reels.friendsandfamily.tv

# JWT signing secret — generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-random-secret"
```

### Mux — Video Streaming (Required)

```bash
# From Mux Dashboard → Settings → API Access Tokens
MUX_TOKEN_ID="your-mux-token-id"
MUX_TOKEN_SECRET="your-mux-token-secret"

# From Mux Dashboard → Settings → Webhooks
MUX_WEBHOOK_SECRET="your-mux-webhook-secret"
```

**Webhook setup:** In Mux Dashboard, create a webhook pointing to `https://your-domain.com/api/mux/webhook` with events: `video.asset.ready`, `video.asset.errored`.

### Cloudflare R2 — File Storage (Required)

```bash
# From Cloudflare Dashboard → R2 → API Tokens
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret-key"
R2_BUCKET_NAME="ff-reels"
```

**Bucket setup:** Create an R2 bucket named `ff-reels` in your Cloudflare account. No public access needed — the app uses presigned URLs.

### Email — Resend (Required for invites)

```bash
# SMTP settings for Resend
EMAIL_SERVER_HOST="smtp.resend.com"
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER="resend"
EMAIL_SERVER_PASSWORD="re_xxxxxxxxxxxx"
EMAIL_FROM="reels@friendsandfamily.tv"
```

**Domain setup:** Verify your sending domain in [Resend Dashboard](https://resend.com/domains). Until verified, use `onboarding@resend.dev` as `EMAIL_FROM`.

### OpenAI — AI Features (Optional)

```bash
OPENAI_API_KEY="sk-..."
```

Used for: gallery frame scoring (GPT-4o-mini vision), industry credit extraction. Features degrade gracefully without it — gallery generation skips AI scoring, scraper skips AI enrichment.

### Replicate — Image Upscaling (Optional)

```bash
REPLICATE_API_TOKEN="r8_..."
```

Used for: Real-ESRGAN 2x upscaling of gallery frames. Without it, gallery images use original resolution (1920px instead of ~3840px).

### App URL

```bash
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # Production: https://reels.friendsandfamily.tv
```

Used for constructing screening link URLs and invite email links.

### Cron Secret (Production)

```bash
CRON_SECRET="your-cron-secret"
```

Vercel auto-sets this for cron job authentication. For manual scraper triggers, use as Bearer token.

---

## Local Development

### Prerequisites

- **Node.js 20+**
- **npm** (comes with Node.js)
- PostgreSQL database (local or Neon)

### First-Time Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database (or run migrations)
npx prisma db push

# Create your admin account
npx ts-node scripts/create-admin.ts

# Start dev server
npm run dev
```

### Database Management

```bash
# View database in browser
npx prisma studio

# Create a migration after schema changes
npx prisma migrate dev --name describe-your-change

# Deploy migrations to production
npx prisma migrate deploy

# Reset database (destructive!)
npx prisma migrate reset
```

### Useful Scripts

```bash
# Backfill contacts from existing screening links
node scripts/backfill-contacts.mjs --dry-run
node scripts/backfill-contacts.mjs

# Auto-select best hero thumbnails for directors
node scripts/curate-hero-thumbnails.mjs --dry-run
node scripts/curate-hero-thumbnails.mjs

# Test the industry scraper locally
npx ts-node scripts/test-rss-scraper.ts
```

---

## Production Deployment (Vercel)

### Initial Setup

1. **Connect repository** to Vercel
2. **Set environment variables** in Vercel Dashboard → Project → Settings → Environment Variables
3. **Set build command:** `prisma generate && next build` (already in `package.json`)
4. **Set output directory:** `.next` (default)

### Vercel Configuration

`vercel.json` configures the daily cron job:

```json
{
  "crons": [
    {
      "path": "/api/cron/scrape-industry",
      "schedule": "0 8 * * *"
    }
  ]
}
```

This runs the industry scraper at **8:00 AM UTC (3:00 AM EST)** daily.

### Image Optimization

`next.config.mjs` allows remote images from:
- `image.mux.com` — Video thumbnails
- `*.r2.dev` — R2 gallery images
- `cdn.prod.website-files.com` — External CDN

### Post-Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Mux webhook URL updated to production domain
- [ ] Resend domain verified (or using test address)
- [ ] R2 bucket exists and credentials work
- [ ] Database migrations deployed (`npx prisma migrate deploy`)
- [ ] Admin user created
- [ ] Cron job visible in Vercel Dashboard → Cron Jobs
- [ ] Test a screening link from production URL

---

## Mobile App (Capacitor)

The mobile app is a thin native shell that loads the web app from the production URL.

### Configuration

`capacitor.config.ts`:
```
App ID:     tv.friendsandfamily.reels
App Name:   FF Reels
Server:     https://reels.friendsandfamily.tv
```

The app loads the live production server — there is no local bundle. This means mobile updates are instant (no App Store review).

### iOS Build

```bash
# Sync web code to native project
npm run cap:sync

# Open in Xcode
npm run cap:ios

# Build and run (Xcode)
# Product → Run (Cmd+R)
```

**Requirements:** macOS, Xcode 15+, Apple Developer account for distribution.

### Android Build

```bash
npm run cap:sync
npm run cap:android

# Build and run (Android Studio)
```

### Development with Live Reload

```bash
# iOS with hot reload (connects to localhost)
npm run cap:dev
```

This sets `CAPACITOR_SERVER_URL=http://localhost:3000` and runs on a connected iOS device with live reload.

### Native Features

| Feature | Plugin | Behavior |
|---------|--------|----------|
| Haptics | @capacitor/haptics | Impact, notification, selection feedback |
| Share | @capacitor/share | Native share sheet |
| Status Bar | @capacitor/status-bar | Dark text, cream background |
| Splash Screen | @capacitor/splash-screen | 1500ms, cream background, no spinner |

All native features have web fallbacks (silent no-ops) via `src/lib/native.ts`.

---

## Data Migration

### From Wiredrive

The project includes scripts for migrating content from Wiredrive:

1. **Scrape Wiredrive admin page:**
   ```bash
   # Paste scripts/wiredrive-scraper.js into browser console on Wiredrive admin page
   # Downloads manifest.json
   ```

2. **Import from Wiredrive URL:**
   ```bash
   npx ts-node scripts/wiredrive-import.ts --url "https://wiredrive.com/..." --director "Director Name"
   ```

3. **Bulk upload local files:**
   ```bash
   npx ts-node scripts/migrate-wiredrive.ts --dry-run
   npx ts-node scripts/migrate-wiredrive.ts
   ```

4. **Upload missing Mux assets:**
   ```bash
   npx ts-node scripts/mux-bulk-upload.ts --director "Director Name"
   ```

### Backfill Scripts

```bash
# Populate contacts from screening link recipients
node scripts/backfill-contacts.mjs

# Seed industry credits (demo data)
npx ts-node scripts/backfill-industry-credits.ts

# Auto-select hero thumbnails
node scripts/curate-hero-thumbnails.mjs

# Create Signal updates for imported directors
npx ts-node scripts/populate-signal.ts
```

---

## Monitoring & Troubleshooting

### Common Issues

**Neon query timeouts:**
Neon serverless has a ~5-second query timeout. All Prisma queries should have explicit `take` limits. If a page crashes, check for unbounded queries.

**Mux webhook not firing:**
- Verify webhook URL in Mux Dashboard matches production domain
- Check `MUX_WEBHOOK_SECRET` matches between Mux and Vercel env vars
- View webhook delivery logs in Mux Dashboard → Webhooks

**Email invites not sending:**
- Check Resend domain verification status
- Use `onboarding@resend.dev` as `EMAIL_FROM` for testing
- Check Vercel function logs for Resend API errors

**Gallery generation failing:**
- Check `OPENAI_API_KEY` and `REPLICATE_API_TOKEN` are set
- Verify projects have `muxPlaybackId` (video must be processed)
- Check Vercel function logs for timeout (60s max)

**Scraper returning empty results:**
- External sites may have changed their markup
- RSS feeds may be temporarily down
- Check individual adapter with `scripts/test-rss-scraper.ts`

### Vercel Logs

Access function logs at: Vercel Dashboard → Project → Deployments → Functions tab

Key endpoints to monitor:
- `/api/cron/scrape-industry` — daily at 3 AM EST
- `/api/mux/webhook` — on every video upload
- `/api/tracking/view` — on every screening page load

### Database

```bash
# Connect to production database
npx prisma studio

# Check database size
npx prisma db execute --stdin <<< "SELECT pg_size_pretty(pg_database_size(current_database()));"
```

---

## Security Considerations

### Secrets Management
- All secrets in Vercel environment variables (never in code)
- `.env` and `.env*.local` are in `.gitignore`
- Invite tokens expire after 7 days
- JWT sessions expire after 90 days

### Public Endpoints
These endpoints have no authentication:
- `/s/[token]` — Screening page (token-gated)
- `/api/tracking/*` — View tracking (3 endpoints)
- `/api/users/set-password` — Password setup (token-gated)
- `/api/mux/webhook` — Mux events (signature-verified)

### Access Control
- Role checked on every API request via `getServerSession()`
- JWT callback refreshes role from DB on every request
- REP users see only their own reels and analytics
- ADMIN-only: user management, director CRUD, upload, project deletion
