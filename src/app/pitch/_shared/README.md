# Editorial Pitch System

This folder holds the shared design tokens and lightweight component contract for client pitch pages.

The system is based on the Versant pitch direction:

- warm editorial backgrounds instead of sterile white
- deep ink/green as the primary dark surface
- paper-toned panels with hairline borders
- small-radius cards and media
- metadata as quiet slash-separated text
- restrained reveal and hover motion
- large confident section titles with short supporting copy

## Token Entry Point

Use `createEditorialPitchTheme` from `editorial-pitch-tokens.ts` to create CSS variables for a pitch namespace.

```ts
import { createEditorialPitchTheme } from "../_shared/editorial-pitch-tokens";

const CLIENT_THEME = createEditorialPitchTheme({
  namespace: "client",
  colors: {
    bg: "#DDE0D8",
    black: "#09271F",
    orange: "#B19343",
  },
  spacing: {
    sectionY: "56px",
  },
  type: {
    title: "clamp(2.6rem, 5vw, 6rem)",
  },
});
```

The generated variables follow this shape:

```css
--client-bg
--client-black
--client-ink
--client-paper
--client-white
--client-orange
--client-surface
--client-rule
--client-radius-surface
--client-space-section-y
--client-type-title
--client-motion-reveal-duration
```

## Component Contract

Use `createEditorialPitchClasses` and `createEditorialPitchComponents` from `editorial-pitch-system.tsx`.

```tsx
const classes = createEditorialPitchClasses("client");
const { SectionHeader, TagList } = createEditorialPitchComponents(classes);
```

The class contract intentionally stays small:

- section
- container
- header
- kicker
- title
- intro
- reveal
- panel
- card
- media
- metaLabel
- metaText
- link
- tagList
- tag

Future pitch pages should start from these primitives before adding client-specific exceptions.

## Design Rules

- Make typography do more work than boxes.
- Use panels only when the content needs a surface.
- Treat tags as metadata, not badges.
- Keep borders hairline and low contrast.
- Use one accent color sparingly.
- Preserve reduced-motion behavior.
- Avoid dashboard-like chip stacks unless the section is a taxonomy.
