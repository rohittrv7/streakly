import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import Constants from "expo-constants";
import { getDb } from "@/lib/db/client";
import {
  type BackupPayload,
  type BackupCounts,
  BACKUP_APP_NAME,
  BACKUP_SCHEMA_VERSION,
  USER_PREFERENCES_KEYS,
} from "./types";

export interface ExportResult {
  success: boolean;
  counts?: BackupCounts;
  filePath?: string;
  error?: string;
}

export async function exportBackupData(): Promise<ExportResult> {
  try {
    const db = await getDb();

    const habits = await db.getAllAsync<Record<string, unknown>>("SELECT * FROM habits ORDER BY created_at ASC;");
    const habitCompletions = await db.getAllAsync<Record<string, unknown>>("SELECT * FROM habit_completions;");
    const habitFreezes = await db.getAllAsync<Record<string, unknown>>("SELECT * FROM habit_freezes;");
    const tasks = await db.getAllAsync<Record<string, unknown>>("SELECT * FROM tasks ORDER BY created_at ASC;");
    const taskChecklistItems = await db.getAllAsync<Record<string, unknown>>("SELECT * FROM task_checklist_items;");
    const taskLinks = await db.getAllAsync<Record<string, unknown>>("SELECT * FROM task_links;");
    const focusSessions = await db.getAllAsync<Record<string, unknown>>("SELECT * FROM focus_sessions;");

    const settingsRows = await db.getAllAsync<{ key: string; value: string }>(
      "SELECT key, value FROM settings;"
    );

    const userSettings: Record<string, string> = {};
    for (const r of settingsRows) {
      if ((USER_PREFERENCES_KEYS as readonly string[]).includes(r.key)) {
        userSettings[r.key] = r.value;
      }
    }

    const counts: BackupCounts = {
      habits: habits.length,
      habitCompletions: habitCompletions.length,
      habitFreezes: habitFreezes.length,
      tasks: tasks.length,
      taskChecklistItems: taskChecklistItems.length,
      taskLinks: taskLinks.length,
      focusSessions: focusSessions.length,
    };

    const payload: BackupPayload = {
      app: BACKUP_APP_NAME,
      schemaVersion: BACKUP_SCHEMA_VERSION,
      appVersion: Constants.expoConfig?.version || "1.0.0",
      exportedAt: new Date().toISOString(),
      counts,
      data: {
        habits,
        habitCompletions,
        habitFreezes,
        tasks,
        taskChecklistItems,
        taskLinks,
        focusSessions,
        settings: userSettings,
      },
    };

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `streakly-backup-${dateStr}.json`;
    const baseDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || "";
    const filePath = `${baseDir}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(payload, null, 2), {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: "application/json",
        dialogTitle: "Export Streakly Backup",
        UTI: "public.json",
      });
    }

    return { success: true, counts, filePath };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to export backup" };
  }
}
