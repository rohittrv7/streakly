export interface ShouldAutofillTitleParams {
  currentTitle: string;
  touched: boolean;
  alreadyFilled: boolean;
  linkTitle?: string | null;
}

/**
 * Cleans YouTube video or playlist title:
 * - trims and collapses internal whitespace
 * - strips trailing " - YouTube"
 * - caps at 80 characters (task title validation limit)
 */
export function cleanVideoTitle(rawTitle: string): string {
  if (!rawTitle) return "";
  let cleaned = rawTitle.trim().replace(/\s+/g, " ");
  cleaned = cleaned.replace(/\s*-\s*YouTube$/i, "");
  return cleaned.slice(0, 80).trim();
}

/**
 * Decides whether to autofill the task title from the YouTube link title:
 * - Must NOT be touched by the user in this form session
 * - Must NOT have been already filled by a previous link
 * - Current title must be empty
 * - Link title must be non-empty
 */
export function shouldAutofillTitle({
  currentTitle,
  touched,
  alreadyFilled,
  linkTitle,
}: ShouldAutofillTitleParams): boolean {
  if (touched) return false;
  if (alreadyFilled) return false;
  if (currentTitle.trim().length > 0) return false;
  if (!linkTitle || linkTitle.trim().length === 0) return false;
  return true;
}
