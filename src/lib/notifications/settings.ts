import { create } from "zustand";
import { settingsRepo } from "@/features/settings/repo";
import type { NotificationSettings } from "./types";
import {
  clampHabitLeadMinutes,
  clampTaskLeadMinutes,
  clampOverdueDelayMinutes,
  clampTone,
  clampFocusEndSound,
} from "./settings-clamp";

export * from "./settings-clamp";

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  habitReminders: true,
  habitLeadMinutes: 5,
  alsoNotifyAtExactTime: true,
  taskReminders: true,
  taskLeadMinutes: 5,
  overdueNudge: true,
  overdueDelayMinutes: 60,
  streakBrokenMessage: true,
  tone: "friendly",
  focusEndSound: "alarm",
  focusRepeatReminders: true,
  eveningNudge: true,
  eveningNudgeTime: "21:00",
  morningBriefing: false,
  morningBriefingTime: "08:00",
  quietHoursEnabled: true,
  quietHoursStart: "22:30",
  quietHoursEnd: "07:00",
};

const K = {
  enabled: "notification_enabled",
  habitReminders: "notification_habit_reminders",
  habitLeadMinutes: "notification_habit_lead_minutes",
  alsoNotifyAtExactTime: "notification_also_notify_at_exact_time",
  taskReminders: "notification_task_reminders",
  taskLeadMinutes: "notification_task_lead_minutes",
  overdueNudge: "notification_overdue_nudge",
  overdueDelayMinutes: "notification_overdue_delay_minutes",
  streakBrokenMessage: "notification_streak_broken_message",
  tone: "notification_tone",
  focusEndSound: "notification_focus_end_sound",
  focusRepeatReminders: "notification_focus_repeat_reminders",
  eveningNudge: "notification_evening_nudge",
  eveningNudgeTime: "notification_evening_nudge_time",
  morningBriefing: "notification_morning_briefing",
  morningBriefingTime: "notification_morning_briefing_time",
  quietHoursEnabled: "notification_quiet_hours_enabled",
  quietHoursStart: "notification_quiet_hours_start",
  quietHoursEnd: "notification_quiet_hours_end",
  lastAppOpen: "notification_last_app_open",
} as const;

export async function loadNotificationSettings(): Promise<NotificationSettings> {
  const [
    enabled, habitRem, habitLead, alsoExact, taskRem, taskLead,
    overdue, overdueDelay, streakBroken, tone, focusSound, focusRepeat,
    eveNudge, eveTime, mornBrief, mornTime, quietEnabled, quietStart, quietEnd,
  ] = await Promise.all([
    settingsRepo.get(K.enabled), settingsRepo.get(K.habitReminders),
    settingsRepo.get(K.habitLeadMinutes), settingsRepo.get(K.alsoNotifyAtExactTime),
    settingsRepo.get(K.taskReminders), settingsRepo.get(K.taskLeadMinutes),
    settingsRepo.get(K.overdueNudge), settingsRepo.get(K.overdueDelayMinutes),
    settingsRepo.get(K.streakBrokenMessage), settingsRepo.get(K.tone),
    settingsRepo.get(K.focusEndSound), settingsRepo.get(K.focusRepeatReminders),
    settingsRepo.get(K.eveningNudge), settingsRepo.get(K.eveningNudgeTime),
    settingsRepo.get(K.morningBriefing), settingsRepo.get(K.morningBriefingTime),
    settingsRepo.get(K.quietHoursEnabled), settingsRepo.get(K.quietHoursStart),
    settingsRepo.get(K.quietHoursEnd),
  ]);

  return {
    enabled: enabled !== null ? enabled === "true" : DEFAULT_NOTIFICATION_SETTINGS.enabled,
    habitReminders: habitRem !== null ? habitRem === "true" : DEFAULT_NOTIFICATION_SETTINGS.habitReminders,
    habitLeadMinutes: habitLead !== null ? clampHabitLeadMinutes(habitLead) : DEFAULT_NOTIFICATION_SETTINGS.habitLeadMinutes,
    alsoNotifyAtExactTime: alsoExact !== null ? alsoExact === "true" : DEFAULT_NOTIFICATION_SETTINGS.alsoNotifyAtExactTime,
    taskReminders: taskRem !== null ? taskRem === "true" : DEFAULT_NOTIFICATION_SETTINGS.taskReminders,
    taskLeadMinutes: taskLead !== null ? clampTaskLeadMinutes(taskLead) : DEFAULT_NOTIFICATION_SETTINGS.taskLeadMinutes,
    overdueNudge: overdue !== null ? overdue === "true" : DEFAULT_NOTIFICATION_SETTINGS.overdueNudge,
    overdueDelayMinutes: overdueDelay !== null ? clampOverdueDelayMinutes(overdueDelay) : DEFAULT_NOTIFICATION_SETTINGS.overdueDelayMinutes,
    streakBrokenMessage: streakBroken !== null ? streakBroken === "true" : DEFAULT_NOTIFICATION_SETTINGS.streakBrokenMessage,
    tone: tone !== null ? clampTone(tone) : DEFAULT_NOTIFICATION_SETTINGS.tone,
    focusEndSound: focusSound !== null ? clampFocusEndSound(focusSound) : DEFAULT_NOTIFICATION_SETTINGS.focusEndSound,
    focusRepeatReminders: focusRepeat !== null ? focusRepeat === "true" : DEFAULT_NOTIFICATION_SETTINGS.focusRepeatReminders,
    eveningNudge: eveNudge !== null ? eveNudge === "true" : DEFAULT_NOTIFICATION_SETTINGS.eveningNudge,
    eveningNudgeTime: eveTime || DEFAULT_NOTIFICATION_SETTINGS.eveningNudgeTime,
    morningBriefing: mornBrief !== null ? mornBrief === "true" : DEFAULT_NOTIFICATION_SETTINGS.morningBriefing,
    morningBriefingTime: mornTime || DEFAULT_NOTIFICATION_SETTINGS.morningBriefingTime,
    quietHoursEnabled: quietEnabled !== null ? quietEnabled === "true" : DEFAULT_NOTIFICATION_SETTINGS.quietHoursEnabled,
    quietHoursStart: quietStart || DEFAULT_NOTIFICATION_SETTINGS.quietHoursStart,
    quietHoursEnd: quietEnd || DEFAULT_NOTIFICATION_SETTINGS.quietHoursEnd,
  };
}

