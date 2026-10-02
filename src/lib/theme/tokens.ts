// Single source of truth is imported from tokens.raw.js
const raw = require("./tokens.raw.js");

export const THEME_COLORS = raw.THEME_COLORS as {
  background: "#0F0F10";
  surface: "#1A1A1C";
  elevated: "#232326";
  border: "rgba(255, 255, 255, 0.06)";
  primary: "#D4FF3F";
  lime: "#D4FF3F";
  coral: "#FF7A59";
  sky: "#8EA7FF";
  softBlue: "#8EA7FF";
  mint: "#6FE3B0";
  amber: "#FFB800";
  muted: "#8A8A90";
  secondary: {
    coral: "#FF7A59";
    sky: "#8EA7FF";
    softBlue: "#8EA7FF";
    mint: "#6FE3B0";
  };
  text: {
    primary: "#F5F5F0";
    secondary: "#8A8A90";
    muted: "#8A8A90";
  };
};

export const THEME_RADIUS = raw.THEME_RADIUS as {
  cardSm: 20;
  card: 24;
  cardLg: 28;
  pill: 9999;
};

export const THEME_FONTS = raw.THEME_FONTS as {
  regular: "PlusJakartaSans-Regular";
  medium: "PlusJakartaSans-Medium";
  semiBold: "PlusJakartaSans-SemiBold";
  bold: "PlusJakartaSans-Bold";
  extraBold: "PlusJakartaSans-ExtraBold";
};
