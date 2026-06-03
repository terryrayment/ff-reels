# AGENTS.md

Agent instructions for **ff-reels**. For full project context see `CLAUDE.md`.

## Marketing transitions (mandatory read)

Before editing Talent/Work thumbnail clicks, viewer handoff, or transition CSS:

1. **Read** `docs/marketing/transitions/transition.md` — locked creative direction + technical invariants.
2. **Verify** with matrix QA:

```bash
node scripts/marketing/run-transition-matrix-qc.mjs --url=https://reels.friendsandfamily.tv
```

Key modules: `src/components/marketing/view-transition.ts`, `director-card.tsx`, `project-card.tsx`, `prepare-marketing-card-source.ts`, `src/lib/marketing/play-project-id.ts`, `globals.css` (`.marketing-media-transition-active` rules).

Do not regress: frozen source rect, hidden destination during morph, no mid-morph scroll, single overlay layer.
