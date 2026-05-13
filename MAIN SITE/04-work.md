# Work archive — `/site/work`

## Goal

A flat browsable surface for every recent project across the active roster. The "I just want to see what they've made" page.

## Direction

Canada-leaning means treating this as the **archive** — equal nav weight, dense, project-first. Less curation, more density. Think contact sheet, not gallery.

## Proposed structure

1. **Page label + count.** `WORK` (eyebrow). `200+ projects` or actual count, right-aligned, small.
2. **Optional filter row.** `ALL · COMMERCIALS · MUSIC · FILMS · CASE STUDIES` — driven off `Project.contentType` + `Project.category`. Skip on v1 if filter UX adds drag.
3. **Year navigation (optional).** Right rail with `2026 · 2025 · 2024 · 2023 · ARCHIVE` if we want a Canada-archive feel. Skip on v1.
4. **Grid.** 4 cols desktop / 3 tablet / 2 mobile. 16:9 stills. Dense — small gutters.
5. **Card** — still + `BRAND — Title` + `Director · Year` muted line.
6. **Pagination or infinite scroll.** Default: cap at 80 most-recent in v1 (already implemented). Add `Load more` if needed.

## Copy

This page is intentionally low-copy. The grid is the page.

### Page label

> WORK

### Empty / loading state

> Loading.

(Period included. Single word. Canada energy.)

### Click behaviour

Each project card links to the director's page (`/site/directors/[slug]`). Once we build a project-detail page later, this should link to `/site/work/[id]` instead.

## Open questions

- Do projects deserve **their own detail pages**? Canada doesn't really do project detail — director pages do the heavy lifting. Recommendation: skip dedicated project pages on v1; click goes to director.
- Should the grid be **chronological by year** (Canada) or **scored by some featured flag** (curated)? Default to chronological — it's honest and self-updating.
- **Cap** of 80 — should it be paginated? Probably not until the archive grows past ~200.

## Future: archive view

If we want to take the "archive as equal pillar" lean fully, we could split this into:

- `/site/work` — recent (last 12 months)
- `/site/archive` — everything else

…but that's a v2 decision. Single archive surface is fine on v1.
