import { create } from "zustand";
import { youTubeRepo } from "./repo";
import { parseYouTubeUrl, getFallbackThumbnail } from "./utils";
import { fetchOEmbed } from "./oembed";
import type { TaskLink } from "./types";
import { generateId } from "@/core/utils/id";
import { importPlaylistToTask, resyncPlaylistInTask } from "./playlist-sync";

export interface YouTubeState {
  linksByTask: Record<string, TaskLink[]>;
  metadataStatus: Record<string, "idle" | "loading" | "error" | "success">;

  loadForTasks: (taskIds: string[]) => Promise<void>;
  loadForTask: (taskId: string) => Promise<TaskLink[]>;
  addLink: (taskId: string, rawInput: string) => Promise<TaskLink>;
  removeLink: (id: string, taskId: string) => Promise<void>;
  toggleWatched: (id: string, taskId: string) => Promise<boolean>;
  setWatchedTill: (id: string, taskId: string, seconds: number | null) => Promise<void>;
  setNote: (id: string, taskId: string, note: string | null) => Promise<void>;
  setPlaylistProgress: (id: string, taskId: string, done: number, total: number) => Promise<void>;
  retryMetadata: (id: string, taskId: string) => Promise<string | null>;
  importPlaylist: (containerLinkId: string, taskId: string, playlistId: string) => Promise<void>;
  resyncPlaylist: (containerLinkId: string, taskId: string, playlistId: string) => Promise<void>;
}

