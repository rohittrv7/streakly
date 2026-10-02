import { toDateStr } from "@/core/utils/dates";
import type { PlannedNotification, SupportedLanguage } from "./types";
import { computeContentHash } from "./plan-utils";
import { getGroupedReminderCopy } from "./copy";

export interface ItemWithMeta {
  item: PlannedNotification;
  dateStr: string;
  name?: string;
  isAt?: boolean;
}

export const PRIORITY_RANKS: Record<string, number> = {
  comeback: 1,
  brief: 2,
  overdue: 3,
  nudge: 4,
  streakbroken: 5,
  pre: 6,
  at: 7,
};

export function getPriorityRank(item: PlannedNotification): number {
  if (item.priorityRank !== undefined) return item.priorityRank;
  if (item.id.endsWith(":at")) return PRIORITY_RANKS.at;
  if (item.id.endsWith(":pre")) return PRIORITY_RANKS.pre;
  if (item.id.endsWith(":late")) return PRIORITY_RANKS.overdue;
  if (item.kind in PRIORITY_RANKS) return PRIORITY_RANKS[item.kind];
  return 4;
}

export function groupItemsAtSameMinute(
  items: ItemWithMeta[],
  lang: SupportedLanguage = "en"
): PlannedNotification[] {
  const minuteBuckets = new Map<string, ItemWithMeta[]>();
  const nonGroupable: PlannedNotification[] = [];

  for (const entry of items) {
    const isHabitOrTask =
      entry.item.kind === "habit" ||
      entry.item.kind === "task" ||
      entry.item.id.includes(":pre") ||
      entry.item.id.includes(":at");

    if (!isHabitOrTask) {
      nonGroupable.push(entry.item);
      continue;
    }

    const d = entry.item.fireAt;
    const minuteKey = `${toDateStr(d)}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    const list = minuteBuckets.get(minuteKey) ?? [];
    list.push(entry);
    minuteBuckets.set(minuteKey, list);
  }

  const groupedResult: PlannedNotification[] = [...nonGroupable];

  for (const [minuteKey, bucket] of minuteBuckets.entries()) {
    if (bucket.length === 1) {
      groupedResult.push(bucket[0].item);
      continue;
    }

    // Multiple habits/tasks at exact same minute: combine into ONE
    const names = bucket.map((b) => b.name || b.item.title);
    const hasAt = bucket.some((b) => b.isAt || b.item.id.endsWith(":at"));
    const allHabits = bucket.every((b) => b.item.kind === "habit" || b.item.id.startsWith("habit:"));
    const allTasks = bucket.every((b) => b.item.kind === "task" || b.item.id.startsWith("task:"));

    let title: string;
    if (allHabits) {
      title = `${bucket.length} habits`;
    } else if (allTasks) {
      title = `${bucket.length} tasks`;
    } else {
      title = getGroupedReminderCopy(names, lang).title;
    }
    const body = names.join(", ");
    const fireAt = bucket[0].item.fireAt;
    const target = { type: "today" } as const;
    const contentHash = computeContentHash(title, body, fireAt, target);

    groupedResult.push({
      id: `group:${minuteKey.replace(/[:-]/g, "")}`,
      kind: "group",
      fireAt,
      title,
      body,
      target,
      contentHash,
      priorityRank: hasAt ? PRIORITY_RANKS.at : PRIORITY_RANKS.pre,
    });
  }

  return groupedResult;
}

export function enforceDailyLimit(items: PlannedNotification[]): PlannedNotification[] {
  const byDay = new Map<string, PlannedNotification[]>();
  for (const item of items) {
    const day = toDateStr(item.fireAt);
    const list = byDay.get(day) ?? [];
    list.push(item);
    byDay.set(day, list);
  }

  const result: PlannedNotification[] = [];

  for (const [, dayItems] of byDay.entries()) {
    if (dayItems.length <= 8) {
      result.push(...dayItems);
      continue;
    }

    // Sort by priority rank ascending (lowest rank drops first)
    const sorted = [...dayItems].sort((a, b) => getPriorityRank(a) - getPriorityRank(b));
    let toDrop = sorted.length - 8;
    const kept: PlannedNotification[] = [];

    for (const item of sorted) {
      const rank = getPriorityRank(item);
      // Never drop AT
      if (toDrop > 0 && rank < PRIORITY_RANKS.at) {
        toDrop--;
      } else {
        kept.push(item);
      }
    }
    result.push(...kept);
  }

  return result;
}

export function enforcePlatformCap(
  items: PlannedNotification[],
  todayStr: string,
  tomorrowStr: string,
  platform: "android" | "ios" = "android"
): PlannedNotification[] {
  const cap = platform === "android" ? 200 : 60;
  if (items.length <= cap) return items;

  // Split into today/tomorrow (never drop) and future days
  const protectedItems: PlannedNotification[] = [];
  const futureItems: PlannedNotification[] = [];

  for (const item of items) {
    const d = toDateStr(item.fireAt);
    if (d === todayStr || d === tomorrowStr) {
      protectedItems.push(item);
    } else {
      futureItems.push(item);
    }
  }

  const remainingQuota = cap - protectedItems.length;
  if (remainingQuota <= 0) {
    return protectedItems.slice(0, cap);
  }

  // Drop farthest first, and within same day drop lowest priority first
  futureItems.sort((a, b) => {
    const dateDiff = a.fireAt.getTime() - b.fireAt.getTime();
    if (dateDiff !== 0) return dateDiff; // earlier dates first
    return getPriorityRank(b) - getPriorityRank(a); // higher priority first
  });

  const keptFuture = futureItems.slice(0, remainingQuota);
  const combined = [...protectedItems, ...keptFuture];
  combined.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime());
  return combined;
}
