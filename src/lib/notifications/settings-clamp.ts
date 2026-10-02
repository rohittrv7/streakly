import type {
  HabitLeadMinutes,
  TaskLeadMinutes,
  OverdueDelayMinutes,
  NotificationTone,
  FocusEndSound,
} from "./types";

export function clampHabitLeadMinutes(val: unknown): HabitLeadMinutes {
  const n = typeof val === "number" ? val : parseInt(String(val), 10);
  if (n === 0 || n === 2 || n === 5 || n === 10 || n === 15) return n as HabitLeadMinutes;
  return 5;
}

export function clampTaskLeadMinutes(val: unknown): TaskLeadMinutes {
  const n = typeof val === "number" ? val : parseInt(String(val), 10);
  if (n === 0 || n === 2 || n === 5 || n === 10 || n === 15 || n === 30) return n as TaskLeadMinutes;
  return 5;
}

export function clampOverdueDelayMinutes(val: unknown): OverdueDelayMinutes {
  const n = typeof val === "number" ? val : parseInt(String(val), 10);
  if (__DEV__ && n === 1) return 1;
  if (n === 30 || n === 60 || n === 120) return n as OverdueDelayMinutes;
  return 60;
}

export function clampTone(val: unknown): NotificationTone {
  return val === "strict" ? "strict" : "friendly";
}

export function clampFocusEndSound(val: unknown): FocusEndSound {
  if (val === "notification" || val === "vibrate") return val;
  return "alarm";
}
