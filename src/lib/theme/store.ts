import { create } from "zustand";
import {
  type AccentKey,
  type AccentDefinition,
  ACCENT_MAP,
  DEFAULT_ACCENT,
} from "./accents";
import { settingsRepo } from "@/features/settings/repo";

interface AccentState {
  accentKey: AccentKey;
  isLoaded: boolean;
  setAccent: (key: AccentKey) => Promise<void>;
  loadAccent: () => Promise<void>;
}

export const useAccentStore = create<AccentState>((set, get) => ({
  accentKey: DEFAULT_ACCENT,
  isLoaded: false,

  setAccent: async (key: AccentKey) => {
    set({ accentKey: key });
    try {
      await settingsRepo.set("accent_color", key);
    } catch {
      // Gracefully ignore persistence errors in transient dev states
    }
  },

  loadAccent: async () => {
    try {
      const saved = await settingsRepo.get("accent_color");
      if (saved && saved in ACCENT_MAP) {
        set({ accentKey: saved as AccentKey, isLoaded: true });
        return;
      }
    } catch {
      // fallback to default
    }
    set({ accentKey: DEFAULT_ACCENT, isLoaded: true });
  },
}));

/**
 * Hook providing the active accent definition and color helpers for JS/SVG/Reanimated.
 */
export function useAccent(): {
  key: AccentKey;
  accent: AccentDefinition;
  hex: string;
  onAccentHex: string;
  softBackground: string;
  rgba: (alpha: number) => string;
  setAccent: (key: AccentKey) => Promise<void>;
} {
  const accentKey = useAccentStore((s) => s.accentKey);
  const setAccent = useAccentStore((s) => s.setAccent);
  const def = ACCENT_MAP[accentKey] || ACCENT_MAP[DEFAULT_ACCENT];

  return {
    key: accentKey,
    accent: def,
    hex: def.hex,
    onAccentHex: def.onAccentHex,
    softBackground: def.softBackground,
    rgba: (alpha: number) => `rgba(${def.rgb[0]}, ${def.rgb[1]}, ${def.rgb[2]}, ${alpha})`,
    setAccent,
  };
}
