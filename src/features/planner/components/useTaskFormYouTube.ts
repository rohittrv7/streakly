import { useState } from "react";
import {
  parseYouTubeUrl,
  getFallbackThumbnail,
  fetchOEmbed,
  cleanVideoTitle,
  shouldAutofillTitle,
  type TaskLink,
} from "@/features/youtube";
import { generateId } from "@/core/utils/id";

export interface UseTaskFormYouTubeParams {
  initialTaskId?: string | null;
  initialLinks?: TaskLink[];
  currentTitle: string;
  onSetTitle: (title: string) => void;
  onClearTitleError?: () => void;
}

export function useTaskFormYouTube({
  initialTaskId,
  initialLinks = [],
  currentTitle,
  onSetTitle,
  onClearTitleError,
}: UseTaskFormYouTubeParams) {
  const [pendingLinks, setPendingLinks] = useState<TaskLink[]>(initialLinks);
  const [pendingMetaStatus, setPendingMetaStatus] = useState<Record<string, "idle" | "loading" | "error" | "success">>({});
  const [titleTouched, setTitleTouched] = useState(false);
  const [alreadyFilled, setAlreadyFilled] = useState(false);
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);
  const [showAutofillCaption, setShowAutofillCaption] = useState(false);

  const tryAutofill = (linkTitle?: string | null) => {
    if (shouldAutofillTitle({ currentTitle, touched: titleTouched, alreadyFilled, linkTitle })) {
      const cleaned = cleanVideoTitle(linkTitle!);
      onSetTitle(cleaned);
      setAlreadyFilled(true);
      setShowAutofillCaption(true);
      if (onClearTitleError) onClearTitleError();
    }
  };

  const handleAddPendingLink = async (url: string) => {
    const parsed = parseYouTubeUrl(url);
    if (!parsed) throw new Error("This doesn't look like a valid YouTube link.");
    if (pendingLinks.some((l) => l.externalId === parsed.externalId)) {
      throw new Error("This video is already added.");
    }
    const id = generateId();
    const thumb = parsed.kind === "playlist" ? null : getFallbackThumbnail(parsed.externalId);
    const newL: TaskLink = {
      id,
      taskId: initialTaskId || "",
      url: parsed.canonicalUrl,
      kind: parsed.kind === "playlist" ? "playlist" : "video",
      externalId: parsed.externalId,
      title: "Fetching title...",
      thumbnailUrl: thumb,
      watched: false,
      watchedTillSeconds: parsed.startSeconds || null,
      playlistTotal: parsed.kind === "playlist" ? 10 : null,
      playlistDone: parsed.kind === "playlist" ? 0 : null,
      createdAt: new Date().toISOString(),
    };
    setPendingLinks((prev) => [...prev, newL]);
    setPendingMetaStatus((s) => ({ ...s, [id]: "loading" }));

    const willFetch = !titleTouched && !alreadyFilled && currentTitle.trim().length === 0;
    if (willFetch) setIsFetchingTitle(true);

    fetchOEmbed(parsed.canonicalUrl).then(async (res) => {
      let finalTitle = res.success ? res.data.title : null;
      let finalThumb = res.success ? (res.data.thumbnailUrl || thumb) : thumb;

      if (!finalTitle && parsed.kind === "playlist") {
        try {
          const { fetchPlaylistVideos } = await import("@/features/youtube/api");
          const pResult = await fetchPlaylistVideos(parsed.externalId);
          if (pResult?.title) finalTitle = pResult.title;
        } catch {
          // Ignore
        }
      }

      if (willFetch) setIsFetchingTitle(false);
      if (finalTitle) {
        setPendingLinks((prev) =>
          prev.map((l) => (l.id === id ? { ...l, title: finalTitle, thumbnailUrl: finalThumb } : l))
        );
        setPendingMetaStatus((s) => ({ ...s, [id]: "success" }));
        tryAutofill(finalTitle);
      } else {
        setPendingMetaStatus((s) => ({ ...s, [id]: "error" }));
      }
    }).catch(() => {
      if (willFetch) setIsFetchingTitle(false);
      setPendingMetaStatus((s) => ({ ...s, [id]: "error" }));
    });
  };

  const handleRetryPendingMetadata = async (id: string) => {
    const link = pendingLinks.find((l) => l.id === id);
    if (!link) return;
    setPendingMetaStatus((s) => ({ ...s, [id]: "loading" }));
    const willFetch = !titleTouched && !alreadyFilled && currentTitle.trim().length === 0;
    if (willFetch) setIsFetchingTitle(true);
    try {
      const res = await fetchOEmbed(link.url);
      if (res.success) {
        setPendingLinks((prev) =>
          prev.map((l) => (l.id === id ? { ...l, title: res.data.title, thumbnailUrl: res.data.thumbnailUrl || l.thumbnailUrl } : l))
        );
        setPendingMetaStatus((s) => ({ ...s, [id]: "success" }));
        tryAutofill(res.data.title);
      } else {
        setPendingMetaStatus((s) => ({ ...s, [id]: "error" }));
      }
    } finally {
      if (willFetch) setIsFetchingTitle(false);
    }
  };

  const onUserChangeTitle = (text: string) => {
    onSetTitle(text);
    setTitleTouched(true);
    setShowAutofillCaption(false);
    if (onClearTitleError) onClearTitleError();
  };

  const onUndoAutofill = () => {
    onSetTitle("");
    setTitleTouched(true);
    setShowAutofillCaption(false);
  };

  const handleAddPendingBatch = async (urls: string[]) => {
    let added = 0;
    let existing = 0;
    for (const url of urls) {
      try {
        await handleAddPendingLink(url);
        added++;
      } catch (err: unknown) {
        if (err instanceof Error && err.message.toLowerCase().includes("already")) {
          existing++;
        }
      }
    }
    return { added, existing };
  };

  return {
    pendingLinks,
    setPendingLinks,
    pendingMetaStatus,
    isFetchingTitle,
    showAutofillCaption,
    handleAddPendingLink,
    handleAddPendingBatch,
    handleRetryPendingMetadata,
    onUserChangeTitle,
    onUndoAutofill,
  };
}
