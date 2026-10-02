import { parseIsoDuration } from "./api-duration";
import { getYouTubeApiKey } from "./api-key";
import {
  type YouTubePlaylistItem,
  type FetchPlaylistResult,
  YouTubeApiError,
  type YouTubeErrorKind,
} from "./api-types";

export * from "./api-types";
export * from "./api-duration";
export * from "./api-key";

const MAX_VIDEOS = 300;
const TIMEOUT_MS = 10000;

function parseApiError(status: number, data?: any): YouTubeErrorKind {
  if (status === 404) return "not_found";
  const reason = data?.error?.errors?.[0]?.reason || "";
  if (reason === "quotaExceeded") return "quota_exceeded";
  if (status === 400 || status === 403 || reason === "keyInvalid") return "invalid_key";
  return "unknown";
}

async function fetchWithTimeout(url: string): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw new YouTubeApiError(parseApiError(res.status, data));
    }
    return data;
  } catch (err: any) {
    clearTimeout(timer);
    if (err instanceof YouTubeApiError) throw err;
    if (err?.name === "AbortError") throw new YouTubeApiError("timeout");
    throw new YouTubeApiError("offline");
  }
}

export async function fetchPlaylistVideos(
  playlistId: string,
  providedKey?: string | null
): Promise<FetchPlaylistResult> {
  const key = providedKey || (await getYouTubeApiKey());
  if (!key) throw new YouTubeApiError("no_key");

  const cleanId = encodeURIComponent(playlistId.trim());
  const encodedKey = encodeURIComponent(key.trim());

  // 1. Fetch Playlist Title
  const playlistUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${cleanId}&key=${encodedKey}`;
  const playlistData = await fetchWithTimeout(playlistUrl);
  if (!playlistData?.items || playlistData.items.length === 0) {
    throw new YouTubeApiError("not_found");
  }
  const playlistTitle = playlistData.items[0]?.snippet?.title || "Playlist";

  // 2. Paginate playlistItems.list (up to 300 items / 6 pages)
  const rawItems: Array<{ videoId: string; title: string; thumbnailUrl: string }> = [];
  let pageToken: string | undefined = undefined;
  let pageCount = 0;
  let hitCap = false;

  while (pageCount < 6) {
    const tokenParam = pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : "";
    const itemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${cleanId}${tokenParam}&key=${encodedKey}`;
    const pageData = await fetchWithTimeout(itemsUrl);

    const items = Array.isArray(pageData?.items) ? pageData.items : [];
    for (const item of items) {
      const vId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
      const title = item.snippet?.title || "";
      if (!vId || title === "Deleted video" || title === "Private video") continue;

      const thumbs = item.snippet?.thumbnails;
      const thumb = thumbs?.medium?.url || thumbs?.default?.url || `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`;
      rawItems.push({ videoId: vId, title, thumbnailUrl: thumb });
      if (rawItems.length >= MAX_VIDEOS) break;
    }

    pageToken = pageData?.nextPageToken;
    pageCount++;
    if (!pageToken || rawItems.length >= MAX_VIDEOS) {
      if (pageToken && rawItems.length >= MAX_VIDEOS) hitCap = true;
      break;
    }
  }

  if (rawItems.length === 0) {
    return { title: playlistTitle, videos: [], hitCap: false };
  }

  // 3. Batch fetch video durations with videos.list (batches of 50)
  const durationMap = new Map<string, number | null>();
  for (let i = 0; i < rawItems.length; i += 50) {
    const batch = rawItems.slice(i, i + 50);
    const ids = batch.map((b) => encodeURIComponent(b.videoId)).join(",");
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${ids}&key=${encodedKey}`;
    const vData = await fetchWithTimeout(videosUrl);

    if (Array.isArray(vData?.items)) {
      for (const v of vData.items) {
        if (v.id) {
          durationMap.set(v.id, parseIsoDuration(v.contentDetails?.duration));
        }
      }
    }
  }

  // 4. Build final video list
  const videos: YouTubePlaylistItem[] = rawItems.map((item, index) => ({
    videoId: item.videoId,
    title: item.title,
    thumbnailUrl: item.thumbnailUrl,
    durationSeconds: durationMap.get(item.videoId) ?? null,
    position: index + 1,
  }));

  return { title: playlistTitle, videos, hitCap };
}