export async function saveNotificationSettings(updates: Partial<NotificationSettings>): Promise<void> {
  const p: Promise<void>[] = [];
  const add = (k: string, v: unknown) => { if (v !== undefined) p.push(settingsRepo.set(k, String(v))); };
  add(K.enabled, updates.enabled);
  add(K.habitReminders, updates.habitReminders);
  add(K.habitLeadMinutes, updates.habitLeadMinutes);
  add(K.alsoNotifyAtExactTime, updates.alsoNotifyAtExactTime);
  add(K.taskReminders, updates.taskReminders);
  add(K.taskLeadMinutes, updates.taskLeadMinutes);
  add(K.overdueNudge, updates.overdueNudge);
  add(K.overdueDelayMinutes, updates.overdueDelayMinutes);
  add(K.streakBrokenMessage, updates.streakBrokenMessage);
  add(K.tone, updates.tone);
  add(K.focusEndSound, updates.focusEndSound);
  add(K.focusRepeatReminders, updates.focusRepeatReminders);
  add(K.eveningNudge, updates.eveningNudge);
  add(K.eveningNudgeTime, updates.eveningNudgeTime);
  add(K.morningBriefing, updates.morningBriefing);
  add(K.morningBriefingTime, updates.morningBriefingTime);
  add(K.quietHoursEnabled, updates.quietHoursEnabled);
  add(K.quietHoursStart, updates.quietHoursStart);
  add(K.quietHoursEnd, updates.quietHoursEnd);
  await Promise.all(p);
}

export async function recordAppOpen(): Promise<string> {
  const now = new Date().toISOString();
  await settingsRepo.set(K.lastAppOpen, now);
  return now;
}

export async function getLastAppOpen(): Promise<string | null> {
  return settingsRepo.get(K.lastAppOpen);
}

interface NotificationStoreState {
  settings: NotificationSettings;
  loading: boolean;
  load: () => Promise<void>;
  update: (updates: Partial<NotificationSettings>) => Promise<void>;
}

let reconcileTrigger: ((ms?: number) => void) | null = null;

export function setReconcileTrigger(fn: (ms?: number) => void): void {
  reconcileTrigger = fn;
}

export function triggerReconcile(ms: number = 100): void {
  if (reconcileTrigger) reconcileTrigger(ms);
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
    triggerReconcile(100);
  },
}));

export function useNotificationSettings() {
  const settings = useNotificationSettingsStore((s) => s.settings);
  const loading = useNotificationSettingsStore((s) => s.loading);
  const update = useNotificationSettingsStore((s) => s.update);
  return { settings, loading, updateSettings: update };
}
