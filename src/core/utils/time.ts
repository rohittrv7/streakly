import { useSettingsStore } from "@/features/settings/store";

export interface FormatTimeOptions {
  is24Hour?: boolean;
}

export interface ParsedTime {
  hour: number;
  minute: number;
}

export interface Time12h {
  hour12: number;
  minute: number;
  period: "AM" | "PM";
}

/**
 * Parses an "HH:mm" or "H:m" time string into hour and minute numbers.
 * Returns null if invalid or out of range.
 */
export function parseTime(timeStr?: string | null): ParsedTime | null {
  if (!timeStr || typeof timeStr !== "string") return null;
  const trimmed = timeStr.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);

  if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }
  return { hour, minute };
}

/**
 * Converts a 24-hour "HH:mm" string into 12-hour components (1-12, minute, "AM" | "PM").
 */
export function to12h(hhmm: string): Time12h {
  const parsed = parseTime(hhmm);
  if (!parsed) {
    return { hour12: 12, minute: 0, period: "AM" };
  }
  const { hour, minute } = parsed;
  const period: "AM" | "PM" = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return { hour12, minute, period };
}

/**
 * Converts 12-hour components into a standard 24-hour "HH:mm" string.
 */
export function from12h(hour12: number, minute: number, period: "AM" | "PM"): string {
  const clampedH = Math.max(1, Math.min(12, Math.floor(hour12) || 12));
  const clampedM = Math.max(0, Math.min(59, Math.floor(minute) || 0));

  let hour24 = 0;
  if (period === "AM") {
    hour24 = clampedH === 12 ? 0 : clampedH;
  } else {
    hour24 = clampedH === 12 ? 12 : clampedH + 12;
  }

  const hStr = hour24 < 10 ? `0${hour24}` : `${hour24}`;
  const mStr = clampedM < 10 ? `0${clampedM}` : `${clampedM}`;
  return `${hStr}:${mStr}`;
}

/**
 * Formats a 24-hour "HH:mm" string for user display.
 * In 12-hour mode: "9:30 PM", "12:00 AM" (no leading zero on hour, uppercase AM/PM).
 * In 24-hour mode: "09:30", "13:05" (zero-padded).
 * Returns "" if input is invalid.
 */
export function formatTime(timeStr?: string | null, options?: FormatTimeOptions): string {
  const parsed = parseTime(timeStr);
  if (!parsed) return "";

  const is24Hour =
    options?.is24Hour !== undefined
      ? options.is24Hour
      : Boolean(useSettingsStore.getState().is24Hour);

  const { hour, minute } = parsed;
  const mStr = minute < 10 ? `0${minute}` : `${minute}`;

  if (is24Hour) {
    const hStr = hour < 10 ? `0${hour}` : `${hour}`;
    return `${hStr}:${mStr}`;
  }

  const { hour12, period } = to12h(timeStr!);
  return `${hour12}:${mStr} ${period}`;
}

/**
 * Formats a time range, e.g. "9:00 AM - 10:30 AM" or "09:00 - 10:30".
 */
export function formatTimeRange(
  startTime?: string | null,
  endTime?: string | null,
  options?: FormatTimeOptions
): string {
  const formattedStart = formatTime(startTime, options);
  const formattedEnd = formatTime(endTime, options);

  if (formattedStart && formattedEnd) {
    return `${formattedStart} - ${formattedEnd}`;
  }
  return formattedStart || formattedEnd || "";
}
