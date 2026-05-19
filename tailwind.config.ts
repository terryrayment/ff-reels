import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        helveticaDisplay: [
          "var(--font-inter)",
          "Helvetica Neue",
          "Helvetica",
          "Hanken Grotesk",
          "Arial",
          "sans-serif",
        ],
        helveticaText: [
          "var(--font-inter)",
          "Helvetica Neue",
          "Helvetica",
          "Hanken Grotesk",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        ff: {
          paper: "var(--ff-color-paper)",
          "paper-soft": "var(--ff-color-paper-soft)",
          ink: "var(--ff-color-ink)",
          copy: "var(--ff-color-body)",
          muted: "var(--ff-color-muted)",
          faint: "var(--ff-color-faint)",
          line: "var(--ff-color-line)",
          "line-soft": "var(--ff-color-line-soft)",
          media: "var(--ff-color-media)",
          "media-soft": "var(--ff-color-media-soft)",
          signal: "var(--ff-color-signal)",
          partner: {
            bg: "rgb(var(--ff-rgb-partner-bg) / <alpha-value>)",
            fg: "var(--ff-color-partner-fg)",
            line: "var(--ff-color-partner-line)",
            muted: "var(--ff-color-partner-muted)",
          },
        },
        cream: {
          DEFAULT: "#F7F6F3",
          dark: "#EEEDEA",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          raised: "#FAFAF8",
          overlay: "#FFFFFF",
        },
      },
      letterSpacing: {
        "tight-2": "-0.02em",
        "tight-3": "-0.03em",
        "ff-label": "var(--ff-track-label)",
        "ff-micro": "var(--ff-track-micro)",
        "ff-wide": "var(--ff-track-wide)",
        "ff-nav": "var(--ff-track-nav)",
      },
      fontSize: {
        "ff-hero": ["var(--ff-type-hero)", { lineHeight: "var(--ff-leading-display)" }],
        "ff-page": ["var(--ff-type-page)", { lineHeight: "var(--ff-leading-display)" }],
        "ff-director": [
          "var(--ff-type-director)",
          { lineHeight: "var(--ff-leading-display)" },
        ],
        "ff-section": ["var(--ff-type-section)", { lineHeight: "1" }],
        "ff-feature": ["var(--ff-type-feature)", { lineHeight: "1.02" }],
        "ff-card": ["var(--ff-type-card)", { lineHeight: "1" }],
        "ff-lede": ["var(--ff-type-lede)", { lineHeight: "var(--ff-leading-tight)" }],
        "ff-body": ["var(--ff-type-body)", { lineHeight: "var(--ff-leading-body)" }],
        "ff-small": ["var(--ff-type-small)", { lineHeight: "var(--ff-leading-body)" }],
        "ff-footer": ["var(--ff-type-footer)", { lineHeight: "var(--ff-leading-body)" }],
        "ff-meta": ["var(--ff-type-meta)", { lineHeight: "1.25" }],
        "ff-form": ["var(--ff-type-form)", { lineHeight: "1.4" }],
        "ff-label": ["var(--ff-type-label)", { lineHeight: "1" }],
        "ff-micro": ["var(--ff-type-micro)", { lineHeight: "1" }],
        "ff-nav-drawer": ["var(--ff-type-nav-drawer)", { lineHeight: "1" }],
      },
      maxWidth: {
        ff: "var(--ff-container)",
      },
      spacing: {
        "ff-x": "var(--ff-page-x)",
        "ff-nav": "var(--ff-nav-height)",
        "ff-section": "var(--ff-space-section-y)",
        "ff-section-lg": "var(--ff-space-section-y-lg)",
        "ff-page-top": "var(--ff-space-page-top)",
        "ff-page-bottom": "var(--ff-space-page-bottom)",
        "ff-grid-x": "var(--ff-grid-gap-x)",
        "ff-grid-y": "var(--ff-grid-gap-y)",
      },
      transitionTimingFunction: {
        ff: "var(--ff-ease-primary)",
        "ff-out": "var(--ff-ease-out)",
      },
    },
  },
  plugins: [],
};
export default config;
