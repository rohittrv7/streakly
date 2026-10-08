import Constants from "expo-constants";

export type ApiKeyStatus = "valid" | "invalid" | "quota_exceeded" | "offline";

export function resolveBundledKey(
  envVal?: string | null,
  extraVal?: string | null
): string | null {
  if (typeof envVal === "string" && envVal.trim().length > 0) {
    return envVal.trim();
  }
  if (typeof extraVal === "string" && extraVal.trim().length > 0) {
    return extraVal.trim();
  }
  return null;
}

/**
 * Resolves the bundled YouTube API key silently:
 * 1. process.env.EXPO_PUBLIC_YOUTUBE_API_KEY (static literal)
 * 2. Constants.expoConfig?.extra?.youtubeApiKey
 * 3. null
 */
export function getBundledYouTubeApiKey(): string | null {
  return resolveBundledKey(
    process.env.EXPO_PUBLIC_YOUTUBE_API_KEY,
    Constants.expoConfig?.extra?.youtubeApiKey
  );
}

// Backward-compatible alias for existing imports
export async function getYouTubeApiKey(): Promise<string | null> {
  return getBundledYouTubeApiKey();
}

/**
 * Returns friendly non-technical error messages for playlist import failures.
 */
export function getImportErrorMessage(
  reasonOrError?: unknown
): string {
  let kind = "unknown";
  if (typeof reasonOrError === "string") {
    kind = reasonOrError;
  } else if (
    reasonOrError &&
    typeof reasonOrError === "object" &&
    "kind" in reasonOrError
  ) {
    kind = String((reasonOrError as { kind: string }).kind);
  } else if (reasonOrError instanceof Error) {
    const msg = reasonOrError.message.toLowerCase();
    if (msg.includes("quota")) kind = "quota_exceeded";
    else if (msg.includes("offline") || msg.includes("network")) kind = "offline";
    else if (msg.includes("key")) kind = "invalid";
  }

  switch (kind) {
    case "offline":
      return "Connect to the internet to import videos";
    case "quota_exceeded":
      return "Import is busy right now. Try again tomorrow or add the videos by hand";
    case "invalid":
    case "unknown":
    default:
      return "Import isn't available right now";
  }
}

/**
 * __DEV__ diagnostics helper: returns length and last 4 chars without leaking full key.
 */
export function getDevKeyDiagnostics(): {
  found: boolean;
  length: number;
  last4: string;
  display: string;
} {
  const key = getBundledYouTubeApiKey();
  if (!key) {
    return { found: false, length: 0, last4: "", display: "YouTube key: missing" };
  }
  const last4 = key.slice(-4);
  return {
    found: true,
    length: key.length,
    last4,
    display: `YouTube key: found (length ${key.length}, ...${last4})`,
  };
}
