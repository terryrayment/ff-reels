# Marketing site — thumbnail-to-viewer transitions

**Status:** Locked creative + technical spec (2026-06-03)  
**Production URL:** `https://reels.friendsandfamily.tv`  
**Scope:** Every thumbnail on **Talent** (`/site/directors`) and **Work** (`/site/work`) that navigates to a director viewer.

Read this before changing transition behavior, card click handlers, viewer layout, or related CSS.

---

## Creative direction

### What the user should feel

1. **Click a thumbnail** on Talent or Work.
2. **That exact frame fluidly morphs** into the hero viewer on the director page (scale + position, ~1.3s ease).
3. **Video starts playing** shortly after the morph lands (muted autoplay in viewer).
4. **Everything else fades in** after the morph: director name (when morph is safe), bio, gallery, captions — not competing with the hero handoff.

### Non‑negotiables

| Rule | Why |
|------|-----|
| **One visible hero layer during morph** | Never show overlay + destination poster/video at the same time (causes “stacked duplicate frames”, e.g. Bueno bug). |
| **Morph only with valid geometry** | If source or destination rect is missing/invalid, **poster fade at source** — never a broken fly-off morph. |
| **Name morph only when safe** | Card `h3` → page `h1` only if width/travel ratios pass; otherwise **opacity fade at source**. |
| **No scroll during morph** | Page scroll mid-morph desyncs fixed overlay from destination target. |
| **Reduced motion** | `prefers-reduced-motion: reduce` → instant navigation, no overlays. |

### Explicitly out of scope (unless requested)

- Full-site transition audit (About, Youth, homepage sections beyond director/work cards).
- Mobile nav patterns not using `DirectorCard` / `ProjectCard`.
- Rewriting the canonical Webflow ingest — only how cards link into the viewer.

---

## User-facing surfaces

| Page | Route | Card component | Destination |
|------|-------|----------------|-------------|
| Talent | `/site/directors` | `DirectorCard` | `/site/directors/[slug]?play=…` |
| Work | `/site/work` | `ProjectCard` | `/site/directors/[slug]?play=…` |
| Home (selected work grid) | `/site` | Both | Same as above |

Every card that opens a director viewer must pass a **portfolio `play` id** (not a work-archive id) so the destination renders `[data-marketing-featured-media-target]`.

---

## Technical architecture

### Canonical modules (do not fork)

| File | Role |
|------|------|
| `src/components/marketing/view-transition.ts` | Orchestrator: session timing, overlay morph, name morph, guards, `router.push` |
| `src/components/marketing/prepare-marketing-card-source.ts` | Pre-click: scroll into view, `is-visible`, wait for image load |
| `src/lib/marketing/play-project-id.ts` | Resolve `?play=` portfolio id from work archive rows |
| `src/components/marketing/director-card.tsx` | Talent card click → transition |
| `src/components/marketing/project-card.tsx` | Work card click → transition |
| `src/components/marketing/featured-reel.tsx` | Mux viewer destination + delayed autoplay |
| `src/components/marketing/source-video-reel.tsx` | Source MP4 viewer destination + delayed autoplay |
| `src/components/marketing/use-transition-poster.ts` | Session poster handoff for destination |
| `src/app/globals.css` | `.marketing-media-transition-active` hide rules + reveal fades |

### DOM contracts

**Source (card):**

- `[data-marketing-media-frame]` — morph source rect
- `[data-marketing-director-name-source]` — optional name morph (Talent cards only)

**Destination (director detail):**

- `[data-marketing-featured-media-target]` — morph target rect; hosts poster + video
- `[data-marketing-poster-layer]` — poster image inside target
- `[data-marketing-director-name-target="{slug}"]` — name morph target
- `[data-marketing-transition-reveal]` — blocks that fade in after morph (bio, gallery, captions)

**Runtime classes / events:**

- `html.marketing-media-transition-active` — morph in progress
- `.marketing-media-transition` — fixed overlay clone of thumbnail
- `.marketing-director-name-transition` — fixed name overlay
- `ff:marketing-route-transition-finished` — morph complete; releases autoplay + optional scroll

### Session storage keys

| Key | Purpose |
|-----|---------|
| `ff:marketing-transition-until` | Delay viewer autoplay until morph completes |
| `ff:marketing-transition-poster` | Poster URL for destination handoff |
| `ff:marketing-scroll-viewer` | Scroll to viewer **only** after morph (same-page gallery switches) |

### Timing constants (`view-transition.ts`)

