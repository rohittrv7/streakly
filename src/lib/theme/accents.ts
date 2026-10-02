export type AccentKey = "lime" | "coral" | "sky" | "mint" | "amber";

export interface AccentDefinition {
  key: AccentKey;
  label: string;
  hex: string;
  rgb: [number, number, number];
  rgbString: string;
  onAccentHex: string; // readable dark text color
  softBackground: string;
  borderHex: string;
}

export const ON_ACCENT_TEXT = "#0F0F10";

export const ACCENT_MAP: Record<AccentKey, AccentDefinition> = {
  lime: {
    key: "lime",
    label: "Electric Lime",
    hex: "#D4FF3F",
    rgb: [212, 255, 63],
    rgbString: "212 255 63",
    onAccentHex: ON_ACCENT_TEXT,
    softBackground: "rgba(212, 255, 63, 0.15)",
    borderHex: "rgba(212, 255, 63, 0.3)",
  },
  coral: {
    key: "coral",
    label: "Sunset Coral",
    hex: "#FF7A59",
    rgb: [255, 122, 89],
    rgbString: "255 122 89",
    onAccentHex: ON_ACCENT_TEXT,
    softBackground: "rgba(255, 122, 89, 0.15)",
    borderHex: "rgba(255, 122, 89, 0.3)",
  },
  sky: {
    key: "sky",
    label: "Soft Sky",
    hex: "#8EA7FF",
    rgb: [142, 167, 255],
    rgbString: "142 167 255",
    onAccentHex: ON_ACCENT_TEXT,
    softBackground: "rgba(142, 167, 255, 0.15)",
    borderHex: "rgba(142, 167, 255, 0.3)",
  },
  mint: {
    key: "mint",
    label: "Fresh Mint",
    hex: "#6FE3B0",
    rgb: [111, 227, 176],
    rgbString: "111 227 176",
    onAccentHex: ON_ACCENT_TEXT,
    softBackground: "rgba(111, 227, 176, 0.15)",
    borderHex: "rgba(111, 227, 176, 0.3)",
  },
  amber: {
    key: "amber",
    label: "Warm Amber",
    hex: "#FFB800",
    rgb: [255, 184, 0],
    rgbString: "255 184 0",
    onAccentHex: ON_ACCENT_TEXT,
    softBackground: "rgba(255, 184, 0, 0.15)",
    borderHex: "rgba(255, 184, 0, 0.3)",
  },
};

export const ACCENT_LIST: AccentDefinition[] = [
  ACCENT_MAP.lime,
  ACCENT_MAP.coral,
  ACCENT_MAP.sky,
  ACCENT_MAP.mint,
  ACCENT_MAP.amber,
];

export const DEFAULT_ACCENT: AccentKey = "lime";
