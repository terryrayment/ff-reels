# The third pillar — Archive vs. Photographers

## Open question

Canada's nav has three roughly-equal pillars: **Directors / Photographers / Archive**. FF currently has Directors / Work / About / Contact. To get closer to Canada's IA, we'd promote a third creative pillar.

Two candidates:

## Option A — `ARCHIVE`

A dedicated `/site/archive` surface that holds everything older than ~12 months (or off-roster directors' work). The current `/site/work` becomes "recent." Archive becomes its own room.

**Pros**

- Signals depth without needing a giant active roster
- Gives older work a permanent home without crowding the main grid
- Reads as confident: "we've been doing this a while"

**Cons**

- Splits the content model and requires a rule for what's "recent" vs. "archive"
- More navigation chrome to explain

## Option B — `PHOTOGRAPHERS`

A dedicated `/site/photographers` surface (Canada has this; FF's current Webflow site has the section nav-linked but empty). Implies FF represents stills/photo talent as well as directors.

**Pros**

- Concrete capability signal — diversifies the offering
- The existing FF Webflow nav already references this, so customer-facing precedent exists
- Equal nav weight = ambition signal

**Cons**

- Requires actual photographer talent on roster to populate. If empty, removes the section confidently rather than shipping it stub-empty.

## Recommendation

Pick ONE; don't do both on v1. Either is a real lean toward Canada-style IA. The decision driver is **content reality**:

- If FF has (or wants to sign) photo/stills talent → **Photographers**
- If not, and the roster has a meaningful back catalogue → **Archive**
- If neither is true, stay with 4-link nav and revisit later

## If Photographers wins

Mirror the Director model and routes:

- `/site/photographers` (roster grid)
- `/site/photographers/[slug]` (individual page — bio, lookbook, recent commissions)
- New Prisma model `Photographer` with the same shape as `Director` minus the video fields, plus an `images` array

## If Archive wins

Lightweight to ship:

- `/site/archive` page — same component as `/site/work` but filtered to projects older than `now() - 12mo` (or with an explicit `isArchived` flag)
- Update `/site/work` to filter to last 12mo
- Add `ARCHIVE` as the fourth nav link (between Work and About)

## Open questions

- Which option does FF want? (Hard requirement before building.)
- If Photographers — do we have signed photographers, or is this a "plant the flag, fill it in" move? Empty section is worse than no section.
- If Archive — when does "recent" end? 12 months is a clean cut-off; 24 months keeps the recent grid denser.
