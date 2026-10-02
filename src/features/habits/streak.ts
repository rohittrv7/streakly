import { parseISO, startOfWeek, endOfWeek, subWeeks } from "date-fns";
import { addDays, toDateStr, todayStr } from "@/core/utils/dates";
import type { Habit } from "./types";

/**
 * Checks whether a habit is scheduled on a specific date (YYYY-MM-DD).
 */
export function isScheduledOn(habit: Habit, date: string): boolean {
  if (habit.frequencyType === "daily" || habit.frequencyType === "times_per_week") {
    return true;
  }
  const d = parseISO(`${date}T12:00:00`);
  return (habit.weekdays || []).includes(d.getDay());
}

/**
 * Checks if a freeze can be used for a given month (max 1 per calendar month).
 */
export function canUseFreezeForMonth(
  frozenDates: string[],
  targetDate: string
): boolean {
  const targetMonth = targetDate.slice(0, 7); // YYYY-MM
  return !frozenDates.some((d) => d.slice(0, 7) === targetMonth);
}

/**
 * Computes current active streak for a habit ending today or yesterday.
 */
export function computeStreak(
  habit: Habit,
  completionDates: string[],
  today: string = todayStr(),
  frozenDates: string[] = []
): number {
  const completionSet = new Set(completionDates);
  const freezeSet = new Set(frozenDates);

  if (habit.frequencyType === "times_per_week") {
    const target = habit.timesPerWeek && habit.timesPerWeek > 0 ? habit.timesPerWeek : 1;
    let streak = 0;
    const now = parseISO(`${today}T12:00:00`);

    const currentWeekStart = toDateStr(startOfWeek(now, { weekStartsOn: 1 }));
    const currentWeekEnd = toDateStr(endOfWeek(now, { weekStartsOn: 1 }));
    const currentWeekCompletions = completionDates.filter(
      (d) => d >= currentWeekStart && d <= currentWeekEnd
    ).length;

    let weekOffset = 1;
    if (currentWeekCompletions >= target) {
      streak += 1;
    }

    let safety = 520; // up to 10 years
    while (safety-- > 0) {
      const weekDate = subWeeks(now, weekOffset);
      const weekStart = toDateStr(startOfWeek(weekDate, { weekStartsOn: 1 }));
      const weekEnd = toDateStr(endOfWeek(weekDate, { weekStartsOn: 1 }));

      const count = completionDates.filter(
        (d) => d >= weekStart && d <= weekEnd
      ).length;

      if (count >= target) {
        streak += 1;
        weekOffset += 1;
      } else {
        break;
      }
    }
    return streak;
  }

  let streak = 0;

  // 1. Check if today is completed or frozen
  if (isScheduledOn(habit, today)) {
    if (completionSet.has(today) || freezeSet.has(today)) {
      streak += 1;
    }
  }

  // 2. Step backward from yesterday
  let currentDate = addDays(today, -1);
  let safetyLimit = 3650; // up to 10 years

  while (safetyLimit-- > 0) {
    if (!isScheduledOn(habit, currentDate)) {
      currentDate = addDays(currentDate, -1);
      continue;
    }

    if (completionSet.has(currentDate) || freezeSet.has(currentDate)) {
      streak += 1;
      currentDate = addDays(currentDate, -1);
    } else {
      // Missed scheduled day breaks the streak
      break;
    }
  }

  return streak;
}

/**
 * Computes all-time best streak.
 */
export function computeBestStreak(
  habit: Habit,
  completionDates: string[],
  frozenDates: string[] = [],
  today: string = todayStr()
): number {
  if (completionDates.length === 0 && frozenDates.length === 0) return 0;

  if (habit.frequencyType === "times_per_week") {
    const target = habit.timesPerWeek && habit.timesPerWeek > 0 ? habit.timesPerWeek : 1;
    const sorted = [...new Set(completionDates)].sort();
    if (sorted.length === 0) return 0;

    let best = 0;
    let current = 0;
    let lastWeek = "";

    const weekMap = new Map<string, number>();
    for (const d of sorted) {
      const w = toDateStr(startOfWeek(parseISO(`${d}T12:00:00`), { weekStartsOn: 1 }));
      weekMap.set(w, (weekMap.get(w) || 0) + 1);
    }

    for (const w of Array.from(weekMap.keys()).sort()) {
      if ((weekMap.get(w) || 0) >= target) {
        current = !lastWeek || addDays(lastWeek, 7) === w ? current + 1 : 1;
        lastWeek = w;
        best = Math.max(best, current);
      } else {
        current = 0;
        lastWeek = "";
      }
    }
    return best;
  }

  const allActiveDates = Array.from(new Set([...completionDates, ...frozenDates])).sort();
  if (allActiveDates.length === 0) return 0;

  const activeSet = new Set(allActiveDates);
  let best = 0;
  let current = 0;
  const startDate = allActiveDates[0];
  const endDate = allActiveDates[allActiveDates.length - 1];

  let curr = startDate;
  let safety = 3650;
  while (curr <= endDate && safety-- > 0) {
    if (isScheduledOn(habit, curr)) {
      if (activeSet.has(curr)) {
        current += 1;
        best = Math.max(best, current);
      } else {
        current = 0;
      }
    }
    curr = addDays(curr, 1);
  }

  const currentStreak = computeStreak(habit, completionDates, today, frozenDates);
  return Math.max(best, currentStreak);
}
