# Mobile Touch Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the marketing site's touch experience first-class: director-card video previews autoplay-in-view on touch devices (capped at 2 concurrent), the mobile nav drawer dismisses on backdrop tap, and the Work filter is verified touch-clean.

**Architecture:** A new `useTouchCardPreview` hook (IntersectionObserver per card + module-level concurrency manager) feeds an additive render branch in `DirectorCard` — desktop hover behavior is byte-for-byte unchanged. Nav gets a tap-to-dismiss backdrop. The mobile QA script gains a touch-preview check.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript strict, Tailwind, @mux/mux-player-react, Playwright (QA script).

**Spec:** `docs/superpowers/specs/2026-06-10-mobile-touch-hardening-design.md`

**Testing note:** This repo has **no unit test suite** (per CLAUDE.md). Verification per task = `npx tsc --noEmit` + `npm run lint`; end-to-end verification = the marketing QA scripts (Task 7). Do not introduce a test framework.

**Locked-spec warning:** `src/components/marketing/director-card.tsx` is a canonical module of the transition spec (`docs/marketing/transitions/transition.md`). Changes must be additive: do NOT touch `handleClick`, `prepareMarketingCardSourceForTransition`, poster resolution, `data-marketing-*` attributes, or `prefetch`.

---

### Task 1: Touch preview hook + concurrency manager

**Files:**
- Create: `src/components/marketing/use-touch-card-preview.ts`

- [ ] **Step 1: Create the hook file**

Full contents of `src/components/marketing/use-touch-card-preview.ts`:

```ts
"use client";

import { useEffect, useRef, useState } from "react";

const MAX_CONCURRENT_PREVIEWS = 2;
const MIN_VISIBLE_RATIO = 0.6;
const OBSERVER_THRESHOLDS = [0, 0.6, 1];

interface PreviewEntry {
  ratio: number;
  setActive: (active: boolean) => void;
}

/** Module-level registry: all mounted touch-preview cards on the page. */
const previewEntries = new Map<symbol, PreviewEntry>();

/** Activate the top cards by visibility ratio, max 2 concurrent, min 60% visible. */
function syncActivePreviews() {
  const ranked = [...previewEntries.entries()]
    .filter(([, entry]) => entry.ratio >= MIN_VISIBLE_RATIO)
    .sort((a, b) => b[1].ratio - a[1].ratio)
    .slice(0, MAX_CONCURRENT_PREVIEWS);
  const activeKeys = new Set(ranked.map(([key]) => key));
  for (const [key, entry] of previewEntries) {
    entry.setActive(activeKeys.has(key));
  }
}

/**
 * Autoplay-in-view preview gate for touch-primary devices.
 * Returns true while this card should play its muted preview loop.
 * Always returns false on hover-capable devices, under
 * prefers-reduced-motion, when Save-Data is on, or when the card
 * has no video source.
 */
export function useTouchCardPreview(
  frameRef: React.RefObject<HTMLElement>,
  hasVideo: boolean,
) {
  const [active, setActive] = useState(false);
  const keyRef = useRef<symbol | null>(null);
  if (keyRef.current === null) {
    keyRef.current = Symbol("touch-card-preview");
  }

  useEffect(() => {
    const element = frameRef.current;
    if (!element || !hasVideo) return;
    if (!window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (connection?.saveData) return;

    const key = keyRef.current as symbol;
    previewEntries.set(key, { ratio: 0, setActive });

    const observer = new IntersectionObserver(
      ([entry]) => {
        const tracked = previewEntries.get(key);
        if (!tracked || !entry) return;
        tracked.ratio = entry.isIntersecting ? entry.intersectionRatio : 0;
        syncActivePreviews();
      },
      { threshold: OBSERVER_THRESHOLDS },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      previewEntries.delete(key);
      setActive(false);
      syncActivePreviews();
    };
  }, [frameRef, hasVideo]);

  return active;
}
```

- [ ] **Step 2: Verify it compiles and lints**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors (warnings unrelated to this file are pre-existing).

- [ ] **Step 3: Commit**

```bash
git add src/components/marketing/use-touch-card-preview.ts
git commit -m "Add touch card preview hook with concurrency manager"
```

---

### Task 2: Wire touch previews into DirectorCard

**Files:**
- Modify: `src/components/marketing/director-card.tsx` (render conditions at lines 132 and 153; state near line 44)

