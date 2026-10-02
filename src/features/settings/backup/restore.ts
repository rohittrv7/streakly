import { getDb } from "@/lib/db/client";
import { type BackupPayload, USER_PREFERENCES_KEYS } from "./types";
import { useHabitsStore } from "@/features/habits/store";
import { usePlannerStore } from "@/features/planner/store";
import { useAccentStore } from "@/lib/theme/store";
import { useLanguageStore } from "@/core/i18n/store";
import { requestNotificationReconcile } from "@/lib/notifications/reconcile";

export async function executeRestore(payload: BackupPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb();

    // Execute atomic replacement in a single SQLite transaction
    await db.withTransactionAsync(async () => {
      // 1. Wipe current tables (children first, then parents)
      await db.execAsync(`
        DELETE FROM habit_freezes;
        DELETE FROM habit_completions;
        DELETE FROM task_checklist_items;
        DELETE FROM task_links;
        DELETE FROM focus_sessions;
        DELETE FROM habits;
        DELETE FROM tasks;
      `);

      // 2. Insert habits
      for (const h of payload.data.habits) {
        await db.runAsync(
          `INSERT INTO habits (id, name, icon, color, frequency_type, weekdays, times_per_week, reminder_time, created_at, archived_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [h.id, h.name, h.icon, h.color, h.frequency_type, h.weekdays, h.times_per_week, h.reminder_time, h.created_at, h.archived_at]
        );
      }

      // 3. Insert habit completions
      for (const c of payload.data.habitCompletions) {
        await db.runAsync(
          `INSERT INTO habit_completions (id, habit_id, date, created_at)
           VALUES (?, ?, ?, ?);`,
          [c.id, c.habit_id, c.date, c.created_at]
        );
      }

      // 4. Insert habit freezes
      for (const f of payload.data.habitFreezes) {
        await db.runAsync(
          `INSERT INTO habit_freezes (habit_id, date, created_at)
           VALUES (?, ?, ?);`,
          [f.habit_id, f.date, f.created_at]
        );
      }

      // 5. Insert tasks
      for (const t of payload.data.tasks) {
        await db.runAsync(
          `INSERT INTO tasks (id, title, notes, category, date, start_time, end_time, done, completed_at, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [t.id, t.title, t.notes, t.category, t.date, t.start_time, t.end_time, t.done, t.completed_at, t.created_at]
        );
      }

      // 6. Insert task checklist items
      for (const item of payload.data.taskChecklistItems) {
        await db.runAsync(
          `INSERT INTO task_checklist_items (id, task_id, text, done, position)
           VALUES (?, ?, ?, ?, ?);`,
          [item.id, item.task_id, item.text, item.done, item.position]
        );
      }

      // 7. Insert task links
      for (const l of payload.data.taskLinks) {
        await db.runAsync(
          `INSERT INTO task_links (id, task_id, url, kind, external_id, title, thumbnail_url, watched, watched_till_seconds, note, playlist_total, playlist_done, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [l.id, l.task_id, l.url, l.kind, l.external_id, l.title, l.thumbnail_url, l.watched, l.watched_till_seconds, l.note, l.playlist_total, l.playlist_done, l.created_at]
        );
      }

      // 8. Insert focus sessions
      for (const s of payload.data.focusSessions) {
        await db.runAsync(
          `INSERT INTO focus_sessions (id, task_id, category, started_at, duration_seconds, completed)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [s.id, s.task_id, s.category, s.started_at, s.duration_seconds, s.completed]
        );
      }

      // 9. Update user settings
      for (const [key, val] of Object.entries(payload.data.settings)) {
        if ((USER_PREFERENCES_KEYS as readonly string[]).includes(key)) {
          await db.runAsync(
            `INSERT INTO settings (key, value) VALUES (?, ?)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value;`,
            [key, val]
          );
        }
      }
    });

    // Reload stores and reconcile notifications
    await Promise.all([
      useHabitsStore.getState().load(),
      usePlannerStore.getState().loadCurrentMonth(),
      useAccentStore.getState().loadAccent(),
      useLanguageStore.getState().loadLanguage(),
    ]);

    requestNotificationReconcile(100);

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to restore backup";
    return { success: false, error: message };
  }
}
