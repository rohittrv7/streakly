import { type Language } from "./types";

/**
 * Pure pluralization helper.
 * In English: 1 -> singular, other -> plural.
 * In Hinglish: 1 -> singular (e.g. "1 din"), other -> plural (e.g. "{n} din").
 */
export function plural(
  count: number,
  singular: string,
  pluralForm: string,
  lang: Language = "en"
): string {
  const isSingular = Math.abs(count) === 1;
  const word = isSingular ? singular : pluralForm;
  return `${count} ${word}`;
}
