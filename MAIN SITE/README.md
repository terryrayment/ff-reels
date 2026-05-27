# MAIN SITE — copy & content drafts

Source-of-truth drafting space for every page on the new marketing site (deployed at `/site/*` for now, eventually `friendsandfamily.tv` root).

## How this works

- One `.md` per page. Edit copy here first. When approved, I lift it into the React components.
- One reference `.md` (`00-voice-and-style.md`) for the overall tone we're chasing.
- One running list (`99-director-one-liners.md`) for the per-director positioning lines.

## Direction

Pulling 50% toward **Canada (canadacanada.com)** — all-caps personality lines, terse declarative copy, archive treated as a peer to the roster, project-first browsing. Original copy in their register, not their words.

## Files

| File | Page on site | Status |
|---|---|---|
| [00-voice-and-style.md](./00-voice-and-style.md) | — (style guide) | draft |
| [01-homepage.md](./01-homepage.md) | `/site` | draft |
| [02-directors-index.md](./02-directors-index.md) | `/site/directors` | draft |
| [03-director-detail.md](./03-director-detail.md) | `/site/directors/[slug]` | draft |
| [04-work.md](./04-work.md) | `/site/work` | draft |
| [05-about.md](./05-about.md) | `/site/about` | draft |
| [06-contact.md](./06-contact.md) | `/site/contact` | draft |
| [07-archive-or-photographers.md](./07-archive-or-photographers.md) | TBD third pillar | open question |
| [99-director-one-liners.md](./99-director-one-liners.md) | per-director copy | draft |

## Workflow

1. Edit a draft `.md` here.
2. Ping me to lift the change into the live component(s).
3. Push → preview auto-updates at `ff-reels-git-feature-marketing-site-terry-rayment.vercel.app`.
4. Once approved, transfer the friendsandfamily.tv domain to Vercel.
