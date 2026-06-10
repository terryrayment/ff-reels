# Mobile touch-interaction hardening — marketing site (/site)

**Date:** 2026-06-10
**Status:** Approved design, pending implementation
**Scope:** Mobile/touch only. No desktop behavior changes.

## Background

The marketing site (`src/app/(marketing)/site/*`) is desktop-polished but has touch-interaction gaps. The largest: director cards (`src/components/marketing/director-card.tsx`) preview video on hover only, so phone users — likely the majority of traffic — see Talent and the home director grid as static images with no video preview. The site also ships inside the Capacitor app, so touch is not an edge case.

Findings that shaped scope:

- `magnetic.tsx` is already touch-safe (`(hover: hover) and (pointer: fine)` gate at line 21) — no fix needed.
- Clicking a director card while its video plays is an already-shipped desktop path (hover loop + click), covered by the transition matrix QA (92/92 on 2026-06-03). Adding touch previews does not create a new morph code path at click time.
- Work-page `ProjectCard`s have no hover video even on desktop, so they are out of scope — this is parity work, not new creative.

## Goals

1. Director-card video previews work on touch devices via autoplay-in-view.
2. The mobile nav drawer dismisses on backdrop tap.
3. The Work-page filter is verified touch-clean: no sticky `:hover` color after tap.

## Non-goals

- Any change to `src/components/marketing/view-transition.ts` or morph behavior.
- Safe-area-inset work, performance work (srcsets, preload strategy), partner pages (`/site/youth`, `/site/colossal`), swipe gestures.
- Any change to desktop rendering or interaction.

## Design

### 1. Touch card previews (autoplay-in-view, capped)

**New file:** `src/components/marketing/use-touch-card-preview.ts`

```
useTouchCardPreview(frameRef: RefObject<HTMLElement>, hasVideo: boolean): boolean
```

- **Device gate:** active only when `matchMedia("(hover: none)")` matches. Permanently returns `false` when `prefers-reduced-motion: reduce` matches, when `navigator.connection?.saveData` is true, or when `hasVideo` is false. On desktop the hook is a no-op.
- **Visibility:** one IntersectionObserver per card, thresholds `[0, 0.6, 1]`, reporting the card's intersection ratio to a module-level manager.
- **Manager (module singleton):** map of card entry → `{ ratio, setActive }`. On every ratio update it activates the top cards by visibility ratio — **max 2 concurrent, minimum 0.6 ratio** — and deactivates all others. Entries deregister on unmount (including route change). Phones (1-column grid) naturally show 1–2 cards; the cap exists for tablet portrait (2-column at `md`).

**Changes to `director-card.tsx`** (locked-spec canonical module — additive only):

- Call the hook with the existing media-frame ref and `Boolean(muxPlaybackId || sourceVideoUrl)`.
- Render conditions for the Mux player (line 132) and source `<video>` (line 153) become `(hovering || touchPreview)` instead of `hovering`.
- Untouched: `handleClick`, `prepareMarketingCardSourceForTransition` usage, poster resolution (`imageRef.currentSrc`), all `data-marketing-*` attributes, `prefetch`, desktop hover handlers.
- Deactivation unmounts the player — identical lifecycle to mouse-leave today.

**Autoplay-blocked handling (touch path only):** the video layer stays at opacity 0 until the player fires its first `playing` event. If autoplay is rejected (e.g., iOS Low Power Mode), the user keeps seeing the still image — never a frozen or black frame. The desktop fade-in is unchanged. Note for planning: the Mux path fades in via a mount animation, but the source-`<video>` path reveals via `group-hover:opacity-100` / `group-focus-visible:opacity-100` classes (line 155) — the touch branch needs its own opacity state on that element since `group-hover` never fires on touch.

### 2. Nav drawer backdrop dismiss

In `src/components/marketing/nav.tsx`: when the mobile menu is open, render an invisible backdrop element behind the panel; tapping it closes the menu. Escape, the "Close" toggle button, body scroll lock, and `aria-expanded` behavior are unchanged.

### 3. Work-filter touch verification

Verification task, not a planned change: `.ff-filter-link:hover` (globals.css:1441, 1929) is a color change, and no `@media (hover: none)` rule covers it (the block at globals.css:1694 covers `.ff-fluid-card` only). Confirm in mobile emulation that tapping a filter does not leave a sticky hover color; if it does, wrap the hover styles in `@media (hover: hover)`. Fix only if the defect is real.

## Error handling & edge cases

- **Autoplay rejected:** poster remains visible (see above); no retry loop.
- **No video source:** hook disabled; card behavior unchanged.
- **Save-Data / reduced-motion:** previews fully disabled; static images.
- **Tap during preview:** same path as desktop click-during-hover; transition behavior already QA'd.
- **Rapid scrolling:** observer ratio updates churn the manager; activation only flips when the top-2 set changes, and player unmount on deactivate bounds resource use.
- **Route change/unmount:** every card deregisters from the manager; observer disconnected in effect cleanup.

## Verification

1. `npm run lint`, `npx tsc --noEmit`, `npm run build`.
2. **Transition matrix QA (mandatory** — `director-card.tsx` is a canonical module of the locked transition spec): `node scripts/marketing/run-transition-matrix-qc.mjs --url=<preview>`, plus manual spot-checks of Bueno (Talent) and Cadillac Tree Hunting (Work) per `docs/marketing/transitions/transition.md`.
3. **Mobile audit, extended:** add a Talent-page check to `scripts/marketing/run-mobile-site-audit.mjs` under mobile emulation:
   - at least one card preview reaches `playing` while the grid is in view;
   - never more than 2 previews playing simultaneously (assert on phone and 768px tablet viewports);
   - tapping a playing card navigates to `/site/directors/[slug]?play=…` and finishes the morph cleanly.
4. Update `docs/marketing/transitions/transition.md` with a short touch-preview note (it governs `director-card.tsx`).
5. Rollout: Vercel preview deploy → full QA against preview → production → re-run mobile audit against production.

## Decisions log

- Approach chosen: visibility manager + additive touch branch (over per-card observer with no cap, and over unified in-view autoplay for all devices, which would change desktop creative).
- Concurrency cap 2, visibility threshold 0.6 — approved.
- No swipe-to-dismiss for the drawer; backdrop tap only — approved.
- Magnetic touch fix dropped from scope after code verification showed it is already gated.
