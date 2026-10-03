import type { Habit } from "@/features/habits/types";
import type { Task } from "@/features/planner/types";

export type NotificationKind =
  | "habit"
  | "task"
  | "nudge"
  | "brief"
  | "comeback"
  | "focus"
  | "overdue"
  | "streakbroken"
  | "group";

export type NotificationTarget =
  | { type: "today" }
  | { type: "task"; id: string }
  | { type: "habit"; id: string }
  | { type: "focus" };

export interface PlannedNotification {
  id: string;
  kind: NotificationKind;
  fireAt: Date;
  title: string;
  body: string;
  target: NotificationTarget;
  contentHash: string;
  channelId?: string;
  priorityRank?: number;
}

export interface ScheduledSummary {
  id: string;
  fireAt: Date | null;
  contentHash?: string;
}

export type HabitLeadMinutes = 0 | 1 | 2 | 5 | 10 | 15;
export type TaskLeadMinutes = 0 | 1 | 2 | 5 | 10 | 15 | 30;
export type OverdueDelayMinutes = 1 | 30 | 60 | 120;
export type NotificationTone = "friendly" | "strict";
export type FocusEndSound = "alarm" | "notification" | "vibrate";

export interface NotificationSettings {
  enabled: boolean;
  habitReminders: boolean;
  habitLeadMinutes: HabitLeadMinutes;
  alsoNotifyAtExactTime: boolean;
  taskReminders: boolean;
  taskLeadMinutes: TaskLeadMinutes;
  overdueNudge: boolean;
  overdueDelayMinutes: OverdueDelayMinutes;
  streakBrokenMessage: boolean;
  tone: NotificationTone;
  focusEndSound: FocusEndSound;
  focusRepeatReminders: boolean;
  eveningNudge: boolean;
  eveningNudgeTime: string; // HH:mm
  morningBriefing: boolean;
  morningBriefingTime: string; // HH:mm
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:mm
  quietHoursEnd: string; // HH:mm
}

export type SupportedLanguage = "en" | "hinglish";

export interface PlanBuilderInput {
  habits: Habit[];
  completions: Record<string, string[]>; // habitId -> YYYY-MM-DD array
  freezes?: Record<string, string[]>; // habitId -> YYYY-MM-DD array
  tasks: Task[];
  settings: NotificationSettings;
  permissionGranted: boolean;
  language?: SupportedLanguage;
  lastOpenAt?: string | null;
  todayStreaks?: Record<string, number>; // habitId -> streak count
  platform?: "android" | "ios";
}

export type NotificationPermissionStatus = "undetermined" | "granted" | "denied";

export interface PermissionState {
  status: NotificationPermissionStatus;
  canAskAgain: boolean;
}
