import { resolveHabitIcon } from "./components/HabitIcon";

export type HabitFrequencyType = "daily" | "specific_days" | "times_per_week";

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequencyType: HabitFrequencyType;
  weekdays: number[]; // e.g. [1, 3, 5] for Mon, Wed, Fri (0 = Sun .. 6 = Sat)
  timesPerWeek?: number | null;
  reminderTime?: string | null; // e.g. "08:00"
  createdAt: string; // ISO or YYYY-MM-DD
  archivedAt?: string | null;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface HabitRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency_type: string;
  weekdays: string | null;
  times_per_week: number | null;
  reminder_time: string | null;
  created_at: string;
  archived_at: string | null;
}

export interface HabitCompletionRow {
  id: string;
  habit_id: string;
  date: string;
  created_at: string;
}

export function mapHabitRow(row: HabitRow): Habit {
  let weekdays: number[] = [];
  if (row.weekdays) {
    try {
      const parsed = JSON.parse(row.weekdays);
      if (Array.isArray(parsed)) {
        weekdays = parsed;
      }
    } catch {
      weekdays = [];
    }
  }

  return {
    id: row.id,
    name: row.name,
    icon: resolveHabitIcon(row.icon),
    color: row.color,
    frequencyType: row.frequency_type as HabitFrequencyType,
    weekdays,
    timesPerWeek: row.times_per_week,
    reminderTime: row.reminder_time,
    createdAt: row.created_at,
    archivedAt: row.archived_at,
  };
}

export function mapCompletionRow(row: HabitCompletionRow): HabitCompletion {
  return {
    id: row.id,
    habitId: row.habit_id,
    date: row.date,
    createdAt: row.created_at,
  };
}

export interface HabitFreeze {
  habitId: string;
  date: string;
  createdAt: string;
}

export interface HabitFreezeRow {
  habit_id: string;
  date: string;
  created_at: string;
}

export function mapFreezeRow(row: HabitFreezeRow): HabitFreeze {
  return {
    habitId: row.habit_id,
    date: row.date,
    createdAt: row.created_at,
  };
}