**Do not touch:** `handleClick` (lines 67–90), `prepareMarketingCardSourceForTransition`, `data-marketing-*` attributes, `prefetch`, `onMouseEnter/onMouseLeave/onFocus/onBlur`.

- [ ] **Step 1: Add hook + playing state**

Add import after the `useRevealOnce` import (line 9):

```tsx
import { useTouchCardPreview } from "@/components/marketing/use-touch-card-preview";
```

After `const [mediaRef, mediaVisible] = useRevealOnce<HTMLDivElement>();` (line 48), add:

```tsx
const touchPreview = useTouchCardPreview(
  mediaRef,
  Boolean(muxPlaybackId || sourceVideoUrl),
);
const [previewPlaying, setPreviewPlaying] = useState(false);
const showPreview = hovering || touchPreview;

useEffect(() => {
  if (!showPreview) setPreviewPlaying(false);
}, [showPreview]);
```

- [ ] **Step 2: Update the Mux preview block (line 132)**

Replace the condition `{muxPlaybackId && hovering && (` with `{muxPlaybackId && showPreview && (` and replace the wrapper div + player so the touch path fades in only once the player actually plays (iOS Low Power Mode rejects autoplay — the still must remain visible):

```tsx
{muxPlaybackId && showPreview && (
  <div
    className={`ff-media-fill [&_mux-player]:h-full [&_mux-player]:w-full ${
      hovering
        ? "opacity-0 animate-[fadeIn_300ms_ease-out_forwards]"
        : `transition-opacity duration-300 ease-out ${
            previewPlaying ? "opacity-100" : "opacity-0"
          }`
    }`}
    style={
      {
        "--controls": "none",
        "--media-object-fit": "cover",
      } as React.CSSProperties
    }
  >
    <MuxPlayer
      playbackId={muxPlaybackId}
      streamType="on-demand"
      autoPlay="muted"
      muted
      loop
      playsInline
      nohotkeys
      onPlaying={() => setPreviewPlaying(true)}
    />
  </div>
)}
```

Note the desktop path (`hovering` true) keeps the exact original classes (`opacity-0 animate-[fadeIn…]`); only the touch-only path (`hovering` false, `touchPreview` true) uses the playing-gated opacity.

- [ ] **Step 3: Update the source-video block (line 153)**

Replace `{!muxPlaybackId && sourceVideoUrl && hovering && (` with `showPreview`, and add a playing-gated base opacity (the existing `group-hover:`/`group-focus-visible:` classes never fire on touch):

```tsx
{!muxPlaybackId && sourceVideoUrl && showPreview && (
  <video
    className={`ff-media-fill object-cover transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 ${
      previewPlaying ? "opacity-100" : "opacity-0"
    }`}
    src={sourceVideoUrl}
    muted
    autoPlay
    loop
    playsInline
    preload="none"
    onPlaying={() => setPreviewPlaying(true)}
  />
)}
```

Desktop behavior is preserved: on hover-capable devices `group-hover:opacity-100` reveals it exactly as before (the base `opacity-0` was already there).

- [ ] **Step 4: Verify compile + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 5: Manual smoke in mobile emulation**

Run `npm run dev`, open `http://localhost:3000/site/directors` in Chrome DevTools device mode (iPhone 14 Pro). Expected: cards in view start their muted loop (max 2), scrolled-out cards stop, tapping a playing card navigates with the morph. Switch device mode off, reload: hover behavior identical to production today.

- [ ] **Step 6: Commit**

```bash
git add src/components/marketing/director-card.tsx
git commit -m "Autoplay director card previews in view on touch devices"
```

---

### Task 3: Nav drawer backdrop dismiss

**Files:**
- Modify: `src/components/marketing/nav.tsx` (insert backdrop just before the mobile menu div at line 155)

- [ ] **Step 1: Add the backdrop**

Inside the `<header>`, immediately before `<div id={MOBILE_MENU_ID} …>` (line 155), add:

```tsx
{open && (
  <div
    role="presentation"
    aria-hidden="true"
    onClick={() => setOpen(false)}
    className="fixed inset-0 z-[-1] min-[1180px]:hidden"
  />
)}
```

Why `z-[-1]`: the fixed `z-50` header creates a stacking context, so a negative-z child paints behind the nav row and menu panel but still covers the viewport, catching taps outside the drawer. Escape, the "Close" toggle, body scroll lock, and `aria-expanded` are untouched.

If `npm run lint` flags the click handler (jsx-a11y), swap the div for `<button type="button" tabIndex={-1} aria-hidden="true" …>` with the same classes plus `cursor-default`.

