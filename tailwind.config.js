const {
  THEME_COLORS,
  THEME_FONTS,
  THEME_RADIUS,
} = require("./src/lib/theme/tokens.raw.js");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: THEME_COLORS.background,
        surface: THEME_COLORS.surface,
        elevated: THEME_COLORS.elevated,
        border: THEME_COLORS.border,
        accent: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          soft: "var(--color-accent-soft)",
          border: "var(--color-accent-border)",
        },
        primary: {
          DEFAULT: "rgb(var(--color-accent) / <alpha-value>)",
          lime: THEME_COLORS.lime,
        },
        secondary: {
          DEFAULT: THEME_COLORS.secondary.coral,
          coral: THEME_COLORS.secondary.coral,
          blue: THEME_COLORS.secondary.softBlue,
          mint: THEME_COLORS.secondary.mint,
        },
        lime: THEME_COLORS.lime,
        coral: THEME_COLORS.coral,
        sky: THEME_COLORS.sky,
        softBlue: THEME_COLORS.softBlue,
        mint: THEME_COLORS.mint,
        amber: "#FFB800",
        muted: THEME_COLORS.muted,
        text: THEME_COLORS.text,
      },
      fontFamily: {
        sans: [THEME_FONTS.regular],
        medium: [THEME_FONTS.medium],
        semibold: [THEME_FONTS.semiBold],
        bold: [THEME_FONTS.bold],
        extrabold: [THEME_FONTS.extraBold],
      },
      borderRadius: {
        card: `${THEME_RADIUS.card}px`,
        "card-sm": `${THEME_RADIUS.cardSm}px`,
        "card-lg": `${THEME_RADIUS.cardLg}px`,
        pill: `${THEME_RADIUS.pill}px`,
      },
      spacing: {
        screen: "20px",
      },
    },
  },
  plugins: [],
};
