import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { getDb } from "@/lib/db/client";
import { validateBackupPayload } from "./validate";
import { type BackupPayload, type ValidationResult, USER_PREFERENCES_KEYS } from "./types";
import { executeRestore } from "./restore";

export { executeRestore };

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const SNAPSHOT_FILE_NAME = "streakly-pre-import-snapshot.json";

let snapshotTimestamp: number | null = null;
let lastSnapshotPayload: BackupPayload | null = null;

export async function pickAndValidateBackupFile(): Promise<{
  fileUri?: string;
  validation: ValidationResult;
}> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["application/json", "text/plain", "*/*"],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return { validation: { valid: false, error: "File selection was cancelled" } };
  }

  const asset = result.assets[0];
  if (asset.size && asset.size > MAX_FILE_SIZE_BYTES) {
    return { validation: { valid: false, error: "File is too large (max 10MB allowed)" } };
  }

  const content = await FileSystem.readAsStringAsync(asset.uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const validation = validateBackupPayload(content);
  return { fileUri: asset.uri, validation };
}

export async function createSafetySnapshot(): Promise<boolean> {
  try {
    const db = await getDb();
    const habits = await db.getAllAsync<Record<string, unknown>>("SELECT * FROM habits;");
    const habitCompletions = await db.getAllAsync<Record<string, unknown>>("SELECT * FROM habit_completions;");
    const habitFreezes = await db.getAllAsync<Record<string, unknown>>("SELECT * FROM habit_freezes;");
    const tasks = await db.getAllAsync<Record<string, unknown>>("SELECT * FROM tasks;");
    const taskChecklistItems = await db.getAllAsync<Record<string, unknown>>("SELECT * FROM task_checklist_items;");
    const taskLinks = await db.getAllAsync<Record<string, unknown>>("SELECT * FROM task_links;");
    const focusSessions = await db.getAllAsync<Record<string, unknown>>("SELECT * FROM focus_sessions;");
    const settings = await db.getAllAsync<{ key: string; value: string }>("SELECT * FROM settings;");

    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      if ((USER_PREFERENCES_KEYS as readonly string[]).includes(s.key)) {
        settingsMap[s.key] = s.value;
      }
    }

    const payload: BackupPayload = {
      app: "streakly",
      schemaVersion: 1,
      appVersion: "1.0.0",
      exportedAt: new Date().toISOString(),
      counts: {
        habits: habits.length,
        habitCompletions: habitCompletions.length,
        habitFreezes: habitFreezes.length,
        tasks: tasks.length,
        taskChecklistItems: taskChecklistItems.length,
        taskLinks: taskLinks.length,
        focusSessions: focusSessions.length,
      },
      data: {
        habits,
        habitCompletions,
        habitFreezes,
        tasks,
        taskChecklistItems,
        taskLinks,
        focusSessions,
        settings: settingsMap,
      },
    };

    lastSnapshotPayload = payload;
    snapshotTimestamp = Date.now();

    const path = `${FileSystem.documentDirectory || ""}${SNAPSHOT_FILE_NAME}`;
    await FileSystem.writeAsStringAsync(path, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function canUndoImport(): boolean {
  if (!snapshotTimestamp || !lastSnapshotPayload) return false;
  const TEN_MINUTES_MS = 10 * 60 * 1000;
  return Date.now() - snapshotTimestamp < TEN_MINUTES_MS;
}

export async function undoLastImport(): Promise<{ success: boolean; error?: string }> {
  if (!lastSnapshotPayload) {
    return { success: false, error: "No snapshot available to undo" };
  }
  const res = await executeRestore(lastSnapshotPayload);
  if (res.success) {
    lastSnapshotPayload = null;
    snapshotTimestamp = null;
  }
  return res;
}
