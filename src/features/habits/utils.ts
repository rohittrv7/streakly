import { parseISO, startOfWeek, endOfWeek, format } from "date-fns";
import { addDays, toDateStr, todayStr } from "@/core/utils/dates";
import type { Habit } from "./types";
import { isScheduledOn } from "./streak";

export * from "./streak";

export interface DayStatus {
  date: string;
  dayShort: string;
  scheduled: boolean;
  done: boolean;
  frozen: boolean;
  isToday: boolean;
}

export interface WeekProgress {
  done: number;
  target: number;
  percentage: number;
}

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Formats user-facing frequency label matching isScheduledOn rules.
 */
export function formatFrequency(
  habit: Habit,
  t?: (key: any, params?: any) => string
): string {
  if (habit.frequencyType === "daily") {
    return t ? t("habits.everyDay") : "Every day";
  }

  if (habit.frequencyType === "times_per_week") {
    const times = habit.timesPerWeek && habit.timesPerWeek > 0 ? habit.timesPerWeek : 1;
    return t ? t("habits.timesAWeek", { count: times }) : `${times}x a week`;
  }

  if (habit.frequencyType === "specific_days") {
    const weekdays = habit.weekdays || [];
    if (weekdays.length === 0) return t ? t("habits.notScheduled") : "Not scheduled";
    if (weekdays.length === 7) return t ? t("habits.everyDay") : "Every day";

    const sorted = [...weekdays].sort((a, b) => a - b);
    if (
      sorted.length === 5 &&
      sorted[0] === 1 &&
      sorted[1] === 2 &&
      sorted[2] === 3 &&
      sorted[3] === 4 &&
      sorted[4] === 5
    ) {
      return t ? t("habits.monFri") : "Mon - Fri";
    }

    if (sorted.length === 2 && sorted[0] === 0 && sorted[1] === 6) {
      return t ? t("habits.weekends") : "Weekends";
    }

    return sorted.map((d) => WEEKDAY_NAMES[d]).join(", ");
  }

  return t ? t("habits.everyDay") : "Every day";
}

/**
 * Returns week progress (done vs target) for the current calendar week.
 */
export function getWeekProgress(
  habit: Habit,
  completionDates: string[],
  today: string = todayStr()
): WeekProgress {
  const now = parseISO(`${today}T12:00:00`);
  const weekStart = toDateStr(startOfWeek(now, { weekStartsOn: 1 }));
  const weekEnd = toDateStr(endOfWeek(now, { weekStartsOn: 1 }));

  const doneThisWeek = completionDates.filter(
    (d) => d >= weekStart && d <= weekEnd
  ).length;

  if (habit.frequencyType === "times_per_week") {
    const target = habit.timesPerWeek && habit.timesPerWeek > 0 ? habit.timesPerWeek : 1;
    return {
      done: doneThisWeek,
      target,
      percentage: Math.min(1, doneThisWeek / target),
    };
  }

  if (habit.frequencyType === "specific_days") {
    const target = (habit.weekdays || []).length || 1;
    return {
      done: doneThisWeek,
      target,
      percentage: Math.min(1, doneThisWeek / target),
    };
  }

  return {
    done: doneThisWeek,
    target: 7,
    percentage: Math.min(1, doneThisWeek / 7),
  };
}

/**
 * Returns status array for the last 7 calendar days up to today.
 */
export function getLast7Days(
  habit: Habit,
  completionDates: string[],
  today: string = todayStr(),
  frozenDates: string[] = []
): DayStatus[] {
  const completionSet = new Set(completionDates);
  const freezeSet = new Set(frozenDates);
  const result: DayStatus[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = addDays(today, -i);
    const d = parseISO(`${date}T12:00:00`);
    result.push({
      date,
      dayShort: format(d, "EEEEE"),
      scheduled: isScheduledOn(habit, date),
      done: completionSet.has(date),
      frozen: freezeSet.has(date),
      isToday: date === today,
    });
  }

  return result;
}
