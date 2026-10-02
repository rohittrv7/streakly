import { create } from "zustand";
import { settingsRepo } from "./repo";
import { setHapticsEnabled as setGlobalHaptics } from "@/core/utils/haptics";
import { useAccentStore } from "@/lib/theme/store";
import { useLanguageStore } from "@/core/i18n/store";

interface SettingsState {
  hapticsEnabled: boolean;
  isLoaded: boolean;
  setHaptics: (enabled: boolean) => Promise<void>;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  hapticsEnabled: true,
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

  loadSettings: async () => {
    try {
      const hapticsVal = await settingsRepo.get("haptics_enabled");
      const enabled = hapticsVal === null ? true : hapticsVal === "true";
      set({ hapticsEnabled: enabled, isLoaded: true });
      setGlobalHaptics(enabled);

      await Promise.all([
        useAccentStore.getState().loadAccent(),
        useLanguageStore.getState().loadLanguage(),
      ]);
    } catch {
      set({ hapticsEnabled: true, isLoaded: true });
      setGlobalHaptics(true);
    }
  },
}));
