import type { TaskLink } from "./types";
import { parseTimeString } from "./time";

export * from "./time";

export interface ParsedYouTubeLink {
  kind: "video" | "playlist" | "short";
  externalId: string;
  playlistId?: string;
  startSeconds?: number;
  canonicalUrl: string;
}

const ALLOWED_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
]);

const VIDEO_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;

export function parseYouTubeUrl(input: string): ParsedYouTubeLink | null {
  if (!input || typeof input !== "string") return null;
  let trimmed = input.trim();
  if (!trimmed) return null;

  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  const hostname = url.hostname.toLowerCase();
  if (!ALLOWED_HOSTS.has(hostname)) return null;

  const searchParams = url.searchParams;
  const timeParam = searchParams.get("t") || searchParams.get("start");
  const startSeconds = timeParam ? parseTimeString(timeParam) : undefined;

  // 1. youtu.be/<id>
  if (hostname === "youtu.be") {
    const pathId = url.pathname.slice(1).split("/")[0];
    if (!VIDEO_ID_REGEX.test(pathId)) return null;
    const playlistId = searchParams.get("list") || undefined;
    return {
      kind: "video",
      externalId: pathId,
      playlistId,
      startSeconds,
      canonicalUrl: `https://www.youtube.com/watch?v=${pathId}`,
    };
  }

  // 2. /shorts/<id>
  if (url.pathname.startsWith("/shorts/")) {
    const parts = url.pathname.split("/shorts/")[1]?.split("/");
    const shortId = parts ? parts[0] : "";
    if (!VIDEO_ID_REGEX.test(shortId)) return null;
    return {
      kind: "short",
      externalId: shortId,
      startSeconds,
      canonicalUrl: `https://www.youtube.com/shorts/${shortId}`,
    };
  }

  // 3. /embed/<id> or /live/<id>
  if (url.pathname.startsWith("/embed/") || url.pathname.startsWith("/live/")) {
    const prefix = url.pathname.startsWith("/embed/") ? "/embed/" : "/live/";
    const parts = url.pathname.split(prefix)[1]?.split("/");
    const id = parts ? parts[0] : "";
    if (!VIDEO_ID_REGEX.test(id)) return null;
    return {
      kind: "video",
      externalId: id,
      startSeconds,
      canonicalUrl: `https://www.youtube.com/watch?v=${id}`,
    };
  }

  // 4. /playlist?list=<id>
  if (url.pathname === "/playlist") {
    const listId = searchParams.get("list");
    if (!listId || !/^[A-Za-z0-9_-]+$/.test(listId)) return null;
    return {
      kind: "playlist",
      externalId: listId,
      canonicalUrl: `https://www.youtube.com/playlist?list=${listId}`,
    };
  }

  // 5. /watch?v=<id>
  if (url.pathname === "/watch") {
    const vId = searchParams.get("v");
    if (!vId || !VIDEO_ID_REGEX.test(vId)) return null;
    const playlistId = searchParams.get("list") || undefined;
    return {
      kind: "video",
      externalId: vId,
      playlistId,
      startSeconds,
      canonicalUrl: `https://www.youtube.com/watch?v=${vId}`,
    };
  }

  return null;
}

export function buildOpenUrl(link: {
  kind: string;
  externalId?: string | null;
  url?: string;
  watchedTillSeconds?: number | null;
}): string {
  let base: string;
  if (link.kind === "playlist" && link.externalId) {
    return `https://www.youtube.com/playlist?list=${link.externalId}`;
  }
  if (link.kind === "short" && link.externalId) {
    base = `https://www.youtube.com/shorts/${link.externalId}`;
  } else if (link.externalId) {
    base = `https://www.youtube.com/watch?v=${link.externalId}`;
  } else {
    base = link.url || "https://www.youtube.com";
  }

  if (link.watchedTillSeconds && link.watchedTillSeconds > 0 && link.kind !== "playlist") {
    const t = Math.floor(link.watchedTillSeconds);
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}t=${t}`;
  }

  return base;
}

export function getFallbackThumbnail(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function getLinksProgress(links: TaskLink[]): {
  watched: number;
  total: number;
  ratio: number;
} {
  let watched = 0;
  let total = 0;

  for (const l of links) {
    if (l.kind === "playlist") {
      const pTotal = l.playlistTotal || 0;
      const pDone = l.playlistDone || 0;
      if (pTotal > 0) {
        total += pTotal;
        watched += Math.min(pDone, pTotal);
      }
    } else {
      total += 1;
      if (l.watched) watched += 1;
    }
  }

  return {
    watched,
    total,
    ratio: total === 0 ? 0 : watched / total,
  };
}

export function getNextUnwatchedLink(links: TaskLink[]): TaskLink | null {
  if (!links || links.length === 0) return null;
  const nextVideo = links.find((l) => l.kind !== "playlist" && !l.watched);
  if (nextVideo) return nextVideo;

  const nextPlaylist = links.find((l) => {
    if (l.kind !== "playlist") return false;
    const total = l.playlistTotal || 0;
    const done = l.playlistDone || 0;
    return total === 0 || done < total;
  });
  return nextPlaylist || null;
}
