import { getDb } from "@/lib/db/client";
import { generateId } from "@/core/utils/id";
import type { TaskCategory } from "@/features/planner/types";
import type { DayPlan } from "./types";

export interface SavePlanInput {
  days: DayPlan[];
  playlistTitle: string;
  playlistId: string;
  category: TaskCategory;
  startTime?: string | null;
}

export async function savePlaylistPlan(input: SavePlanInput): Promise<string[]> {
  const { days, playlistTitle, playlistId, category, startTime } = input;
  if (days.length === 0) return [];

  const db = await getDb();
  const createdTaskIds: string[] = [];

  await db.withTransactionAsync(async () => {
    for (const day of days) {
      const taskId = generateId();
      createdTaskIds.push(taskId);
      const createdAt = new Date().toISOString();
      const taskTitle = `${playlistTitle} - Day ${day.dayIndex}/${day.totalDays}`;

      // 1. Insert Task
      await db.runAsync(
        `INSERT INTO tasks (
          id, title, notes, category, date, start_time, end_time, done, completed_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [taskId, taskTitle, null, category, day.date, startTime ?? null, null, 0, null, createdAt]
      );

      // 2. Insert Playlist Container Link
      const containerLinkId = generateId();
      await db.runAsync(
        `INSERT INTO task_links (
          id, task_id, url, kind, external_id, title, thumbnail_url,
          watched, watched_till_seconds, note, playlist_total, playlist_done,
          created_at, position, duration_seconds, parent_link_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          containerLinkId,
          taskId,
          `https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}`,
          "playlist",
          playlistId,
          playlistTitle,
          day.videos[0]?.thumbnailUrl ?? null,
          0,
          null,
          null,
          day.videos.length,
          0,
          createdAt,
          null,
          day.totalDurationSeconds,
          null,
        ]
      );

      // 3. Insert Child Video Links
      for (const v of day.videos) {
        const childId = generateId();
        await db.runAsync(
          `INSERT INTO task_links (
            id, task_id, url, kind, external_id, title, thumbnail_url,
            watched, watched_till_seconds, note, playlist_total, playlist_done,
            created_at, position, duration_seconds, parent_link_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            childId,
            taskId,
            `https://www.youtube.com/watch?v=${v.videoId}&list=${encodeURIComponent(playlistId)}&index=${v.position}`,
            "video",
            v.videoId,
            v.title,
            v.thumbnailUrl,
            0,
            null,
            null,
            null,
            null,
            createdAt,
            v.position,
            v.durationSeconds,
            containerLinkId,
          ]
        );
      }
    }
  });

  return createdTaskIds;
}
