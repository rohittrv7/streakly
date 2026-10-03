import { getDb } from "@/lib/db/client";
import { generateId } from "@/core/utils/id";
import type { Task, TaskCategory, TaskChecklistItem } from "./types";
import type { TaskLink } from "@/features/youtube/types";
import type { TaskLinkInput } from "@/features/youtube/repo";

export type StagedTaskLinkInput = Omit<TaskLinkInput, "taskId"> & { taskId?: string };

export interface CreateTaskWithLinksInput {
  title: string;
  notes?: string | null;
  category: TaskCategory;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  checklist?: Array<{ text: string }>;
  links?: StagedTaskLinkInput[];
}

export interface CreateTaskResult {
  task: Task;
  checklist: TaskChecklistItem[];
  links: TaskLink[];
}

export async function createTaskWithLinksTransaction(
  input: CreateTaskWithLinksInput
): Promise<CreateTaskResult> {
  const db = await getDb();
  const taskId = generateId();
  const createdAt = new Date().toISOString();

  let createdTask: Task;
  const createdChecklist: TaskChecklistItem[] = [];
  const createdLinks: TaskLink[] = [];

  await db.withTransactionAsync(async () => {
    // 1. Insert task
    await db.runAsync(
      `INSERT INTO tasks (
        id, title, notes, category, date, start_time, end_time, done, completed_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL, ?);`,
      [
        taskId,
        input.title,
        input.notes ?? null,
        input.category,
        input.date,
        input.startTime ?? null,
        input.endTime ?? null,
        createdAt,
      ]
    );

    createdTask = {
      id: taskId,
      title: input.title,
      notes: input.notes ?? null,
      category: input.category,
      date: input.date,
      startTime: input.startTime ?? null,
      endTime: input.endTime ?? null,
      done: false,
      completedAt: null,
      createdAt,
    };

    // 2. Insert checklist
    if (input.checklist && input.checklist.length > 0) {
      let pos = 0;
      for (const item of input.checklist) {
        if (!item.text.trim()) continue;
        const itemId = generateId();
        await db.runAsync(
          "INSERT INTO task_checklist_items (id, task_id, text, done, position) VALUES (?, ?, ?, 0, ?);",
          [itemId, taskId, item.text.trim(), pos]
        );
        createdChecklist.push({
          id: itemId,
          taskId,
          text: item.text.trim(),
          done: false,
          position: pos,
        });
        pos++;
      }
    }

    // 3. Insert links
    if (input.links && input.links.length > 0) {
      let linkPos = 0;
      for (const link of input.links) {
        const linkId = link.id || generateId();
        const kind = link.kind || "video";
        const watched = link.watched ? 1 : 0;
        const linkCreatedAt = link.createdAt || createdAt;

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

        createdLinks.push({
          id: linkId,
          taskId,
          url: link.url,
          kind,
          externalId: link.externalId ?? null,
          title: link.title ?? null,
          thumbnailUrl: link.thumbnailUrl ?? null,
          watched: Boolean(link.watched),
          watchedTillSeconds: link.watchedTillSeconds ?? null,
          note: link.note ?? null,
          playlistTotal: link.playlistTotal ?? null,
          playlistDone: link.playlistDone ?? null,
          position: link.position ?? linkPos,
          durationSeconds: link.durationSeconds ?? null,
          parentLinkId: link.parentLinkId ?? null,
          createdAt: linkCreatedAt,
        });
        linkPos++;
      }
    }
  });

  return {
    task: createdTask!,
    checklist: createdChecklist,
    links: createdLinks,
  };
}
