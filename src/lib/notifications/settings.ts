import { create } from "zustand";
import { settingsRepo } from "@/features/settings/repo";
import type { NotificationSettings, TaskLeadMinutes } from "./types";

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  habitReminders: true,
  taskReminders: true,
  taskLeadMinutes: 10,
  eveningNudge: true,
  eveningNudgeTime: "21:00",
  morningBriefing: false,
  morningBriefingTime: "08:00",
  quietHoursEnabled: true,
  quietHoursStart: "22:30",
  quietHoursEnd: "07:00",
};

const SETTINGS_KEYS = {
  enabled: "notification_enabled",
  habitReminders: "notification_habit_reminders",
  taskReminders: "notification_task_reminders",
  taskLeadMinutes: "notification_task_lead_minutes",
  eveningNudge: "notification_evening_nudge",
  eveningNudgeTime: "notification_evening_nudge_time",
  morningBriefing: "notification_morning_briefing",
  morningBriefingTime: "notification_morning_briefing_time",
  quietHoursEnabled: "notification_quiet_hours_enabled",
  quietHoursStart: "notification_quiet_hours_start",
  quietHoursEnd: "notification_quiet_hours_end",
  lastAppOpen: "notification_last_app_open",
} as const;

function clampLeadMinutes(val: number): TaskLeadMinutes {
  if (val === 0 || val === 5 || val === 10 || val === 30) return val;
  return 10;
}

export async function loadNotificationSettings(): Promise<NotificationSettings> {
  const [
    enabled,
    habitReminders,
    taskReminders,
    taskLeadMinutes,
    eveningNudge,
    eveningNudgeTime,
    morningBriefing,
    morningBriefingTime,
    quietHoursEnabled,
    quietHoursStart,
    quietHoursEnd,
  ] = await Promise.all([
    settingsRepo.get(SETTINGS_KEYS.enabled),
    settingsRepo.get(SETTINGS_KEYS.habitReminders),
    settingsRepo.get(SETTINGS_KEYS.taskReminders),
    settingsRepo.get(SETTINGS_KEYS.taskLeadMinutes),
    settingsRepo.get(SETTINGS_KEYS.eveningNudge),
    settingsRepo.get(SETTINGS_KEYS.eveningNudgeTime),
    settingsRepo.get(SETTINGS_KEYS.morningBriefing),
    settingsRepo.get(SETTINGS_KEYS.morningBriefingTime),
    settingsRepo.get(SETTINGS_KEYS.quietHoursEnabled),
    settingsRepo.get(SETTINGS_KEYS.quietHoursStart),
    settingsRepo.get(SETTINGS_KEYS.quietHoursEnd),
  ]);

  return {
    enabled: enabled !== null ? enabled === "true" : DEFAULT_NOTIFICATION_SETTINGS.enabled,
    habitReminders:
      habitReminders !== null ? habitReminders === "true" : DEFAULT_NOTIFICATION_SETTINGS.habitReminders,
    taskReminders:
      taskReminders !== null ? taskReminders === "true" : DEFAULT_NOTIFICATION_SETTINGS.taskReminders,
    taskLeadMinutes:
      taskLeadMinutes !== null
        ? clampLeadMinutes(parseInt(taskLeadMinutes, 10))
        : DEFAULT_NOTIFICATION_SETTINGS.taskLeadMinutes,
    eveningNudge:
      eveningNudge !== null ? eveningNudge === "true" : DEFAULT_NOTIFICATION_SETTINGS.eveningNudge,
    eveningNudgeTime: eveningNudgeTime || DEFAULT_NOTIFICATION_SETTINGS.eveningNudgeTime,
    morningBriefing:
      morningBriefing !== null ? morningBriefing === "true" : DEFAULT_NOTIFICATION_SETTINGS.morningBriefing,
    morningBriefingTime:
      morningBriefingTime || DEFAULT_NOTIFICATION_SETTINGS.morningBriefingTime,
    quietHoursEnabled:
      quietHoursEnabled !== null
        ? quietHoursEnabled === "true"
        : DEFAULT_NOTIFICATION_SETTINGS.quietHoursEnabled,
    quietHoursStart: quietHoursStart || DEFAULT_NOTIFICATION_SETTINGS.quietHoursStart,
    quietHoursEnd: quietHoursEnd || DEFAULT_NOTIFICATION_SETTINGS.quietHoursEnd,
  };
}