export const useYouTubeStore = create<YouTubeState>((set, get) => {
  const updateLinkInTask = (taskId: string, id: string, patch: Partial<TaskLink>) => {
    set((s) => ({
      linksByTask: {
        ...s.linksByTask,
        [taskId]: (s.linksByTask[taskId] || []).map((l) => (l.id === id ? { ...l, ...patch } : l)),
      },
    }));
  };

  return {
    linksByTask: {},
    metadataStatus: {},

    loadForTasks: async (taskIds) => {
      if (taskIds.length === 0) return;
      try {
        const allLinks = await youTubeRepo.getLinksForTasks(taskIds);
        const grouped: Record<string, TaskLink[]> = {};
        for (const id of taskIds) grouped[id] = [];
        for (const l of allLinks) (grouped[l.taskId] ||= []).push(l);
        set((s) => ({ linksByTask: { ...s.linksByTask, ...grouped } }));
      } catch (err) {
        console.error("Failed to load links for tasks:", err);
      }
    },

    loadForTask: async (taskId) => {
      const links = await youTubeRepo.getLinksForTask(taskId);
      set((s) => ({ linksByTask: { ...s.linksByTask, [taskId]: links } }));
      return links;
    },

    addLink: async (taskId, rawInput) => {
      const parsed = parseYouTubeUrl(rawInput);
      if (!parsed) throw new Error("This doesn't look like a valid YouTube link.");

      const currentLinks = get().linksByTask[taskId] || [];
      const isDuplicate = currentLinks.some((l) => l.externalId === parsed.externalId);
      if (isDuplicate) throw new Error("This video is already attached to this task.");

      const fallbackTitle = "Fetching title...";
      const fallbackThumb =
        parsed.kind === "video" || parsed.kind === "short"
          ? getFallbackThumbnail(parsed.externalId)
          : null;
      const tempId = generateId();

      const newLink: TaskLink = {
        id: tempId,
        taskId,
        url: parsed.canonicalUrl,
        kind: parsed.kind === "playlist" ? "playlist" : "video",
        externalId: parsed.externalId,
        title: fallbackTitle,
        thumbnailUrl: fallbackThumb,
        watched: false,
        watchedTillSeconds: parsed.startSeconds || null,
        playlistTotal: parsed.kind === "playlist" ? 10 : null,
        playlistDone: parsed.kind === "playlist" ? 0 : null,
        createdAt: new Date().toISOString(),
      };

      set((s) => ({
        linksByTask: { ...s.linksByTask, [taskId]: [...(s.linksByTask[taskId] || []), newLink] },
        metadataStatus: { ...s.metadataStatus, [tempId]: "loading" },
      }));

      try {
        const saved = await youTubeRepo.addLink(newLink);
        fetchOEmbed(parsed.canonicalUrl).then(async (res) => {
          if (res.success) {
            await youTubeRepo.updateLink(saved.id, {
              title: res.data.title,
              thumbnailUrl: res.data.thumbnailUrl || fallbackThumb,
            });
            updateLinkInTask(taskId, saved.id, {
              title: res.data.title,
              thumbnailUrl: res.data.thumbnailUrl || fallbackThumb,
            });
            set((s) => ({ metadataStatus: { ...s.metadataStatus, [saved.id]: "success" } }));
          } else {
            set((s) => ({ metadataStatus: { ...s.metadataStatus, [saved.id]: "error" } }));
          }
        });
        return saved;
      } catch (err) {
        set((s) => ({
          linksByTask: { ...s.linksByTask, [taskId]: currentLinks },
          metadataStatus: { ...s.metadataStatus, [tempId]: "error" },
        }));
        throw err;
      }
    },

    removeLink: async (id, taskId) => {
      const prev = get().linksByTask[taskId] || [];
      set((s) => ({
        linksByTask: { ...s.linksByTask, [taskId]: prev.filter((l) => l.id !== id && l.parentLinkId !== id) },
      }));
      try {
        await youTubeRepo.removeLink(id);
      } catch (err) {
        set((s) => ({ linksByTask: { ...s.linksByTask, [taskId]: prev } }));
        throw err;
      }
    },

    toggleWatched: async (id, taskId) => {
      const prev = get().linksByTask[taskId] || [];
      const target = prev.find((l) => l.id === id);
      if (!target) return false;
      const nextWatched = !target.watched;

      updateLinkInTask(taskId, id, { watched: nextWatched });
      try {
        await youTubeRepo.updateLink(id, { watched: nextWatched });
        if (target.parentLinkId) {
          const children = await youTubeRepo.getChildren(target.parentLinkId);
          const watchedCount = children.filter((c) => c.watched).length;
          await youTubeRepo.updateLink(target.parentLinkId, { playlistDone: watchedCount });
          updateLinkInTask(taskId, target.parentLinkId, { playlistDone: watchedCount });
        }
        return nextWatched;
      } catch (err) {
        set((s) => ({ linksByTask: { ...s.linksByTask, [taskId]: prev } }));
        throw err;
      }
    },

    setWatchedTill: async (id, taskId, seconds) => {
      updateLinkInTask(taskId, id, { watchedTillSeconds: seconds });
      await youTubeRepo.updateLink(id, { watchedTillSeconds: seconds });
    },

    setNote: async (id, taskId, note) => {
      updateLinkInTask(taskId, id, { note });
      await youTubeRepo.updateLink(id, { note });
    },

    setPlaylistProgress: async (id, taskId, done, total) => {
      const clampedTotal = Math.max(0, total);
      const clampedDone = Math.max(0, Math.min(clampedTotal, done));
      updateLinkInTask(taskId, id, { playlistDone: clampedDone, playlistTotal: clampedTotal });
      await youTubeRepo.updateLink(id, { playlistDone: clampedDone, playlistTotal: clampedTotal });
    },

    retryMetadata: async (id, taskId) => {
      const link = (get().linksByTask[taskId] || []).find((l) => l.id === id);
      if (!link) return null;
      set((s) => ({ metadataStatus: { ...s.metadataStatus, [id]: "loading" } }));
      const res = await fetchOEmbed(link.url);
      if (res.success) {
        await youTubeRepo.updateLink(id, { title: res.data.title, thumbnailUrl: res.data.thumbnailUrl });
        updateLinkInTask(taskId, id, { title: res.data.title, thumbnailUrl: res.data.thumbnailUrl });
        set((s) => ({ metadataStatus: { ...s.metadataStatus, [id]: "success" } }));
        return res.data.title;
      }
      set((s) => ({ metadataStatus: { ...s.metadataStatus, [id]: "error" } }));
      return null;
    },

    importPlaylist: async (containerLinkId, taskId, playlistId) => {
      await importPlaylistToTask(containerLinkId, taskId, playlistId);
      await get().loadForTask(taskId);
    },

    resyncPlaylist: async (containerLinkId, taskId, playlistId) => {
      await resyncPlaylistInTask(containerLinkId, taskId, playlistId);
      await get().loadForTask(taskId);
    },
  };
});
