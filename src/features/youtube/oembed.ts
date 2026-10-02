export type OEmbedError = "offline" | "not_found" | "timeout" | "unknown";

export interface OEmbedData {
  title: string;
  thumbnailUrl: string;
  authorName: string;
}

export type OEmbedResult =
  | { success: true; data: OEmbedData }
  | { success: false; error: OEmbedError };

export function parseOEmbedResponse(json: unknown): OEmbedData | null {
  if (!json || typeof json !== "object") return null;
  const p = json as Record<string, unknown>;
  const rawTitle = typeof p.title === "string" ? p.title.trim() : "";
  const title = rawTitle.replace(/\s+/g, " ").slice(0, 150) || "YouTube Video";
  const thumbnailUrl =
    typeof p.thumbnail_url === "string" ? p.thumbnail_url : "";
  const authorName =
    typeof p.author_name === "string" ? p.author_name.trim() : "";

  return {
    title,
    thumbnailUrl,
    authorName,
  };
}

export function mapFetchError(err: unknown, status?: number): OEmbedError {
  if (status === 404 || status === 401 || status === 403) {
    return "not_found";
  }
  if (err instanceof Error) {
    if (err.name === "AbortError") return "timeout";
    const msg = err.message.toLowerCase();
    if (
      msg.includes("network") ||
      msg.includes("failed to fetch") ||
      msg.includes("offline") ||
      msg.includes("enotfound") ||
      msg.includes("econnrefused")
    ) {
      return "offline";
    }
  }
  return "unknown";
}

export async function fetchOEmbed(
  canonicalUrl: string,
  timeoutMs = 8000
): Promise<OEmbedResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      canonicalUrl
    )}&format=json`;

    const res = await fetch(endpoint, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return { success: false, error: mapFetchError(null, res.status) };
    }

    const json = await res.json();
    const data = parseOEmbedResponse(json);

    if (!data) {
      return { success: false, error: "unknown" };
    }

    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: mapFetchError(err) };
  } finally {
    clearTimeout(timer);
  }
}
