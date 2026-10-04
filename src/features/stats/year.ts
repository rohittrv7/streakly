import type { DailyCompletion } from "./types";
import { getHeatmapLevel } from "./heatmap";

export type YearDotState = "past" | "today" | "future";
export type YearDotLevel = 0 | 1 | 2 | 3 | 4 | null;
export type YearMode = "time" | "activity";
export type YearLayout = "grid" | "months";

export interface YearDot {
  date: string;
  dayOfYear: number;
  state: YearDotState;
  level: YearDotLevel;
  scheduled: number;
  done: number;
}

export interface YearSummary {
  dayOfYear: number;
  totalDays: number;
  daysLeft: number;
  percentPassed: number;
  activeDays: number;
  perfectDays: number;
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getDaysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

export function getMonthLengths(year: number): number[] {
  return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
}

export function getYearDots(
  year: number,
  today: string,
  dailyCompletions: DailyCompletion[] = []
): YearDot[] {
  const completionMap = new Map<string, DailyCompletion>();
  for (const dc of dailyCompletions) {
    completionMap.set(dc.date, dc);
  }

  const lengths = getMonthLengths(year);
  const dots: YearDot[] = [];
  let dayOfYear = 1;

  for (let m = 1; m <= 12; m++) {
    const daysCount = lengths[m - 1];
    const mStr = m < 10 ? `0${m}` : `${m}`;
    for (let d = 1; d <= daysCount; d++) {
      const dStr = d < 10 ? `0${d}` : `${d}`;
      const date = `${year}-${mStr}-${dStr}`;

      let state: YearDotState = "future";
      if (date < today) {
        state = "past";
      } else if (date === today) {
        state = "today";
      }

      const comp = completionMap.get(date);
      const scheduled = comp?.scheduled ?? 0;
      const done = comp?.done ?? 0;

      let level: YearDotLevel = null;
      if (scheduled > 0) {
        level = getHeatmapLevel(comp?.ratio ?? 0);
      } else {
        level = null;
      }

      dots.push({
        date,
        dayOfYear,
        state,
        level,
        scheduled,
        done,
      });

      dayOfYear++;
    }
  }

  return dots;
}

export function getYearSummary(dots: YearDot[], today: string): YearSummary {
  const totalDays = dots.length;
  if (totalDays === 0) {
    return {
      dayOfYear: 0,
      totalDays: 0,
      daysLeft: 0,
      percentPassed: 0,
      activeDays: 0,
      perfectDays: 0,
    };
  }

  const firstDate = dots[0].date;
  const lastDate = dots[dots.length - 1].date;

  let dayOfYear = 0;
  let daysLeft = totalDays;
  let percentPassed = 0;

  if (today < firstDate) {
    dayOfYear = 0;
    daysLeft = totalDays;
    percentPassed = 0;
  } else if (today > lastDate) {
    dayOfYear = totalDays;
    daysLeft = 0;
    percentPassed = 100;
  } else {
    const todayDot = dots.find((d) => d.date === today);
    dayOfYear = todayDot ? todayDot.dayOfYear : 1;
    daysLeft = totalDays - dayOfYear;
    percentPassed = Number(((dayOfYear / totalDays) * 100).toFixed(1));
  }

  let activeDays = 0;
  let perfectDays = 0;

  for (const d of dots) {
    if (d.done > 0) {
      activeDays++;
    }
    if (d.scheduled > 0 && d.done >= d.scheduled) {
      perfectDays++;
    }
  }

  return {
    dayOfYear,
    totalDays,
    daysLeft,
    percentPassed,
    activeDays,
    perfectDays,
  };
}