| Constant | Value | Notes |
|----------|-------|-------|
| `TRANSITION_DURATION_MS` | 1320 | Full morph duration after destination ready |
| `TRANSITION_EASING` | `cubic-bezier(0.76, 0, 0.24, 1)` | Hero ease |
| `SOURCE_MEDIA_READY_TIMEOUT_MS` | 1800 | Bail to plain nav if card image never loads |
| `DESTINATION_TARGET_TIMEOUT_MS` | 1500 | Wait for featured target in DOM |
| `DESTINATION_HANDOFF_TIMEOUT_MS` | 1400 | Wait for poster/`data-marketing-media-ready` |
| `PLAY_AFTER_LAND_DELAY_MS` | 280 | Extra beat before `play()` in reel components |

### Morph algorithm (media)

1. `prepareMarketingCardSourceForTransition` — stable source rect + loaded image.
2. **Freeze source `DOMRect` at click** — never re-measure source after `router.push` (detached nodes → zero rect → broken morph).
3. Append fixed overlay with poster clone; opacity 0 until destination ready.
4. `router.push(href)` while `marketing-media-transition-active` on `<html>`.
5. Poll for `[data-marketing-featured-media-target]` + handoff ready.
6. Animate overlay transform to frozen destination rect (full 1320ms).
7. Fade overlay out → remove → dispatch `MARKETING_TRANSITION_FINISHED` → destination visible → video autoplay.

### Morph algorithm (director name — Talent only)

1. Clone card name to fixed overlay.
2. Wait for `[data-marketing-director-name-target]`.
3. If `isSafeNameMorphPath` (max width ratio 2.4×, max travel 55% viewport) → transform morph.
4. Else → opacity fade at source (no position fly-off).

### CSS invariants (`globals.css`)

During `marketing-media-transition-active`:

```css
html { overflow: hidden; }  /* no scroll during morph */
[data-marketing-featured-media-target] { opacity: 0 !important; visibility: hidden; }
[data-marketing-transition-reveal] { opacity: 0; transform: translateY(14px); }
```

Destination poster/video must **not** be visible until the active class is removed.

### Play ID resolution

- **Talent grid:** first portfolio project with mux / sourceVideo / thumbnail → `getHeroPlayProjectId`.
- **Work grid:** `getDirectorPortfolioPlayId` matches brand+title to portfolio row (work-archive ids are not valid `?play=` values).

---

## Change checklist

Before merging any transition PR:

1. Read this doc end-to-end.
2. Run matrix QA (below) against production or preview.
3. Manually spot-check **Bueno** (Talent) and **Cadillac Tree Hunting** (Work) — historical failure cases.
4. Confirm no duplicate frames mid-morph (overlay + destination both visible).
5. Confirm `npx tsc --noEmit` and `npm run lint` pass.

---

## Matrix QA (every Talent + Work thumbnail)

```bash
node scripts/marketing/run-transition-matrix-qc.mjs \
  --url=https://reels.friendsandfamily.tv
```

Optional: `--headed` for visual debugging. Report JSON written under `test-results/transition-matrix-qc/`.

**Pass criteria per card:**

- Navigates to `/site/directors/{slug}` with valid `?play=` when viewer exists.
- While `marketing-media-transition-active`: destination target is hidden; at most one `.marketing-media-transition` overlay.
- After finish: `[data-marketing-featured-media-target]` present; `data-marketing-media-ready` is `poster` or `video`; autoplay `playing` or `blocked` (not stuck on `loading` forever).
- No `.marketing-media-transition` left in DOM.

**Latest production matrix (2026-06-03):** 92/92 passed (13 Talent + 79 Work) at `71ddc56`+ on `https://reels.friendsandfamily.tv`. Report: `test-results/transition-matrix-qc/2026-06-03T23-15-34-080Z/report.json` (local artifact, not committed).

---

## Desktop functionality QA (full marketing site)

```bash
npm run marketing:desktop-qc
```

Optional flags (pass through to the script): `--headed` for visual debugging; `--quick` for layout, nav, filters, and meta routes only (~2 min, skips bulk Work/Talent card clicks).

Report JSON and screenshots under `test-results/desktop-functionality-audit/[timestamp]/` (gitignored — do not commit).

**Pass criteria:** `summary.json` has `"pass": true` and `"criticalFailures": 0`. Complements transition matrix QA with multi-viewport layout, nav, Work filter, gallery-switch, link crawl, and keyboard smoke checks on production.

---

## Incident history (do not regress)

| Date | Symptom | Root cause | Fix commit |
|------|---------|------------|------------|
| 2026-06 | Work card morph to wrong/empty handoff | Overlay visible before destination ready | `9f6cf99` |
| 2026-06 | Caleb name flies off screen | Unsafe h3→h1 layout morph | `21cdb8e` |
| 2026-06 | Morph flashes/instant | Re-measured source rect after navigation | `84b7ef8` |
| 2026-06 | Bueno stacked duplicate frames | Destination poster visible during morph + scroll mid-morph | `71ddc56` |

---

## Related docs

- Marketing canonical data: `src/lib/marketing/canonical-source.ts`
- Marketing layout: `src/app/(marketing)/`
