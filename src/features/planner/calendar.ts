import {
  parseISO,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  format,
} from "date-fns";
import { addDays, toDateStr } from "@/core/utils/dates";
import type { Task } from "./types";
import { CATEGORY_CONFIG, type TaskCategory } from "@/core/theme/categories";
import { THEME_COLORS } from "@/lib/theme";

export interface CalendarDay {
  date: string;
  inMonth: boolean;
  dayNumber: number;
}

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  Study: CATEGORY_CONFIG.Study.color,
  Fitness: CATEGORY_CONFIG.Fitness.color,
  Reading: CATEGORY_CONFIG.Reading.color,
  Work: CATEGORY_CONFIG.Work.color,
  Custom: CATEGORY_CONFIG.Custom.color,
};

/**
 * Returns a 6x7 grid (42 days, Monday-first) for a given year and month (1-12).
 */
export function getMonthGrid(year: number, month: number): CalendarDay[] {
  const monthStr = month < 10 ? `0${month}` : `${month}`;
  const firstOfMonth = parseISO(`${year}-${monthStr}-01T12:00:00`);
  const gridStart = startOfWeek(firstOfMonth, { weekStartsOn: 1 });

  const grid: CalendarDay[] = [];
  let curr = gridStart;

  for (let i = 0; i < 42; i++) {
    const dStr = toDateStr(curr);
    const parsed = parseISO(`${dStr}T12:00:00`);
    const inMonth = parsed.getMonth() + 1 === month && parsed.getFullYear() === year;

    grid.push({
      date: dStr,
      inMonth,
      dayNumber: parsed.getDate(),
    });

    curr = parseISO(`${addDays(dStr, 1)}T12:00:00`);
  }

  return grid;
}

/**
 * Returns the start and end dates (YYYY-MM-DD) for a given year and month (1-12).
 */
export function getMonthRange(
  year: number,
  month: number
): { start: string; end: string } {
  const monthStr = month < 10 ? `0${month}` : `${month}`;
  const firstOfMonth = parseISO(`${year}-${monthStr}-01T12:00:00`);
  const lastOfMonth = endOfMonth(firstOfMonth);

  return {
    start: toDateStr(firstOfMonth),
    end: toDateStr(lastOfMonth),
  };
}

/**
 * Shifts year and month (1-12) by delta (+1, -1, etc.).
 */
export function shiftMonth(
  year: number,
  month: number,
  delta: number
): { year: number; month: number } {
  const totalMonths = year * 12 + (month - 1) + delta;
  const newYear = Math.floor(totalMonths / 12);
  const newMonth = (totalMonths % 12 + 12) % 12 + 1;
  return { year: newYear, month: newMonth };
}

export interface DayTaskDots {
  colors: string[];
  count: number;
  allDone: boolean;
}

/**
 * Groups tasks by date, providing up to 3 distinct category colors and a done check.
 */
export function getTaskDotsByDate(tasks: Task[]): Record<string, DayTaskDots> {
  const result: Record<string, { colorsSet: Set<string>; count: number; doneCount: number }> = {};

  for (const t of tasks) {
    if (!result[t.date]) {
      result[t.date] = { colorsSet: new Set(), count: 0, doneCount: 0 };
    }
    const group = result[t.date];
    group.count += 1;
    if (t.done) group.doneCount += 1;

    const color = CATEGORY_COLORS[t.category] || THEME_COLORS.sky;
    if (group.colorsSet.size < 3) {
      group.colorsSet.add(color);
    }
  }

  const finalMap: Record<string, DayTaskDots> = {};
  for (const [date, val] of Object.entries(result)) {
    finalMap[date] = {
      colors: Array.from(val.colorsSet),
      count: val.count,
      allDone: val.count > 0 && val.doneCount === val.count,
    };
  }

  return finalMap;
}
