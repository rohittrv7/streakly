import { todayStr, addDays, toDateStr } from "@/core/utils/dates";
import { parseISO, eachDayOfInterval } from "date-fns";

export type StatsRange = "7d" | "30d" | "90d";

export interface DateRange {
  range: StatsRange;
  from: string;
  to: string;
  days: number;
}

export function getRangeDays(range: StatsRange): number {
  switch (range) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
    default:
      return 7;
  }
}

export function getRange(range: StatsRange, today: string = todayStr()): DateRange {
  const days = getRangeDays(range);
  const from = addDays(today, -(days - 1));
  return {
    range,
    from,
    to: today,
    days,
  };
}

export function getPreviousRange(
  rangeOrDateRange: StatsRange | DateRange,
  today: string = todayStr()
): DateRange {
  const range: StatsRange =
    typeof rangeOrDateRange === "string" ? rangeOrDateRange : rangeOrDateRange.range;
  const referenceDate: string =
    typeof rangeOrDateRange === "object" ? rangeOrDateRange.to : today;
  const days = getRangeDays(range);
  const to = addDays(referenceDate, -days);
  const from = addDays(to, -(days - 1));
  return {
    range,
    from,
    to,
    days,
  };
}

export function getDateList(from: string, to: string): string[] {
  try {
    const start = parseISO(from);
    const end = parseISO(to);
    if (start > end) return [];
    return eachDayOfInterval({ start, end }).map((d) => toDateStr(d));
  } catch {
    return [];
  }
}