- [ ] **Step 2: Verify compile + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: clean.

- [ ] **Step 3: Manual smoke**

In dev + device mode: open the drawer, tap the dimmed page area below it → drawer closes. Tap menu links → still navigate. Desktop ≥1180px: no behavior change (backdrop is `min-[1180px]:hidden` and only rendered while `open`).

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/nav.tsx
git commit -m "Dismiss mobile nav drawer on backdrop tap"
```

---

### Task 4: Work filter sticky-hover verification (fix only if real)

**Files:**
- Possibly modify: `src/app/globals.css` (`.ff-filter-link:hover` at ~line 1441 and `.ff-site-theme .ff-filter-link:hover` at ~line 1929)

- [ ] **Step 1: Verify in emulation**

In dev + device mode, open `http://localhost:3000/site/work`. Tap each filter (All / Spots / Case Studies / Short Films). Check: after tapping, does a NON-active filter keep the ink/accent hover color (sticky `:hover`)? The active filter is expected to be ink-colored + underlined — that is not the bug.

- [ ] **Step 2 (only if sticky hover observed): Scope hover styles to hover-capable devices**

In `globals.css`, change:

```css
.ff-filter-link:hover,
.ff-filter-link:focus-visible {
  color: var(--ff-color-ink);
}
```

to:

```css
.ff-filter-link:focus-visible {
  color: var(--ff-color-ink);
}

@media (hover: hover) {
  .ff-filter-link:hover {
    color: var(--ff-color-ink);
  }
}
```

And in the `.ff-site-theme` block (~line 1929), move only the `.ff-site-theme .ff-filter-link:hover` selector into an `@media (hover: hover)` block the same way, keeping `:focus-visible` unscoped.

- [ ] **Step 3: Commit (only if changed)**

```bash
git add src/app/globals.css
git commit -m "Scope Work filter hover color to hover-capable devices"
```

If no defect observed, record "verified clean, no change" in the PR notes and skip.

---

### Task 5: Extend mobile audit with touch-preview checks

**Files:**
- Modify: `scripts/marketing/run-mobile-site-audit.mjs` (new function after `testDirectors` ends at line 461; call it in `main()` after line 736)

- [ ] **Step 1: Add the check function**

Insert after `testDirectors` (line 461). Note: Mux renders a `<mux-player>` custom element whose `<video>` lives in shadow DOM — `document.querySelectorAll("video")` will NOT find it, so query `mux-player` elements too (they mirror the media-element API: `.paused`, `.ended`).

```js
// NOTE: running the audit with --reduced-motion will trip the medium-severity
// "no preview reached playing" check by design — the hook disables previews
// under prefers-reduced-motion.
async function testTouchPreviews(page, baseUrl, failures, clickLog) {
  const countPlayingPreviews = () =>
    page.evaluate(() => {
      const media = Array.from(
        document.querySelectorAll(
          "[data-marketing-media-frame] mux-player, [data-marketing-media-frame] video",
        ),
      );
      return media.filter((el) => el.paused === false && el.ended !== true).length;
    });

  await page.goto(`${baseUrl}/site/directors`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
  await page.waitForTimeout(2500);

  const samples = [];
  for (let i = 0; i < 6; i += 1) {
    const playing = await countPlayingPreviews();
    samples.push(playing);
    if (playing > 2) {
      failures.push({
        severity: "high",
        category: "media",
        route: "/site/directors",
        failure: `Touch preview concurrency exceeded: ${playing} playing simultaneously`,
      });
      break;
    }
    await page.evaluate(() => window.scrollBy(0, Math.round(window.innerHeight * 0.8)));
    await page.waitForTimeout(1800);
  }
  clickLog.push({ action: "touch-preview-scan", samples });

  if (!samples.some((count) => count > 0)) {
    failures.push({
      severity: "medium",
      category: "media",
      route: "/site/directors",
      failure: "No director card preview reached playing state during scroll scan",
    });
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(2000);
  const firstCard = page.locator("a.ff-fluid-card").first();
  if ((await firstCard.count()) > 0) {
    await firstCard.click({ timeout: 15000 });
    await page.waitForTimeout(3000);
    clickLog.push({ action: "touch-preview-tap-through", url: page.url() });
    if (!/\/site\/directors\/[^/?]+/.test(page.url())) {
      failures.push({
        severity: "high",
        category: "interaction",
        route: "/site/directors",
        failure: `Tap on director card did not navigate (landed on ${page.url()})`,
      });
    }
    const strandedOverlays = await page
      .locator(".marketing-media-transition")
      .count();
    if (strandedOverlays > 0) {
      failures.push({
        severity: "high",
        category: "interaction",
        route: "/site/directors",
        failure: `Morph overlay left in DOM after tap-through (${strandedOverlays})`,
      });
    }
  }

  // Tablet portrait (2-column grid) — the cap exists for this case.
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto(`${baseUrl}/site/directors`, { waitUntil: PAGE_LOAD, timeout: PAGE_TIMEOUT });
  await page.waitForTimeout(2500);
  const tabletPlaying = await countPlayingPreviews();
  clickLog.push({ action: "touch-preview-tablet-scan", playing: tabletPlaying });
  if (tabletPlaying > 2) {
    failures.push({
      severity: "high",
      category: "media",
      route: "/site/directors",
      failure: `Tablet touch preview concurrency exceeded: ${tabletPlaying} playing`,
    });
  }

  // Restore phone viewport for the checks that run after this one.
  await page.setViewportSize({ width: 390, height: 844 });
}
```

