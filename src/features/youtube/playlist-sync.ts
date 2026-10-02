import { youTubeRepo, type TaskLinkInput } from "./repo";
import { fetchPlaylistVideos, type FetchPlaylistResult } from "./api";
import { generateId } from "@/core/utils/id";
import type { TaskLink } from "./types";

export interface SyncResult {
  title: string;
  totalVideos: number;
  addedCount: number;
  updatedCount: number;
  hitCap: boolean;
}

export async function importPlaylistToTask(
  containerLinkId: string,
  taskId: string,
  playlistId: string
): Promise<FetchPlaylistResult> {
  const result = await fetchPlaylistVideos(playlistId);

  // Update container link
  await youTubeRepo.updateLink(containerLinkId, {
    title: result.title,
    playlistTotal: result.videos.length,
    playlistDone: 0,
  });

  // Remove any old children if present
  const oldChildren = await youTubeRepo.getChildren(containerLinkId);
  for (const child of oldChildren) {
    await youTubeRepo.removeLink(child.id);
  }

  // Create child links
  const childInputs: TaskLinkInput[] = result.videos.map((v) => ({
    id: generateId(),
    taskId,
    url: `https://www.youtube.com/watch?v=${v.videoId}&list=${encodeURIComponent(playlistId)}&index=${v.position}`,
    kind: "video",
    externalId: v.videoId,
    title: v.title,
    thumbnailUrl: v.thumbnailUrl,
    watched: false,
    watchedTillSeconds: null,
    position: v.position,
    durationSeconds: v.durationSeconds,
    parentLinkId: containerLinkId,
  }));

  await youTubeRepo.addLinksBatch(childInputs);
  return result;
}

export async function resyncPlaylistInTask(
  containerLinkId: string,
  taskId: string,
  playlistId: string
): Promise<SyncResult> {
  const result = await fetchPlaylistVideos(playlistId);
  const oldChildren = await youTubeRepo.getChildren(containerLinkId);

  const existingByVideoId = new Map<string, TaskLink>();
  for (const child of oldChildren) {
    if (child.externalId) existingByVideoId.set(child.externalId, child);
  }

  const fetchedVideoIds = new Set(result.videos.map((v) => v.videoId));
  const newChildInputs: TaskLinkInput[] = [];
  let addedCount = 0;
  let updatedCount = 0;

  // Process fetched videos
  for (const v of result.videos) {
    const existing = existingByVideoId.get(v.videoId);
    if (existing) {
      updatedCount++;
      newChildInputs.push({
        id: existing.id,
        taskId,
        url: existing.url,
        kind: "video",
        externalId: v.videoId,
        title: v.title,
        thumbnailUrl: v.thumbnailUrl,
        watched: existing.watched,
        watchedTillSeconds: existing.watchedTillSeconds,
        note: existing.note,
        position: v.position,
        durationSeconds: v.durationSeconds,
        parentLinkId: containerLinkId,
      });
    } else {
      addedCount++;
      newChildInputs.push({
        id: generateId(),
        taskId,
        url: `https://www.youtube.com/watch?v=${v.videoId}&list=${encodeURIComponent(playlistId)}&index=${v.position}`,
        kind: "video",
        externalId: v.videoId,
        title: v.title,
        thumbnailUrl: v.thumbnailUrl,
        watched: false,
        position: v.position,
        durationSeconds: v.durationSeconds,
        parentLinkId: containerLinkId,
      });
    }
  }

  // Handle removed videos: keep them marked as unavailable
  let nextPos = result.videos.length + 1;
  for (const old of oldChildren) {
    if (old.externalId && !fetchedVideoIds.has(old.externalId)) {
      const unavailableTitle = old.title?.startsWith("[Unavailable]")
        ? old.title
        : `[Unavailable] ${old.title || "Video"}`;
      newChildInputs.push({
        id: old.id,
        taskId,
        url: old.url,
        kind: "video",
        externalId: old.externalId,
        title: unavailableTitle,
        thumbnailUrl: old.thumbnailUrl,
        watched: old.watched,
        watchedTillSeconds: old.watchedTillSeconds,
        note: old.note,
        position: nextPos++,
        durationSeconds: old.durationSeconds,
        parentLinkId: containerLinkId,
      });
    }
  }

  // Delete previous children and re-insert batch cleanly
  for (const child of oldChildren) {
    await youTubeRepo.removeLink(child.id);
  }
  await youTubeRepo.addLinksBatch(newChildInputs);

  const watchedCount = newChildInputs.filter((c) => c.watched).length;
  await youTubeRepo.updateLink(containerLinkId, {
    title: result.title,
    playlistTotal: newChildInputs.length,
    playlistDone: watchedCount,
  });

  return {
    title: result.title,
    totalVideos: newChildInputs.length,
    addedCount,
    updatedCount,
    hitCap: result.hitCap,
  };
}
