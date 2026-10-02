import {
  type BackupPayload,
  type ValidationResult,
  BACKUP_SCHEMA_VERSION,
  BACKUP_APP_NAME,
  USER_PREFERENCES_KEYS,
} from "./types";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Pure validation engine for Streakly backups.
 */
export function validateBackupPayload(rawJson: string): ValidationResult {
  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { valid: false, error: "Invalid JSON file format" };
  }

  if (!parsed || typeof parsed !== "object") {
    return { valid: false, error: "Backup file is empty or corrupted" };
  }

  if (parsed.app !== BACKUP_APP_NAME) {
    return {
      valid: false,
      error: `Invalid backup source. Expected '${BACKUP_APP_NAME}', received '${parsed.app || "unknown"}'`,
    };
  }

  if (typeof parsed.schemaVersion !== "number") {
    return { valid: false, error: "Missing schema version in backup" };
  }

  if (parsed.schemaVersion > BACKUP_SCHEMA_VERSION) {
    return {
      valid: false,
      error: `This backup was created with a newer version of Streakly (schema v${parsed.schemaVersion}). Please update your app.`,
    };
  }

  if (!parsed.data || typeof parsed.data !== "object") {
    return { valid: false, error: "Corrupted data payload in backup" };
  }

  const { data } = parsed;
  const habits = Array.isArray(data.habits) ? data.habits : [];
  const completions = Array.isArray(data.habitCompletions) ? data.habitCompletions : [];
  const freezes = Array.isArray(data.habitFreezes) ? data.habitFreezes : [];
  const tasks = Array.isArray(data.tasks) ? data.tasks : [];
  const checklist = Array.isArray(data.taskChecklistItems) ? data.taskChecklistItems : [];
  const links = Array.isArray(data.taskLinks) ? data.taskLinks : [];
  const focus = Array.isArray(data.focusSessions) ? data.focusSessions : [];
  const rawSettings = data.settings && typeof data.settings === "object" ? data.settings : {};

  // Habit validation and duplicate id elimination
  const habitIds = new Set<string>();
  const cleanHabits: Record<string, any>[] = [];
  for (const h of habits) {
    if (h && typeof h.id === "string" && h.name && !habitIds.has(h.id)) {
      habitIds.add(h.id);
      cleanHabits.push({
        id: String(h.id).slice(0, 100),
        name: String(h.name).slice(0, 150),
        icon: String(h.icon || "star").slice(0, 50),
        color: String(h.color || "lime").slice(0, 30),
        frequency_type: h.frequency_type === "weekly" ? "weekly" : "daily",
        weekdays: h.weekdays ? String(h.weekdays).slice(0, 50) : null,
        times_per_week: typeof h.times_per_week === "number" ? h.times_per_week : null,
        reminder_time: h.reminder_time ? String(h.reminder_time).slice(0, 10) : null,
        created_at: String(h.created_at || new Date().toISOString()),
        archived_at: h.archived_at ? String(h.archived_at) : null,
      });
    }
  }

  // Filter completions by referential integrity
  const cleanCompletions = completions.filter((c: any) => {
    return (
      c &&
      typeof c.id === "string" &&
      typeof c.habit_id === "string" &&
      habitIds.has(c.habit_id) &&
      typeof c.date === "string" &&
      DATE_REGEX.test(c.date)
    );
  });

  // Filter freezes by referential integrity
  const cleanFreezes = freezes.filter((f: any) => {
    return (
      f &&
      typeof f.habit_id === "string" &&
      habitIds.has(f.habit_id) &&
      typeof f.date === "string" &&
      DATE_REGEX.test(f.date)
    );
  });

  // Task validation and duplicate id elimination
  const taskIds = new Set<string>();
  const cleanTasks: Record<string, any>[] = [];
  for (const t of tasks) {
    if (t && typeof t.id === "string" && t.title && !taskIds.has(t.id)) {
      taskIds.add(t.id);
      cleanTasks.push({
        id: String(t.id).slice(0, 100),
        title: String(t.title).slice(0, 200),
        notes: t.notes ? String(t.notes).slice(0, 2000) : null,
        category: String(t.category || "General").slice(0, 50),
        date: String(t.date || "").slice(0, 10),
        start_time: t.start_time ? String(t.start_time).slice(0, 10) : null,
        end_time: t.end_time ? String(t.end_time).slice(0, 10) : null,
        done: t.done ? 1 : 0,
        completed_at: t.completed_at ? String(t.completed_at) : null,
        created_at: String(t.created_at || new Date().toISOString()),
      });
    }
  }

  // Filter checklist items and links
  const cleanChecklist = checklist.filter((item: any) => {
    return item && typeof item.id === "string" && typeof item.task_id === "string" && taskIds.has(item.task_id);
  });

  const validLinkIds = new Set<string>();
  for (const l of links) {
    if (l && typeof l.id === "string" && typeof l.task_id === "string" && taskIds.has(l.task_id)) {
      validLinkIds.add(l.id);
    }
  }

  const cleanLinks = links
    .filter((l: any) => l && typeof l.id === "string" && typeof l.task_id === "string" && taskIds.has(l.task_id))
    .map((l: any) => ({
      ...l,
      position: typeof l.position === "number" ? l.position : null,
      duration_seconds: typeof l.duration_seconds === "number" ? l.duration_seconds : null,
      parent_link_id: typeof l.parent_link_id === "string" && validLinkIds.has(l.parent_link_id) ? l.parent_link_id : null,
    }));

  // Focus sessions: map orphan task_ids to null
  const cleanFocus = focus.map((f: any) => ({
    id: String(f.id || "").slice(0, 100),
    task_id: f.task_id && taskIds.has(f.task_id) ? f.task_id : null,
    category: String(f.category || "General").slice(0, 50),
    started_at: String(f.started_at || new Date().toISOString()),
    duration_seconds: typeof f.duration_seconds === "number" ? Math.max(0, f.duration_seconds) : 0,
    completed: f.completed ? 1 : 0,
  }));

  // Clean settings: retain only user preference keys
  const cleanSettings: Record<string, string> = {};
  for (const k of USER_PREFERENCES_KEYS) {
    if (typeof rawSettings[k] === "string") {
      cleanSettings[k] = rawSettings[k];
    }
  }

  const payload: BackupPayload = {
    app: BACKUP_APP_NAME,
    schemaVersion: parsed.schemaVersion,
    appVersion: String(parsed.appVersion || "1.0.0"),
    exportedAt: String(parsed.exportedAt || new Date().toISOString()),
    counts: {
      habits: cleanHabits.length,
      habitCompletions: cleanCompletions.length,
      habitFreezes: cleanFreezes.length,
      tasks: cleanTasks.length,
      taskChecklistItems: cleanChecklist.length,
      taskLinks: cleanLinks.length,
      focusSessions: cleanFocus.length,
    },
    data: {
      habits: cleanHabits, habitCompletions: cleanCompletions, habitFreezes: cleanFreezes,
      tasks: cleanTasks, taskChecklistItems: cleanChecklist, taskLinks: cleanLinks,
      focusSessions: cleanFocus, settings: cleanSettings,
    },
  };

  return {
    valid: true,
    counts: payload.counts,
    exportedAt: payload.exportedAt,
    payload,
  };
}
