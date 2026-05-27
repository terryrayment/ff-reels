# Director detail — `/site/directors/[slug]`

## Goal

One director, one screen of evidence. Visitor leaves with: the one-line angle, the reel, a clear sense of project density, and proof points (press / awards).

## Proposed structure (top → bottom)

1. **Eyebrow** — `COMEDY · LA` (the one-liner, broken into chips, ALL CAPS, muted)
2. **Director name** — enormous. Light weight, tight tracking, sentence case. This is the headline of the page.
3. **Reel** — 16:9, autoplay muted with controls visible. Falls back to first project still if no `videoIntroUrl`.
4. **Bio** — two-column. Left column: `ABOUT` label only. Right column: bio paragraph(s).
5. **Statement** — optional. Pull-quote treatment. Italic, indented.
6. **Projects** — grouped by `contentType` (Commercials / Case Studies / Films). Within each group, sorted by year descending.
7. **Press / Awards** — two-column. Left: `SELECTED PRESS`, list of links. Right: `AWARDS`, list of strings.
8. **Footer link** — `← All directors`. Quiet.

## Copy

### Eyebrow

The director's `categories[0]` rendered uppercase. If we add a city field, append it: `COMEDY · LA`.

### Section labels

- `ABOUT`
- `SELECTED WORK` (or use group labels `COMMERCIALS` / `FILMS` / `CASE STUDIES` directly without a parent label — cleaner)
- `SELECTED PRESS`
- `AWARDS`

### Statement pull-quote

If a director has a `statement` field populated, render it with a 2px left border and italic. No quote marks.

### Bio body

Use the existing `Director.bio` field. Sentence case, paragraph breaks preserved. No "[Director] is a director who..." opener — strip it if present in the data; that's the kind of throat-clearing the voice guide flags.

## Project card (within a group)

```
[16:10 still]
BRAND — Project title
Agency · 2025
```

- "BRAND — Title" line is sentence case.
- Metadata line is muted, with `·` separators.

## Open questions

- Do we **embed** the Mux player (current behaviour) or **link out** to a fullscreen play page? Canada keeps reels inline; Park Pictures does too. Stay inline.
- Should the director name be **all caps** to match the Canada bio openers? Risky — those are 130px headlines. Caps at that size can read shouty. Default: stay sentence case for the name, caps for the eyebrow and project metadata. Revisit after seeing it.
- **Press links**: some `pressLinks` entries are strings, some are objects. Component handles both. Confirm the data model with the team — do we want to formalise as `{ url, label, publication }`?