export async function saveNotificationSettings(
  updates: Partial<NotificationSettings>
): Promise<void> {
  const promises: Promise<void>[] = [];
  if (updates.enabled !== undefined) {
    promises.push(settingsRepo.set(SETTINGS_KEYS.enabled, String(updates.enabled)));
  }
  if (updates.habitReminders !== undefined) {
    promises.push(settingsRepo.set(SETTINGS_KEYS.habitReminders, String(updates.habitReminders)));
  }
  if (updates.taskReminders !== undefined) {
    promises.push(settingsRepo.set(SETTINGS_KEYS.taskReminders, String(updates.taskReminders)));
  }
  if (updates.taskLeadMinutes !== undefined) {
    promises.push(settingsRepo.set(SETTINGS_KEYS.taskLeadMinutes, String(updates.taskLeadMinutes)));
  }
  if (updates.eveningNudge !== undefined) {
    promises.push(settingsRepo.set(SETTINGS_KEYS.eveningNudge, String(updates.eveningNudge)));
  }
  if (updates.eveningNudgeTime !== undefined) {
    promises.push(settingsRepo.set(SETTINGS_KEYS.eveningNudgeTime, updates.eveningNudgeTime));
  }
  if (updates.morningBriefing !== undefined) {
    promises.push(settingsRepo.set(SETTINGS_KEYS.morningBriefing, String(updates.morningBriefing)));
  }
  if (updates.morningBriefingTime !== undefined) {
    promises.push(settingsRepo.set(SETTINGS_KEYS.morningBriefingTime, updates.morningBriefingTime));
  }
  if (updates.quietHoursEnabled !== undefined) {
    promises.push(settingsRepo.set(SETTINGS_KEYS.quietHoursEnabled, String(updates.quietHoursEnabled)));
  }
  if (updates.quietHoursStart !== undefined) {
    promises.push(settingsRepo.set(SETTINGS_KEYS.quietHoursStart, updates.quietHoursStart));
  }
  if (updates.quietHoursEnd !== undefined) {
    promises.push(settingsRepo.set(SETTINGS_KEYS.quietHoursEnd, updates.quietHoursEnd));
  }
  await Promise.all(promises);
}

export async function recordAppOpen(): Promise<string> {
  const now = new Date().toISOString();
  await settingsRepo.set(SETTINGS_KEYS.lastAppOpen, now);
  return now;
}

export async function getLastAppOpen(): Promise<string | null> {
  return settingsRepo.get(SETTINGS_KEYS.lastAppOpen);
}

interface NotificationStoreState {
  settings: NotificationSettings;
  loading: boolean;
  load: () => Promise<void>;
  update: (updates: Partial<NotificationSettings>) => Promise<void>;
}

export const useNotificationSettingsStore = create<NotificationStoreState>((set, get) => ({
  settings: DEFAULT_NOTIFICATION_SETTINGS,
  loading: true,
  load: async () => {
    const s = await loadNotificationSettings();
    set({ settings: s, loading: false });
  },
  update: async (updates) => {
    const next = { ...get().settings, ...updates };
    set({ settings: next });
    await saveNotificationSettings(updates);
  },
}));

export function useNotificationSettings() {
  const settings = useNotificationSettingsStore((s) => s.settings);
  const loading = useNotificationSettingsStore((s) => s.loading);
  const update = useNotificationSettingsStore((s) => s.update);
  return { settings, loading, updateSettings: update };
}
