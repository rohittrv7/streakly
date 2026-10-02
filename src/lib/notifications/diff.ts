import type { PlannedNotification, ScheduledSummary } from "./types";

export const OWN_PREFIXES = [
  "habit:",
  "task:",
  "nudge:",
  "brief:",
  "comeback:",
  "streakbroken:",
  "group:",
];

export function isOurNotification(id: string): boolean {
  return OWN_PREFIXES.some((prefix) => id.startsWith(prefix));
}

export function diffPlan(
  existing: ScheduledSummary[],
  planned: PlannedNotification[]
): { toCancel: string[]; toSchedule: PlannedNotification[] } {
  const ourExisting = existing.filter((e) => isOurNotification(e.id));
  const existingMap = new Map<string, ScheduledSummary>();
  for (const e of ourExisting) {
    existingMap.set(e.id, e);
  }

  const plannedMap = new Map<string, PlannedNotification>();
  for (const p of planned) {
    plannedMap.set(p.id, p);
  }

  const toCancel: string[] = [];
  const toSchedule: PlannedNotification[] = [];

  // Items to cancel: existing items not in planned, or existing items whose fire time or hash changed
  for (const e of ourExisting) {
    const p = plannedMap.get(e.id);
    if (!p) {
      toCancel.push(e.id);
    } else {
      const timeDiff = e.fireAt ? Math.abs(e.fireAt.getTime() - p.fireAt.getTime()) : Infinity;
      const hashDiff = e.contentHash && e.contentHash !== p.contentHash;
      if (timeDiff > 1000 || hashDiff) {
        toCancel.push(e.id);
        toSchedule.push(p);
      }
    }
  }

  // Items to schedule: planned items that didn't exist
  for (const p of planned) {
    if (!existingMap.has(p.id)) {
      toSchedule.push(p);
    }
  }

  return { toCancel, toSchedule };
}
