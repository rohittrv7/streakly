import { getDb } from "@/lib/db/client";
import { useHabitsStore } from "@/features/habits/store";
import { usePlannerStore } from "@/features/planner/store";
import { useAccentStore } from "@/lib/theme/store";
import { useLanguageStore } from "@/core/i18n/store";
import { getNotifications } from "@/lib/notifications/native";

/**
 * Wipes all user data tables and settings in a single transaction,
 * cancels all notifications, resets in-memory stores, and returns the app
 * to a clean first-run state without re-seeding demo data.
 */
export async function deleteAllData(): Promise<{ success: boolean; error?: string }> {
  try {
    const db = await getDb();

    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        DELETE FROM habit_freezes;
        DELETE FROM habit_completions;
        DELETE FROM task_checklist_items;
        DELETE FROM task_links;
        DELETE FROM focus_sessions;
        DELETE FROM habits;
        DELETE FROM tasks;
        DELETE FROM settings;
      `);
    });

    // Cancel all scheduled notifications
    const Notifications = getNotifications();
    if (Notifications) {
      try {
        await Notifications.cancelAllScheduledNotificationsAsync();
      } catch {
        // ignore
      }
    }

    // Reset all stores to clean empty state
    await Promise.all([
      useHabitsStore.getState().load(),
      usePlannerStore.getState().loadCurrentMonth(),
      useAccentStore.getState().loadAccent(),
      useLanguageStore.getState().loadLanguage(),
    ]);

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete data";
    return { success: false, error: message };
  }
}
