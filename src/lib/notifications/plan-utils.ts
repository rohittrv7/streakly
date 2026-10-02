import { parseISO, set } from "date-fns";
import type { NotificationTarget } from "./types";

export function parseTimeToHourMinute(timeStr: string): { hours: number; minutes: number } {
  const [h, m] = timeStr.split(":").map((v) => parseInt(v, 10));
  return {
    hours: isNaN(h) ? 9 : Math.min(23, Math.max(0, h)),
    minutes: isNaN(m) ? 0 : Math.min(59, Math.max(0, m)),
  };
}

export function buildLocalDate(dateStr: string, timeStr: string): Date {
  const base = parseISO(`${dateStr}T12:00:00`);
  const { hours, minutes } = parseTimeToHourMinute(timeStr);
  return set(base, { hours, minutes, seconds: 0, milliseconds: 0 });
}

export function isInsideQuietHours(
  fireAt: Date,
  startStr: string,
  endStr: string
): boolean {
  const fireMinutes = fireAt.getHours() * 60 + fireAt.getMinutes();
  const start = parseTimeToHourMinute(startStr);
  const end = parseTimeToHourMinute(endStr);
  const startMinutes = start.hours * 60 + start.minutes;
  const endMinutes = end.hours * 60 + end.minutes;

  if (startMinutes === endMinutes) return false;

  if (startMinutes < endMinutes) {
    return fireMinutes >= startMinutes && fireMinutes < endMinutes;
  }
  // Overnight interval (e.g. 22:30 -> 07:00)
  return fireMinutes >= startMinutes || fireMinutes < endMinutes;
}

export function computeContentHash(
  title: string,
  body: string,
  fireAt: Date,
  target: NotificationTarget
): string {
  const raw = `${title}|${body}|${fireAt.getTime()}|${JSON.stringify(target)}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
