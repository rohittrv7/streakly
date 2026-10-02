import { getDb } from "@/lib/db/client";
import { generateId } from "@/core/utils/id";
import { type TaskLink, type TaskLinkKind, type TaskLinkRow, mapTaskLinkRow } from "./types";

export interface TaskLinkInput {
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
  position?: number | null;
  durationSeconds?: number | null;
  parentLinkId?: string | null;
  createdAt?: string;
}

export const youTubeRepo = {
  async getLinksForTask(taskId: string): Promise<TaskLink[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<TaskLinkRow>(
      "SELECT * FROM task_links WHERE task_id = ? ORDER BY position ASC, created_at ASC;",
      [taskId]
    );
    return rows.map(mapTaskLinkRow);
  },

  async getLinksForTasks(taskIds: string[]): Promise<TaskLink[]> {
    if (taskIds.length === 0) return [];
    const db = await getDb();
    const placeholders = taskIds.map(() => "?").join(", ");
    const rows = await db.getAllAsync<TaskLinkRow>(
      `SELECT * FROM task_links WHERE task_id IN (${placeholders}) ORDER BY position ASC, created_at ASC;`,
      taskIds
    );
    return rows.map(mapTaskLinkRow);
  },

  async getChildren(parentLinkId: string): Promise<TaskLink[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<TaskLinkRow>(
      "SELECT * FROM task_links WHERE parent_link_id = ? ORDER BY position ASC, created_at ASC;",
      [parentLinkId]
    );
    return rows.map(mapTaskLinkRow);
  },

  async getById(id: string): Promise<TaskLink | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<TaskLinkRow>("SELECT * FROM task_links WHERE id = ?;", [id]);
    return row ? mapTaskLinkRow(row) : null;
  },

  async addLink(data: TaskLinkInput): Promise<TaskLink> {
    const db = await getDb();
    const id = data.id || generateId();
    const kind = data.kind || "video";
    const createdAt = data.createdAt || new Date().toISOString();
    const watched = data.watched ? 1 : 0;

    await db.runAsync(
      `INSERT INTO task_links (
        id, task_id, url, kind, external_id, title, thumbnail_url,
        watched, watched_till_seconds, note, playlist_total, playlist_done,
        position, duration_seconds, parent_link_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        id, data.taskId, data.url, kind, data.externalId ?? null, data.title ?? null,
        data.thumbnailUrl ?? null, watched, data.watchedTillSeconds ?? null, data.note ?? null,
        data.playlistTotal ?? null, data.playlistDone ?? null, data.position ?? null,
        data.durationSeconds ?? null, data.parentLinkId ?? null, createdAt,
      ]
    );

    return {
      id, taskId: data.taskId, url: data.url, kind, externalId: data.externalId ?? null,
      title: data.title ?? null, thumbnailUrl: data.thumbnailUrl ?? null, watched: Boolean(data.watched),
      watchedTillSeconds: data.watchedTillSeconds ?? null, note: data.note ?? null,
      playlistTotal: data.playlistTotal ?? null, playlistDone: data.playlistDone ?? null,
      position: data.position ?? null, durationSeconds: data.durationSeconds ?? null,
      parentLinkId: data.parentLinkId ?? null, createdAt,
    };
  },

  async addLinksBatch(inputs: TaskLinkInput[]): Promise<TaskLink[]> {
    if (inputs.length === 0) return [];
    const db = await getDb();
    const results: TaskLink[] = [];

    await db.withTransactionAsync(async () => {
      for (const data of inputs) {
        const id = data.id || generateId();
        const kind = data.kind || "video";
        const createdAt = data.createdAt || new Date().toISOString();
        const watched = data.watched ? 1 : 0;

        await db.runAsync(
          `INSERT INTO task_links (
            id, task_id, url, kind, external_id, title, thumbnail_url,
            watched, watched_till_seconds, note, playlist_total, playlist_done,
            position, duration_seconds, parent_link_id, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            id, data.taskId, data.url, kind, data.externalId ?? null, data.title ?? null,
            data.thumbnailUrl ?? null, watched, data.watchedTillSeconds ?? null, data.note ?? null,
            data.playlistTotal ?? null, data.playlistDone ?? null, data.position ?? null,
            data.durationSeconds ?? null, data.parentLinkId ?? null, createdAt,
          ]
        );

        results.push({
          id, taskId: data.taskId, url: data.url, kind, externalId: data.externalId ?? null,
          title: data.title ?? null, thumbnailUrl: data.thumbnailUrl ?? null, watched: Boolean(data.watched),
          watchedTillSeconds: data.watchedTillSeconds ?? null, note: data.note ?? null,
          playlistTotal: data.playlistTotal ?? null, playlistDone: data.playlistDone ?? null,
          position: data.position ?? null, durationSeconds: data.durationSeconds ?? null,
          parentLinkId: data.parentLinkId ?? null, createdAt,
        });
      }
    });

    return results;
  },

  async updateLink(id: string, updates: Partial<TaskLinkInput>): Promise<TaskLink | null> {
    const db = await getDb();
    const existing = await youTubeRepo.getById(id);
    if (!existing) return null;

    const title = updates.title !== undefined ? updates.title : existing.title;
    const thumb = updates.thumbnailUrl !== undefined ? updates.thumbnailUrl : existing.thumbnailUrl;
    const watched = updates.watched !== undefined ? (updates.watched ? 1 : 0) : (existing.watched ? 1 : 0);
    const wTill = updates.watchedTillSeconds !== undefined ? updates.watchedTillSeconds : existing.watchedTillSeconds;
    const note = updates.note !== undefined ? updates.note : existing.note;
    const pTotal = updates.playlistTotal !== undefined ? updates.playlistTotal : existing.playlistTotal;
    const pDone = updates.playlistDone !== undefined ? updates.playlistDone : existing.playlistDone;
    const pos = updates.position !== undefined ? updates.position : existing.position;
    const dur = updates.durationSeconds !== undefined ? updates.durationSeconds : existing.durationSeconds;
    const parentId = updates.parentLinkId !== undefined ? updates.parentLinkId : existing.parentLinkId;

    await db.runAsync(
      `UPDATE task_links SET
        title = ?, thumbnail_url = ?, watched = ?, watched_till_seconds = ?,
        note = ?, playlist_total = ?, playlist_done = ?, position = ?,
        duration_seconds = ?, parent_link_id = ?
      WHERE id = ?;`,
      [title ?? null, thumb ?? null, watched, wTill ?? null, note ?? null, pTotal ?? null, pDone ?? null, pos ?? null, dur ?? null, parentId ?? null, id]
    );

    return youTubeRepo.getById(id);
  },

  async removeLink(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync("DELETE FROM task_links WHERE id = ?;", [id]);
  },
};