- [ ] **Step 2: Call it in main()**

After `await testDirectors(...)` (line 736), add:

```js
await testTouchPreviews(page, baseUrl, failures, clickLog);
```

(Before `testDirectorPlayCases`. The function unconditionally resets the viewport to 390x844 at its end so later checks run at the phone viewport.)

- [ ] **Step 3: Syntax check**

Run: `node --check scripts/marketing/run-mobile-site-audit.mjs`
Expected: no output (valid).

- [ ] **Step 4: Run against local dev**

With `npm run dev` running:

```bash
node scripts/marketing/run-mobile-site-audit.mjs --url=http://localhost:3000 --skip-screenshots
```

Expected: report JSON with `"pass": true`; `touch-preview-scan` samples show ≥1 and ≤2 playing; no new high-severity failures.

- [ ] **Step 5: Commit**

```bash
git add scripts/marketing/run-mobile-site-audit.mjs
git commit -m "Add touch preview concurrency checks to mobile audit"
```

---

### Task 6: Document touch previews in the transition spec doc

**Files:**
- Modify: `docs/marketing/transitions/transition.md`

- [ ] **Step 1: Add a note**

In the "User-facing surfaces" section (after the table + `?play=` paragraph), add:

```markdown
### Touch preview behavior (2026-06-10)

On touch-primary devices (`hover: none`), `DirectorCard` autoplays its muted
preview loop while ≥60% in view, capped at 2 concurrent cards
(`src/components/marketing/use-touch-card-preview.ts`). The click/morph path is
unchanged — tapping a playing card is the same code path as desktop's
click-during-hover. Previews are disabled under `prefers-reduced-motion` and
Save-Data. The video layer stays at opacity 0 until the first `playing` event,
so blocked autoplay (iOS Low Power Mode) leaves the still image visible.
```

- [ ] **Step 2: Commit**

```bash
git add docs/marketing/transitions/transition.md
git commit -m "Document touch preview behavior in transition spec"
```

---

### Task 7: Full verification & rollout

- [ ] **Step 1: Required local checks (CLAUDE.md)**

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Expected: all pass.

- [ ] **Step 2: Transition matrix QA against local dev** (mandatory — `director-card.tsx` is a locked-spec module)

With `npm run dev` running:

```bash
node scripts/marketing/run-transition-matrix-qc.mjs --url=http://localhost:3000
```

Expected: all cards pass (production baseline was 92/92). Manually spot-check **Bueno** (Talent) and **Cadillac Tree Hunting** (Work) per `docs/marketing/transitions/transition.md` — no duplicate frames mid-morph.

- [ ] **Step 3: Mobile audit against local dev**

```bash
node scripts/marketing/run-mobile-site-audit.mjs --url=http://localhost:3000 --skip-screenshots
```

Expected: `"pass": true`.

- [ ] **Step 4: Preview deploy + re-run both QA scripts against the preview URL**

Push the branch, let Vercel build a preview, then re-run Steps 2–3 with `--url=<preview-url>`. Expected: same green results.

- [ ] **Step 5: Production + post-deploy audit**

After merge/deploy, re-run the mobile audit against `https://reels.friendsandfamily.tv`. Call out in PR notes any skipped check (per CLAUDE.md). The `npm run seo:audit -- --url=https://www.friendsandfamily.tv` check is not affected by this change set (no SEO/meta/robots changes) — note that in the PR.
