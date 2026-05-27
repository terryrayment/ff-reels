# Director one-liners

The all-caps positioning line that sits above each director's name on the roster card and on their detail page eyebrow.

## Rules

- **Maximum 8 words.** Hard cap.
- **ALL CAPS.** Letter-spaced when rendered.
- **No adjectives unless they earn it.** "Award-winning" doesn't earn it. "Documentarian's eye" can.
- **State the angle, not the compliment.** Not "great with comedy" — describe the *kind* of comedy they make.
- **Two-part construction is fine.** Pattern: `[noun] · [noun]` works. So does `[ARCHETYPE] WITH A [TWIST]`.

## Archetype examples (generic — not attributed)

Use these to calibrate the register before writing real ones:

- COMEDY WITH A STRAIGHT FACE
- NARRATIVE DIRECTOR, FASHION INSTINCTS
- DOCUMENTARIAN TURNED ADMAN
- VISUALIST · WORLD-BUILDER
- PERFORMANCE-LED. KIDS. ANIMALS.
- FORMER PHOTOGRAPHER. STILL IS.
- CLASSICAL TRAINING. NONCONFORMIST OUTPUT.

## Roster — to fill in

Each director needs an angle that's true to *their* work. Don't write these in isolation — open their reel first.

| Director | One-liner (≤ 8 words, ALL CAPS) | Status |
|---|---|---|
| Alan Ferguson | _TODO_ | empty |
| Boma Iluma | _TODO_ | empty |
| Brother Willis | _TODO_ | empty |
| Bueno | _TODO_ | empty |
| Caleb Slain | _TODO_ | empty |
| Jack Turits | _TODO_ | empty |
| Jeanne Vienne | _TODO_ | empty |
| Kelsey Larkin | _TODO_ | empty |
| Le Ged | _TODO_ | empty |
| Leigh Marling | _TODO_ | empty |
| Matt Dilmore | _TODO_ | empty |
| Tarak Karam | _TODO_ | empty |
| Terry Rayment | _TODO_ | empty |

## Workflow

1. Watch the director's reel (or talk to them).
2. Identify the *specific* thing only they do well.
3. Compress to ≤ 8 words. Cut anything generic.
4. Show it to the director — they'll tell you fast if it's wrong.
5. Once approved, put the final string in this table.
6. I lift it into the DB (either a new `positioningLine` field on `Director`, or as the first entry of `categories` so the existing card component picks it up).

## How this renders on the site

**On the roster card:**
```
COMEDY WITH A STRAIGHT FACE   ← one-liner, top of card, muted, tiny caps
[16:10 hover-to-play still]
Bueno                          ← name, large, sentence case
```

**On the detail page eyebrow:**
```
COMEDY WITH A STRAIGHT FACE · LA   ← optional city suffix after one-liner
Bueno                                ← enormous name
```

## Storage decision (open)

Two options for where this lives in the data model:

- **Option A** — reuse `Director.categories[0]` (already wired into the current card). Zero schema change. Limit: categories doesn't naturally fit "long phrase as the first entry."
- **Option B** — add `Director.positioningLine: String?` (new field, one-line schema add + migration). Cleaner, but a Prisma change.

Recommend B once the lines are finalised. Use A as a stop-gap if needed sooner.
