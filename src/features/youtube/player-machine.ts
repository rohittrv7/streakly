export type PlayerState =
  | "idle"
  | "offline"
  | "loading"
  | "ready"
  | "timeout"
  | "error"
  | "closed";

export type PlayerEvent =
  | { type: "OPEN"; isConnected: boolean }
  | { type: "NETWORK_CHANGE"; isConnected: boolean }
  | { type: "READY" }
  | { type: "TIMEOUT" }
  | { type: "ERROR"; error?: string }
  | { type: "RETRY"; isConnected: boolean }
  | { type: "CLOSE" };

export function playerReducer(
  state: PlayerState,
  event: PlayerEvent
): PlayerState {
  switch (event.type) {
    case "OPEN":
      return event.isConnected ? "loading" : "offline";

    case "NETWORK_CHANGE":
      if (state === "offline" && event.isConnected) {
        return "loading";
      }
      if (!event.isConnected && state !== "closed") {
        return "offline";
      }
      return state;

    case "READY":
      if (state === "loading") {
        return "ready";
      }
      return state;

    case "TIMEOUT":
      if (state === "loading") {
        return "timeout";
      }
      return state;

    case "ERROR":
      if (state !== "closed") {
        return "error";
      }
      return state;

    case "RETRY":
      return event.isConnected ? "loading" : "offline";

    case "CLOSE":
      return "closed";

    default:
      return state;
  }
}

export interface PlayerUrlCheck {
  allowed: boolean;
  openExternal?: boolean;
}

export function isAllowedPlayerUrl(url: string | null | undefined): PlayerUrlCheck {
  if (!url || typeof url !== "string") {
    return { allowed: false, openExternal: false };
  }

  const trimmed = url.trim();
  if (!trimmed || trimmed === "about:blank") {
    return { allowed: true, openExternal: false };
  }

  if (trimmed.toLowerCase().startsWith("javascript:")) {
    return { allowed: false, openExternal: false };
  }

  try {
    const parsed = new URL(trimmed);
    const protocol = parsed.protocol.toLowerCase();
    if (protocol !== "https:" && protocol !== "http:") {
      return { allowed: false, openExternal: false };
    }

    const host = parsed.hostname.toLowerCase();
    const isYouTubeDomain =
      host === "www.youtube-nocookie.com" ||
      host === "youtube-nocookie.com" ||
      host === "www.youtube.com" ||
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtu.be";

    if (!isYouTubeDomain) {
      return { allowed: false, openExternal: false };
    }

    // Check if it's the embed frame
    const path = parsed.pathname.toLowerCase();
    if (
      (host === "www.youtube-nocookie.com" ||
        host === "youtube-nocookie.com" ||
        host === "www.youtube.com" ||
        host === "youtube.com") &&
      path.startsWith("/embed/")
    ) {
      return { allowed: true, openExternal: false };
    }

    // Any other youtube link (video watch, channel, logo, etc.)
    return { allowed: false, openExternal: true };
  } catch {
    return { allowed: false, openExternal: false };
  }
}
