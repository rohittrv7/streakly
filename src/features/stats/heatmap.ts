import { parseISO, startOfWeek } from "date-fns";
import { addDays, toDateStr, todayStr } from "@/core/utils/dates";
import type { DailyCompletion, HeatmapCell, DateRange } from "./types";
import type { FocusSession } from "@/features/focus/types";

export function getHeatmapLevel(ratio: number | null): 0 | 1 | 2 | 3 | 4 {
  if (ratio === null || ratio <= 0) return 0;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

export function getHeatmapCells(
  range: DateRange,
  dailyCompletions: DailyCompletion[],
  focusSessions: FocusSession[] = [],
  today: string = todayStr()
): HeatmapCell[] {
  // Determine number of weeks: 13 weeks for 90d, 12 weeks minimum
  const weeksCount = range.from <= addDays(today, -85) ? 13 : 12;

  // The latest date is today (or range.to, whichever is later)
  const endDate = today > range.to ? today : range.to;
  const currentWeekStart = toDateStr(
    startOfWeek(parseISO(endDate), { weekStartsOn: 1 })
  );
  // Start from (weeksCount - 1) weeks before currentWeekStart
  const startDate = addDays(currentWeekStart, -(weeksCount - 1) * 7);

  const dailyMap = new Map<string, DailyCompletion>();
  for (const dc of dailyCompletions) {
    dailyMap.set(dc.date, dc);
  }

  // Pre-aggregate focus minutes by date
  const focusMap = new Map<string, number>();
  for (const s of focusSessions) {
    if (s.completed || s.durationSeconds >= 60) {
      const date = toDateStr(parseISO(s.startedAt));
      const mins = Math.round(s.durationSeconds / 60);
      focusMap.set(date, (focusMap.get(date) || 0) + mins);
    }
  }

  const cells: HeatmapCell[] = [];
  const totalDays = weeksCount * 7;

  for (let i = 0; i < totalDays; i++) {
    const date = addDays(startDate, i);
    const inRange = date >= range.from && date <= range.to;
    const daily = dailyMap.get(date);
    const scheduled = daily?.scheduled ?? 0;
    const done = daily?.done ?? 0;
    const ratio = daily ? daily.ratio : null;
    const focusMinutes = focusMap.get(date) ?? 0;

    cells.push({
      date,
      level: getHeatmapLevel(ratio),
      inRange,
      scheduled,
      done,
      focusMinutes,
    });
  }

  return cells;
}
