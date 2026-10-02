export interface YouTubePlaylistItem {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  durationSeconds: number | null;
  position: number;
}

export interface FetchPlaylistResult {
  title: string;
  videos: YouTubePlaylistItem[];
  hitCap: boolean;
}

export type YouTubeErrorKind =
  | "no_key"
  | "invalid_key"
  | "quota_exceeded"
  | "not_found"
  | "offline"
  | "timeout"
  | "unknown";

export class YouTubeApiError extends Error {
  readonly kind: YouTubeErrorKind;

  constructor(kind: YouTubeErrorKind, message?: string) {
    super(message || kind);
    this.name = "YouTubeApiError";
    this.kind = kind;
  }
}
