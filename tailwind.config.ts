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
      },
      colors: {
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
    },
  },
  plugins: [],
};
export default config;
