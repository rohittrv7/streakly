import { getDb } from "@/lib/db/client";
import { generateId } from "@/core/utils/id";
import type { Task, TaskCategory, TaskChecklistItem } from "./types";
import type { TaskLink } from "@/features/youtube/types";
import type { StagedTaskLinkInput } from "./create-task-transaction";

export interface UpdateTaskWithLinksInput {
  taskId: string;
  title: string;
  notes?: string | null;
  category: TaskCategory;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  checklist?: TaskChecklistItem[];
  links?: StagedTaskLinkInput[];
}

export async function updateTaskWithLinksTransaction(
  input: UpdateTaskWithLinksInput
): Promise<Task> {
  const db = await getDb();
  const { taskId } = input;
  const now = new Date().toISOString();

  let updatedTask: Task;

  await db.withTransactionAsync(async () => {
    // 1. Update task
    await db.runAsync(
      `UPDATE tasks SET
        title = ?,
        notes = ?,
        category = ?,
        date = ?,
        start_time = ?,
        end_time = ?
      WHERE id = ?;`,
      [
        input.title,
        input.notes ?? null,
        input.category,
        input.date,
        input.startTime ?? null,
        input.endTime ?? null,
        taskId,
      ]
    );

    const row = await db.getFirstAsync<{
      id: string;
      title: string;
      notes: string | null;
      category: string;
      date: string;
      start_time: string | null;
      end_time: string | null;
      done: number;
      completed_at: string | null;
      created_at: string;
    }>("SELECT * FROM tasks WHERE id = ?;", [taskId]);

    if (!row) throw new Error("Task not found");

    updatedTask = {
      id: row.id,
      title: row.title,
      notes: row.notes,
      category: row.category as TaskCategory,
      date: row.date,
      startTime: row.start_time,
      endTime: row.end_time,
      done: Boolean(row.done),
      completedAt: row.completed_at,
      createdAt: row.created_at,
    };

    // 2. Sync links if provided
    if (input.links !== undefined) {
      await db.runAsync("DELETE FROM task_links WHERE task_id = ?;", [taskId]);

      let linkPos = 0;
      for (const link of input.links) {
        const linkId = link.id || generateId();
        const kind = link.kind || "video";
        const watched = link.watched ? 1 : 0;
        const linkCreatedAt = link.createdAt || now;

        await db.runAsync(
          `INSERT INTO task_links (
            id, task_id, url, kind, external_id, title, thumbnail_url,
            watched, watched_till_seconds, note, playlist_total, playlist_done,
            position, duration_seconds, parent_link_id, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            linkId,
            taskId,
            link.url,
            kind,
            link.externalId ?? null,
            link.title ?? null,
            link.thumbnailUrl ?? null,
            watched,
            link.watchedTillSeconds ?? null,
            link.note ?? null,
            link.playlistTotal ?? null,
            link.playlistDone ?? null,
            link.position ?? linkPos,
            link.durationSeconds ?? null,
            link.parentLinkId ?? null,
            linkCreatedAt,
          ]
        );
        linkPos++;
      }
    }
  });

  return updatedTask!;
}
