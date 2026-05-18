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
          muted: "var(--ff-color-muted)",
          faint: "var(--ff-color-faint)",
          line: "var(--ff-color-line)",
          "line-soft": "var(--ff-color-line-soft)",
          media: "var(--ff-color-media)",
          signal: "var(--ff-color-signal)",
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
      },
      maxWidth: {
        ff: "var(--ff-container)",
      },
      spacing: {
        "ff-x": "var(--ff-page-x)",
        "ff-nav": "var(--ff-nav-height)",
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
