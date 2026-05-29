import type { CSSProperties } from "react";

export const EDITORIAL_PITCH_COLORS = {
  bg: "#DDE0D8",
  black: "#09271F",
  ink: "#14130F",
  paper: "#F3EEE2",
  white: "#FFFCF4",
  orange: "#B19343",
  lime: "#E8DFCD",
  blue: "#09271F",
  mint: "#E9E0CF",
  gray: "#766F62",
  "soft-gray": "#D8CEBB",
  surface: "#FBF7ED",
  "surface-soft": "#EEE6D7",
  muted: "rgba(20, 19, 15, 0.58)",
  rule: "rgba(20, 19, 15, 0.13)",
  "rule-strong": "rgba(20, 19, 15, 0.28)",
  "light-rule": "rgba(255, 252, 244, 0.16)",
} as const;

export const EDITORIAL_PITCH_RADII = {
  surface: "4px",
  media: "4px",
  chip: "3px",
} as const;

export const EDITORIAL_PITCH_SPACING = {
  sectionY: "50px",
  sectionStudioY: "40px",
  sectionTightY: "20px",
  containerGutter: "clamp(3rem, 10vw, 12rem)",
  headerGap: "clamp(2rem, 6vw, 7rem)",
} as const;

export const EDITORIAL_PITCH_TYPE = {
  title: "clamp(2.45rem, 5.2vw, 5.8rem)",
  intro: "clamp(1rem, 1.4vw, 1.22rem)",
  meta: "0.66rem",
  tag: "0.78rem",
} as const;

export const EDITORIAL_PITCH_MOTION = {
  revealDuration: "680ms",
  hoverDuration: "180ms",
  imageDuration: "520ms",
  easeOut: "cubic-bezier(0.16, 1, 0.3, 1)",
  easeShift: "cubic-bezier(0.2, 0.8, 0.2, 1)",
} as const;

type EditorialPitchColorName = keyof typeof EDITORIAL_PITCH_COLORS;
type EditorialPitchRadiusName = keyof typeof EDITORIAL_PITCH_RADII;
type EditorialPitchSpacingName = keyof typeof EDITORIAL_PITCH_SPACING;
type EditorialPitchTypeName = keyof typeof EDITORIAL_PITCH_TYPE;
type EditorialPitchMotionName = keyof typeof EDITORIAL_PITCH_MOTION;

export type EditorialPitchThemeOptions = {
  namespace?: string;
  colors?: Partial<Record<EditorialPitchColorName, string>>;
  radii?: Partial<Record<EditorialPitchRadiusName, string>>;
  spacing?: Partial<Record<EditorialPitchSpacingName, string>>;
  type?: Partial<Record<EditorialPitchTypeName, string>>;
  motion?: Partial<Record<EditorialPitchMotionName, string>>;
};

function cssVarName(namespace: string, name: string) {
  return `--${namespace}-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
}

export function createEditorialPitchTheme({
  namespace = "pitch",
  colors,
  radii,
  spacing,
  type,
  motion,
}: EditorialPitchThemeOptions = {}) {
  const resolvedColors = { ...EDITORIAL_PITCH_COLORS, ...colors };
  const resolvedRadii = { ...EDITORIAL_PITCH_RADII, ...radii };
  const resolvedSpacing = { ...EDITORIAL_PITCH_SPACING, ...spacing };
  const resolvedType = { ...EDITORIAL_PITCH_TYPE, ...type };
  const resolvedMotion = { ...EDITORIAL_PITCH_MOTION, ...motion };
  const entries = [
    ...Object.entries(resolvedColors).map(([name, value]) => [
      cssVarName(namespace, name),
      value,
    ]),
    ...Object.entries(resolvedRadii).map(([name, value]) => [
      cssVarName(namespace, `radius-${name}`),
      value,
    ]),
    ...Object.entries(resolvedSpacing).map(([name, value]) => [
      cssVarName(namespace, `space-${name}`),
      value,
    ]),
    ...Object.entries(resolvedType).map(([name, value]) => [
      cssVarName(namespace, `type-${name}`),
      value,
    ]),
    ...Object.entries(resolvedMotion).map(([name, value]) => [
      cssVarName(namespace, `motion-${name}`),
      value,
    ]),
  ];

  return Object.fromEntries(entries) as CSSProperties;
}

export const VERSANT_PITCH_THEME = createEditorialPitchTheme({
  namespace: "versant",
});
