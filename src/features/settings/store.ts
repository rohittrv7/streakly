import { create } from "zustand";
import { settingsRepo } from "./repo";
import { setHapticsEnabled as setGlobalHaptics } from "@/core/utils/haptics";
import { useAccentStore } from "@/lib/theme/store";
import { useLanguageStore } from "@/core/i18n/store";

import type { YearMode, YearLayout } from "@/features/stats/year";

interface SettingsState {
  hapticsEnabled: boolean;
  yearDotsMode: YearMode;
  yearDotsLayout: YearLayout;
  isLoaded: boolean;
  setHaptics: (enabled: boolean) => Promise<void>;
  setYearDotsMode: (mode: YearMode) => Promise<void>;
  setYearDotsLayout: (layout: YearLayout) => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  hapticsEnabled: true,
  yearDotsMode: "activity",
  yearDotsLayout: "grid",
  isLoaded: false,

  setHaptics: async (enabled: boolean) => {
    set({ hapticsEnabled: enabled });
    setGlobalHaptics(enabled);
    try {
      await settingsRepo.set("haptics_enabled", enabled ? "true" : "false");
    } catch {
      // Gracefully ignore
    }
  },

  setYearDotsMode: async (mode: YearMode) => {
    set({ yearDotsMode: mode });
    try {
      await settingsRepo.set("year_dots_mode", mode);
    } catch {
      // Gracefully ignore
    }
  },

  setYearDotsLayout: async (layout: YearLayout) => {
    set({ yearDotsLayout: layout });
    try {
      await settingsRepo.set("year_dots_layout", layout);
    } catch {
      // Gracefully ignore
    }
  },

  loadSettings: async () => {
    try {
      const [hapticsVal, modeVal, layoutVal] = await Promise.all([
        settingsRepo.get("haptics_enabled"),
        settingsRepo.get("year_dots_mode"),
        settingsRepo.get("year_dots_layout"),
      ]);
      const enabled = hapticsVal === null ? true : hapticsVal === "true";
      const yearMode: YearMode = modeVal === "time" ? "time" : "activity";
      const yearLayout: YearLayout = layoutVal === "months" ? "months" : "grid";

      set({
        hapticsEnabled: enabled,
        yearDotsMode: yearMode,
        yearDotsLayout: yearLayout,
        isLoaded: true,
      });
      setGlobalHaptics(enabled);

      await Promise.all([
        useAccentStore.getState().loadAccent(),
        useLanguageStore.getState().loadLanguage(),
      ]);
    } catch {
      set({
        hapticsEnabled: true,
        yearDotsMode: "activity",
        yearDotsLayout: "grid",
        isLoaded: true,
      });
      setGlobalHaptics(true);
    }
  },
}));
