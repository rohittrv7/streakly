import * as SecureStore from "expo-secure-store";

export const SECURE_KEY_YOUTUBE = "streakly_youtube_api_key";

export type ApiKeyStatus = "valid" | "invalid" | "quota_exceeded" | "offline";

/**
 * Resolves the active YouTube API key in priority order:
 * 1. User key saved in Expo SecureStore
 * 2. EXPO_PUBLIC_YOUTUBE_API_KEY from environment (.env)
 * 3. null
 */
export async function getYouTubeApiKey(): Promise<string | null> {
  try {
    const userKey = await SecureStore.getItemAsync(SECURE_KEY_YOUTUBE);
    if (userKey && userKey.trim().length > 0) {
      return userKey.trim();
    }
  } catch {
    // Fall back to environment variable if SecureStore fails
  }

  const envKey = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY;
  if (envKey && envKey.trim().length > 0) {
    return envKey.trim();
  }

  return null;
}

export async function getUserStoredApiKey(): Promise<string | null> {
  try {
    const key = await SecureStore.getItemAsync(SECURE_KEY_YOUTUBE);
    return key && key.trim().length > 0 ? key.trim() : null;
  } catch {
    return null;
  }
}

export async function saveUserApiKey(key: string): Promise<void> {
  const trimmed = key.trim();
  if (!trimmed) {
    await deleteUserApiKey();
    return;
  }
  await SecureStore.setItemAsync(SECURE_KEY_YOUTUBE, trimmed);
}

export async function deleteUserApiKey(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SECURE_KEY_YOUTUBE);
  } catch {
    // Ignore error if key does not exist
  }
}

/**
 * Masks an API key for safe display (e.g., "AIza...****1234").
 * Never exposes the full key.
 */
export function maskApiKey(key: string | null | undefined): string {
  if (!key || key.length < 8) return "";
  const prefix = key.slice(0, 4);
  const suffix = key.slice(-4);
  return `${prefix}...****${suffix}`;
}

/**
 * Performs a lightweight check against the YouTube API without logging the key.
 */
export async function testYouTubeApiKey(key: string): Promise<ApiKeyStatus> {
  if (!key || !key.trim()) return "invalid";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);

  try {
    // Use videos.list with a known public video ID (Rick Astley - Never Gonna Give You Up)
    const url = `https://www.googleapis.com/youtube/v3/videos?part=id&id=dQw4w9WgXcQ&key=${encodeURIComponent(
      key.trim()
    )}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (res.ok) return "valid";

    if (res.status === 400 || res.status === 403) {
      try {
        const body = await res.json();
        const reason = body?.error?.errors?.[0]?.reason || "";
        if (reason === "quotaExceeded") return "quota_exceeded";
      } catch {
        // Fall back to invalid
      }
      return "invalid";
    }

    return "invalid";
  } catch (err: any) {
    clearTimeout(timer);
    if (err?.name === "AbortError") return "offline";
    return "offline";
  }
}
