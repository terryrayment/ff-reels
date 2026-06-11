# SEO Policy

Indexability policy for the app at `reels.friendsandfamily.tv`. The legacy Webflow site at `www.friendsandfamily.tv` has its own robots/sitemap and is **not** governed by this repo.

## Indexable routes (allowlist)

Defined in `src/app/sitemap.ts` and allowlisted in `src/app/robots.ts`. These must stay in sync.

- `/site`
- `/site/work`
- `/site/directors`
- `/site/directors/[slug]`
- `/site/about`
- `/site/contact`
- `/commercial-production-company-los-angeles`

## Noindex routes

- **Partner imprints** — `/site/youth`, `/site/colossal`: `robots: { index: false, follow: false }` in page metadata. Excluded from the sitemap. Do not expand indexability unless product explicitly decides to.
- **Previews** — `/site/home/preview*`, `/site/about/preview`, `/site/preview/*`: page-level noindex metadata.
- **Private/auth/tokenized/API routes** — `/dashboard/*`, `/reels/*`, `/s/*`, `/preview/*`, `/api/*`, auth pages: `X-Robots-Tag: noindex, nofollow` headers (via `next.config.mjs`) and/or layout `robots` metadata. `robots.txt` disallows them all.

## Enforcement gotcha

The marketing layout (`src/app/(marketing)/layout.tsx`) defaults all `/site/*` pages to `index, follow`. **Any new non-indexable page under `(marketing)` must override `robots` in its own metadata** — forgetting this is how `/site/youth` and `/site/colossal` shipped indexable in June 2026.

## Audit

```bash
npm run seo:audit                                    # production
npm run seo:audit -- --url=http://localhost:3000     # local
```

`scripts/seo-audit.mjs` asserts: robots.txt allowlist and default disallow, sitemap contains only approved routes, indexable pages serve `index, follow`, imprint/preview pages serve `noindex`, private routes send `X-Robots-Tag: noindex`. Required before merge (see CLAUDE.md); also part of the post-deploy checklist in `docs/DEPLOYMENT.md`.

## Changing SEO behavior

Update in the same PR: this file, `docs/DEPLOYMENT.md` (post-deploy checks), `CLAUDE.md` (if guardrails change), and `docs/LEDGER.md` (decision + commit hash). Keep `scripts/seo-audit.mjs` route lists in sync with `src/app/sitemap.ts` / `src/app/robots.ts`.
