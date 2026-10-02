import { type Language, type TranslationSchema } from "./types";
import { en } from "./en";
import { hinglish } from "./hinglish";
import { interpolate } from "./interpolate";

const DICTIONARIES: Record<Language, TranslationSchema> = {
  en,
  hinglish,
};

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<TranslationSchema>;

/**
 * Pure translation function with interpolation.
 */
export function t(
  lang: Language,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  const dict = DICTIONARIES[lang] || en;
  const parts = key.split(".");
  let current: any = dict;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      // Fallback to English if missing in target dict
      let fallbackCurrent: any = en;
      for (const p of parts) {
        if (fallbackCurrent && typeof fallbackCurrent === "object" && p in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[p];
        } else {
          return key;
        }
      }
      return interpolate(String(fallbackCurrent), params);
    }
  }

  return interpolate(String(current), params);
}
