# Contact — `/site/contact`

## Goal

Make it as easy as possible to start a conversation. Two paths: form (for cold inquiries) and direct email (for known relationships).

## Direction

Canada's contact page is almost entirely direct emails — no form, just names and inboxes. FF benefits from a form because cold inquiries do happen and a form captures the brief. But the partners' direct emails should still be the dominant element on the page, not buried.

## Proposed structure

1. **Headline** — one sentence, large.
2. **Left rail** — direct contacts list (name, role, email). Office addresses below.
3. **Right column** — inquiry form (Name, Company/Agency, Email, Project type, Timing, Message → Send).
4. **Confirmation** — replace form on submit with a one-sentence acknowledgement + the partners' emails as a fallback.

(This is already roughly the current implementation — the iteration here is the **copy**.)

## Copy draft

### Headline

> Tell us what you're making.

(Five words. Imperative. No question mark.)

Alternates if that lands wrong:

- "Let's talk about your next project." — the current scaffold version. More conventional.
- "Start a conversation." — vaguer.
- "Send us a brief." — terser, more industry-insidery.

Recommend the first.

### Left rail labels

- `DIRECT` — above the partner list
- `LOS ANGELES` — above the LA address
- `NEW YORK` — above the NY address

### Form labels

All caps, letter-spaced, small (matches the rest of the site).

- `NAME`
- `COMPANY / AGENCY`
- `EMAIL`
- `PROJECT TYPE` (dropdown: Commercial / Branded content / Music video / Short film / Other)
- `TIMING`
- `MESSAGE`

### Send button

> Send inquiry

(Sentence case button label in an otherwise caps-label form is fine — buttons are actions, not labels.)

### Submit confirmation

> Thanks — we'll be in touch.

Followed by:

> For anything urgent, email scott@friendsandfamily.tv.

(Already the implemented copy. Keep.)

## Open questions

- Should the form route to a different inbox depending on `Project type`? E.g. music videos → a specific producer. Probably not on v1 — single inbox, route internally.
- Phone numbers? Old-school but real production people still use them. Default: skip. If a partner wants their direct line listed, add to the rail.
