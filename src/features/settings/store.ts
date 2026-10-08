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
  is24Hour: boolean;
  isLoaded: boolean;
  setHaptics: (enabled: boolean) => Promise<void>;
  setYearDotsMode: (mode: YearMode) => Promise<void>;
  setYearDotsLayout: (layout: YearLayout) => Promise<void>;
  setIs24Hour: (enabled: boolean) => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  hapticsEnabled: true,
  yearDotsMode: "activity",
  yearDotsLayout: "grid",
  is24Hour: false,
  isLoaded: false,

  setHaptics: async (enabled: boolean) => {
    set({ hapticsEnabled: enabled });
    setGlobalHaptics(enabled);
    try {
      await settingsRepo.set("haptics_enabled", enabled ? "true" : "false");
    } catch {}
  },

  setYearDotsMode: async (mode: YearMode) => {
    set({ yearDotsMode: mode });
    try {
      await settingsRepo.set("year_dots_mode", mode);
    } catch {}
  },

  setYearDotsLayout: async (layout: YearLayout) => {
    set({ yearDotsLayout: layout });
    try {
      await settingsRepo.set("year_dots_layout", layout);
    } catch {}
  },

  setIs24Hour: async (enabled: boolean) => {
    set({ is24Hour: enabled });
    try {
      await settingsRepo.set("use_24_hour_time", enabled ? "true" : "false");
    } catch {}
  },

  loadSettings: async () => {
    try {
      const [hapticsVal, modeVal, layoutVal, time24Val] = await Promise.all([
        settingsRepo.get("haptics_enabled"),
        settingsRepo.get("year_dots_mode"),
        settingsRepo.get("year_dots_layout"),
        settingsRepo.get("use_24_hour_time"),
      ]);
      const enabled = hapticsVal === null ? true : hapticsVal === "true";
      const yearMode: YearMode = modeVal === "time" ? "time" : "activity";
      const yearLayout: YearLayout = layoutVal === "months" ? "months" : "grid";
      const is24Hour = time24Val === "true";

      set({
        hapticsEnabled: enabled,
        yearDotsMode: yearMode,
        yearDotsLayout: yearLayout,
        is24Hour,
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
        is24Hour: false,
        isLoaded: true,
      });
      setGlobalHaptics(true);
    }
  },
}));
