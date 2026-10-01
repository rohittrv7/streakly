const {
  THEME_COLORS,
  THEME_FONTS,
  THEME_RADIUS,
} = require("./src/lib/theme/tokens.raw.js");

/** @type {import('tailwindcss').Config} */
module.exports = {
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
        primary: {
          DEFAULT: THEME_COLORS.primary,
          lime: THEME_COLORS.primary,
        },
        secondary: {
          DEFAULT: THEME_COLORS.secondary.coral,
          coral: THEME_COLORS.secondary.coral,
          blue: THEME_COLORS.secondary.softBlue,
          mint: THEME_COLORS.secondary.mint,
        },
        coral: THEME_COLORS.coral,
        softBlue: THEME_COLORS.softBlue,
        mint: THEME_COLORS.mint,
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
