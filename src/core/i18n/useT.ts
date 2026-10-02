import { useLanguageStore } from "./store";
import { t, type TranslationKey } from "./t";
import { plural as pluralHelper } from "./plural";
import { type Language } from "./types";

export function useT(): {
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  plural: (count: number, singular: string, pluralForm: string) => string;
} {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  return {
    t: (key: TranslationKey, params?: Record<string, string | number>) =>
      t(language, key, params),
    language,
    setLanguage,
    plural: (count: number, singular: string, pluralForm: string) =>
      pluralHelper(count, singular, pluralForm, language),
  };
}
