export const BACKUP_SCHEMA_VERSION = 2;
export const BACKUP_APP_NAME = "streakly";

export const USER_PREFERENCES_KEYS = [
  "accent_color",
  "app_language",
  "haptics_enabled",
  "notification_settings",
  "focus_settings",
] as const;

export type UserPreferenceKey = (typeof USER_PREFERENCES_KEYS)[number];

export interface BackupCounts {
  habits: number;
  habitCompletions: number;
  habitFreezes: number;
  tasks: number;
  taskChecklistItems: number;
  taskLinks: number;
  focusSessions: number;
}

export interface BackupPayload {
  app: typeof BACKUP_APP_NAME;
  schemaVersion: number;
  appVersion: string;
  exportedAt: string;
  counts: BackupCounts;
  data: {
    habits: Record<string, any>[];
    habitCompletions: Record<string, any>[];
    habitFreezes: Record<string, any>[];
    tasks: Record<string, any>[];
    taskChecklistItems: Record<string, any>[];
    taskLinks: Record<string, any>[];
    focusSessions: Record<string, any>[];
    settings: Record<string, string>;
  };
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  counts?: BackupCounts;
  exportedAt?: string;
  payload?: BackupPayload;
}
