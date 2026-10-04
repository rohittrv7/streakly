import { parseYouTubeUrl } from "./utils";

export interface ShouldAutoAddParams {
  previousText: string;
  nextText: string;
  isPasteButton?: boolean;
}

export interface ShouldAutoAddResult {
  autoAdd: boolean;
  isImmediate: boolean;
}

// Regex to find potential youtube url tokens in text
const YOUTUBE_URL_REGEX = /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?[^\s,;"'<>()]+|live\/[^\s,;"'<>()]+|playlist\?[^\s,;"'<>()]+)|youtu\.be\/[^\s,;"'<>()]+)/gi;

/**
 * Extracts valid YouTube URLs from text containing multiple lines,
 * comma/space separated URLs, or URLs embedded in sentences.
 * Normalizes watch?v URLs with auto-mix lists (list=RD/LL/WL).
 * Caps output to 20 unique links.
 */
export function extractYouTubeUrls(text: string): string[] {
  if (!text || typeof text !== "string") return [];

  const rawMatches = text.match(YOUTUBE_URL_REGEX);
  if (!rawMatches) return [];

  const results: string[] = [];
  const seenIds = new Set<string>();

  for (const raw of rawMatches) {
    const trimmed = raw.trim().replace(/[.,;)]+$/, "");
    const parsed = parseYouTubeUrl(trimmed);
    if (parsed) {
      const key = `${parsed.kind}:${parsed.externalId}`;
      if (!seenIds.has(key)) {
        seenIds.add(key);
        results.push(parsed.canonicalUrl);
        if (results.length >= 20) break;
      }
    }
  }

  return results;
}

/**
 * Determines whether text change should trigger an auto-add.
 * A paste (growth by 8+ chars or paste button) triggers immediately.
 * Typed input triggers after debounce.
 */
export function shouldAutoAdd(params: ShouldAutoAddParams): ShouldAutoAddResult {
  const { previousText, nextText, isPasteButton = false } = params;

  if (isPasteButton) {
    const urls = extractYouTubeUrls(nextText);
    return { autoAdd: urls.length > 0, isImmediate: true };
  }

  const trimmed = nextText.trim();
  if (!trimmed) {
    return { autoAdd: false, isImmediate: false };
  }

  const urls = extractYouTubeUrls(nextText);
  if (urls.length === 0) {
    return { autoAdd: false, isImmediate: false };
  }

  // Growth by 8 or more characters indicates a paste
  const delta = nextText.length - previousText.length;
  if (delta >= 8) {
    return { autoAdd: true, isImmediate: true };
  }

  // Otherwise typed input containing a valid URL -> debounce
  return { autoAdd: true, isImmediate: false };
}
