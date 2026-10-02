import { parseISO } from "date-fns";
import { toDateStr, todayStr } from "@/core/utils/dates";
import type { Task } from "@/features/planner/types";
import type { FocusSession } from "@/features/focus/types";
import type { TaskSummary, FocusSummary, DateRange } from "./types";
import { getDateList } from "./ranges";

export function getTaskSummary(
  range: DateRange,
  tasks: Task[],
  today: string = todayStr()
): TaskSummary {
  const filtered = tasks.filter((t) => t.date >= range.from && t.date <= range.to);
  let done = 0;
  let missed = 0;
  let upcoming = 0;
  const byCategory: Record<string, number> = {};

  for (const t of filtered) {
    if (t.done) {
      done++;
    } else if (t.date < today) {
      missed++;
    } else {
      upcoming++;
    }

    const cat = t.category || "other";
    byCategory[cat] = (byCategory[cat] || 0) + 1;
  }

  return {
    done,
    missed,
    upcoming,
    total: filtered.length,
    byCategory,
  };
}

export function getFocusSummary(
  range: DateRange,
  sessions: FocusSession[]
): FocusSummary {
  const dates = getDateList(range.from, range.to);
  const daysInRange = Math.max(1, dates.length);

  // Filter valid focus sessions: focus mode, completed OR (not completed and >= 60s)
  const validSessions: { date: string; minutes: number; category: string }[] = [];

  for (const s of sessions) {
    if (!s.completed && s.durationSeconds < 60) continue;

    // Convert startedAt to local YYYY-MM-DD
    const date = toDateStr(parseISO(s.startedAt));
    if (date < range.from || date > range.to) continue;

    const minutes = Math.round(s.durationSeconds / 60);
    validSessions.push({
      date,
      minutes,
      category: s.category || "work",
    });
  }

  let totalMinutes = 0;
  let longestSession = 0;
  const minutesByDate: Record<string, number> = {};
  const minutesByCategory: Record<string, number> = {};

  for (const s of validSessions) {
    totalMinutes += s.minutes;
    if (s.minutes > longestSession) longestSession = s.minutes;
    minutesByDate[s.date] = (minutesByDate[s.date] || 0) + s.minutes;
    minutesByCategory[s.category] = (minutesByCategory[s.category] || 0) + s.minutes;
  }

  const perDayMinutes = dates.map((date) => ({
    date,
    minutes: minutesByDate[date] || 0,
  }));

  const perCategoryMinutes = Object.entries(minutesByCategory)
    .map(([category, minutes]) => ({
      category,
      minutes,
      percent: totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0,
    }))
    .sort((a, b) => b.minutes - a.minutes);

  const averagePerDay = Math.round((totalMinutes / daysInRange) * 10) / 10;

  return {
    totalMinutes,
    sessionCount: validSessions.length,
    averagePerDay,
    longestSession,
    perDayMinutes,
    perCategoryMinutes,
  };
}
