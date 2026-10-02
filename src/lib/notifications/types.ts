import type { Habit } from "@/features/habits/types";
import type { Task } from "@/features/planner/types";

export type NotificationKind =
  | "habit"
  | "task"
  | "nudge"
  | "brief"
  | "comeback"
  | "focus";

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
}

export interface ScheduledSummary {
  id: string;
  fireAt: Date | null;
  contentHash?: string;
}

export type TaskLeadMinutes = 0 | 5 | 10 | 30;

export interface NotificationSettings {
  enabled: boolean;
  habitReminders: boolean;
  taskReminders: boolean;
  taskLeadMinutes: TaskLeadMinutes;
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
  tasks: Task[];
  settings: NotificationSettings;
  permissionGranted: boolean;
  language?: SupportedLanguage;
  lastOpenAt?: string | null;
  todayStreaks?: Record<string, number>; // habitId -> streak count
}

export type NotificationPermissionStatus = "undetermined" | "granted" | "denied";

export interface PermissionState {
  status: NotificationPermissionStatus;
  canAskAgain: boolean;
}
