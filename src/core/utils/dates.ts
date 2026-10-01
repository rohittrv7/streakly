import {
  format,
  addDays as dateFnsAddDays,
  startOfWeek,
  parseISO,
  getDay,
  isSameDay,
} from "date-fns";

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.

export interface HabitFrequency {
  type: "daily" | "specific_days" | "times_per_week";
  days?: DayOfWeek[];
  timesPerWeek?: number;
}

/**
 * Converts a Date object, string, or timestamp to local YYYY-MM-DD format.
 */
export function toDateStr(date: Date | string | number = new Date()): string {
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  const d = typeof date === "string" ? parseISO(date) : new Date(date);
  return format(d, "yyyy-MM-dd");
}

/**
 * Returns today's date in local YYYY-MM-DD format.
 */
export function todayStr(): string {
  return toDateStr(new Date());
}

/**
 * Adds (or subtracts) days to/from a date, returning a YYYY-MM-DD string.
 */
export function addDays(date: Date | string | number, amount: number): string {
  const base =
    typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? new Date(`${date}T12:00:00`)
      : typeof date === "string"
      ? parseISO(date)
      : new Date(date);

  const target = dateFnsAddDays(base, amount);
  return toDateStr(target);
}

export interface WeekDayItem {
  dateStr: string;
  dayNumber: number;
  dayName: string;
  dayShort: string;
  isToday: boolean;
  date: Date;
}

/**
 * Returns the 7 days of the week for a given base date (default: starting on Monday).
 */
export function getWeekDays(
  baseDate: Date | string = new Date(),
  weekStartsOn: 0 | 1 = 1
): WeekDayItem[] {
  const base =
    typeof baseDate === "string"
      ? new Date(`${toDateStr(baseDate)}T12:00:00`)
      : new Date(baseDate);

  const start = startOfWeek(base, { weekStartsOn });
  const today = todayStr();

  const days: WeekDayItem[] = [];
  for (let i = 0; i < 7; i++) {
    const d = dateFnsAddDays(start, i);
    const dateStr = toDateStr(d);
    days.push({
      dateStr,
      dayNumber: d.getDate(),
      dayName: format(d, "EEEE"),
      dayShort: format(d, "EEE"),
      isToday: dateStr === today,
      date: d,
    });
  }
  return days;
}

/**
 * Determines whether a habit is scheduled to be performed on a given date.
 */
export function isScheduledOn(
  frequency: HabitFrequency | string | undefined | null,
  date: Date | string = new Date()
): boolean {
  if (!frequency) return true;

  const targetDate =
    typeof date === "string"
      ? new Date(`${toDateStr(date)}T12:00:00`)
      : new Date(date);

  // If frequency is a simple string "daily"
  if (typeof frequency === "string") {
    if (frequency === "daily") return true;
    return true;
  }

  if (frequency.type === "daily") {
    return true;
  }

  if (frequency.type === "specific_days" && Array.isArray(frequency.days)) {
    const dayOfWeek = getDay(targetDate) as DayOfWeek;
    return frequency.days.includes(dayOfWeek);
  }

  if (frequency.type === "times_per_week") {
    // For X times per week habits, any day is a valid day to log progress
    return true;
  }

  return true;
}
