# Directors roster — `/site/directors`

## Goal

Every active, on-roster director, visible, browsable, and previewable in motion. This page is the product.

## Direction

Canada-leaning means:

- Geographic filter chip row at top: `ALL · LA · NYC` (lightweight, no dropdowns)
- Optional second filter row by category once we have category data dense enough: `COMEDY · DOC · FASHION · MUSIC` — but only if filters change the result meaningfully (skip if not).
- All-caps one-liner sits **above** the name on each card.
- Hover-to-play remains.

## Proposed structure

1. **Page label + count.** `DIRECTORS` (eyebrow). `13 on roster` (right-aligned, small).
2. **Filter row.** `ALL · LA · NYC` (capitalised, dot-separated, single line). Active state = solid underline.
3. **Grid.** 3 cols desktop / 2 tablet / 1 mobile. 16:10 stills, hover plays muted loop.
4. **Card layout** — one-liner (CAPS, tiny) above the name; name large; nothing else on the card.

## Copy

This page has barely any copy. The roster is the message. Only the page label, filter chips, and the count are copy.

### Page label

> DIRECTORS

### Empty state (if no directors match the active filter)

> No directors in this view. Try ALL.

(One short sentence. No apology, no help text.)

## Card example — schematic

```
COMEDY · LA               ← one-liner (caps, muted, ≤8 words)
[16:10 still / hover plays loop]
Bueno                     ← name, large
```

## Open questions

- Should the LA / NYC filter come from a real per-director field, or stay UI-only for now? (We don't yet have a city/region field on the `Director` model — would need a one-line schema add.)
- Do we want a secondary sort? Alpha (default), newest signed, by category? Default to `sortOrder` from the DB so the team controls order.
- Should we surface the count differently? "13" alone is colder than "13 on roster." Canada's energy says the colder version. TBD.
