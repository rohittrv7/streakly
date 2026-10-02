import { getDb } from "@/lib/db/client";
import { generateId } from "@/core/utils/id";
import {
  type TaskLink,
  type TaskLinkKind,
  type TaskLinkRow,
  mapTaskLinkRow,
} from "./types";

export const youTubeRepo = {
  async getLinksForTask(taskId: string): Promise<TaskLink[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<TaskLinkRow>(
      "SELECT * FROM task_links WHERE task_id = ? ORDER BY created_at ASC;",
      [taskId]
    );
    return rows.map(mapTaskLinkRow);
  },

  async getLinksForTasks(taskIds: string[]): Promise<TaskLink[]> {
    if (taskIds.length === 0) return [];
    const db = await getDb();
    const placeholders = taskIds.map(() => "?").join(", ");
    const rows = await db.getAllAsync<TaskLinkRow>(
      `SELECT * FROM task_links WHERE task_id IN (${placeholders}) ORDER BY created_at ASC;`,
      taskIds
    );
    return rows.map(mapTaskLinkRow);
  },

  async getById(id: string): Promise<TaskLink | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<TaskLinkRow>(
      "SELECT * FROM task_links WHERE id = ?;",
      [id]
    );
    return row ? mapTaskLinkRow(row) : null;
  },

  async addLink(data: {
    id?: string;
    taskId: string;
    url: string;
    kind?: TaskLinkKind;
    externalId?: string | null;
    title?: string | null;
    thumbnailUrl?: string | null;
    watched?: boolean;
    watchedTillSeconds?: number | null;
    note?: string | null;
    playlistTotal?: number | null;
    playlistDone?: number | null;
    createdAt?: string;
  }): Promise<TaskLink> {
    const db = await getDb();
    const id = data.id || generateId();
    const kind = data.kind || "video";
    const createdAt = data.createdAt || new Date().toISOString();
    const watched = data.watched ? 1 : 0;

    await db.runAsync(
      `INSERT INTO task_links (
        id, task_id, url, kind, external_id, title, thumbnail_url,
        watched, watched_till_seconds, note, playlist_total, playlist_done, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        id,
        data.taskId,
        data.url,
        kind,
        data.externalId ?? null,
        data.title ?? null,
        data.thumbnailUrl ?? null,
        watched,
        data.watchedTillSeconds ?? null,
        data.note ?? null,
        data.playlistTotal ?? null,
        data.playlistDone ?? null,
        createdAt,
      ]
    );

    return {
      id,
      taskId: data.taskId,
      url: data.url,
      kind,
      externalId: data.externalId ?? null,
      title: data.title ?? null,
      thumbnailUrl: data.thumbnailUrl ?? null,
      watched: Boolean(data.watched),
      watchedTillSeconds: data.watchedTillSeconds ?? null,
      note: data.note ?? null,
      playlistTotal: data.playlistTotal ?? null,
      playlistDone: data.playlistDone ?? null,
      createdAt,
    };
  },

  async updateLink(
    id: string,
    updates: Partial<{
      title: string | null;
      thumbnailUrl: string | null;
      watched: boolean;
      watchedTillSeconds: number | null;
      note: string | null;
      playlistTotal: number | null;
      playlistDone: number | null;
    }>
  ): Promise<TaskLink | null> {
    const db = await getDb();
    const existing = await youTubeRepo.getById(id);
    if (!existing) return null;

    const title =
      (updates.title !== undefined ? updates.title : existing.title) ?? null;
    const thumbnailUrl =
      (updates.thumbnailUrl !== undefined
        ? updates.thumbnailUrl
        : existing.thumbnailUrl) ?? null;
    const watched =
      updates.watched !== undefined
        ? updates.watched
          ? 1
          : 0
        : existing.watched
        ? 1
        : 0;
    const watchedTillSeconds =
      (updates.watchedTillSeconds !== undefined
        ? updates.watchedTillSeconds
        : existing.watchedTillSeconds) ?? null;
    const note =
      (updates.note !== undefined ? updates.note : existing.note) ?? null;
    const playlistTotal =
      (updates.playlistTotal !== undefined
        ? updates.playlistTotal
        : existing.playlistTotal) ?? null;
    const playlistDone =
      (updates.playlistDone !== undefined
        ? updates.playlistDone
        : existing.playlistDone) ?? null;

    await db.runAsync(
      `UPDATE task_links SET
        title = ?,
        thumbnail_url = ?,
        watched = ?,
        watched_till_seconds = ?,
        note = ?,
        playlist_total = ?,
        playlist_done = ?
      WHERE id = ?;`,
      [
        title,
        thumbnailUrl,
        watched,
        watchedTillSeconds,
        note,
        playlistTotal,
        playlistDone,
        id,
      ]
    );

    return youTubeRepo.getById(id);
  },

  async removeLink(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync("DELETE FROM task_links WHERE id = ?;", [id]);
  },
};
