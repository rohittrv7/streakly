import { create } from "zustand";
import { type Language } from "./types";
import { settingsRepo } from "@/features/settings/repo";
import { requestNotificationReconcile } from "@/lib/notifications/reconcile";

interface LanguageState {
  language: Language;
  isLoaded: boolean;
  setLanguage: (lang: Language) => Promise<void>;
  loadLanguage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: "en",
  isLoaded: false,

  setLanguage: async (lang: Language) => {
    set({ language: lang });
    try {
      await settingsRepo.set("app_language", lang);
      // Trigger notification rewrite in the new language
      requestNotificationReconcile(150);
    } catch {
      // Gracefully ignore persistence errors
    }
  },

  loadLanguage: async () => {
    try {
      const saved = await settingsRepo.get("app_language");
      if (saved === "en" || saved === "hinglish") {
        set({ language: saved, isLoaded: true });
        return;
      }
    } catch {
      // fallback to default
    }
    set({ language: "en", isLoaded: true });
  },
}));
