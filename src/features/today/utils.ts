import { parseISO, format, startOfWeek, endOfWeek } from "date-fns";
import { addDays, toDateStr, todayStr } from "@/core/utils/dates";
import type { Habit } from "@/features/habits/types";
import { isScheduledOn } from "@/features/habits/streak";
import type { Task } from "@/features/planner/types";
import { THEME_COLORS } from "@/lib/theme";

export type TimelineSectionId = "morning" | "afternoon" | "evening" | "anytime";

export interface TimelineItem {
  id: string;
  kind: "habit" | "task";
  title: string;
  time: string | null;
  done: boolean;
  category?: string;
  color: string;
  icon?: string;
  hasLinks?: boolean;
  habitId?: string;
  taskId?: string;
}

export interface TimelineSection {
  id: TimelineSectionId;
  title: string;
  items: TimelineItem[];
}

export function getGreeting(
  hour: number,
  t?: (key: any) => string
): string {
  if (hour >= 5 && hour < 12) return t ? t("today.greetingMorning") : "Good morning";
  if (hour >= 12 && hour < 17) return t ? t("today.greetingAfternoon") : "Good afternoon";
  if (hour >= 17 && hour < 22) return t ? t("today.greetingEvening") : "Good evening";
  return t ? t("today.greetingNight") : "Late night hustle";
}

export function formatDayLabel(
  date: string,
  today: string = todayStr(),
  t?: (key: any) => string
): string {
  if (date === today) return t ? t("common.today") : "Today";
  if (date === addDays(today, -1)) return t ? t("common.yesterday") : "Yesterday";
  if (date === addDays(today, 1)) return t ? t("common.tomorrow") : "Tomorrow";
  try {
    const d = parseISO(`${date}T12:00:00`);
    return format(d, "EEE, d MMM");
  } catch {
    return date;
  }
}

export function buildTimeline(
  habits: Array<{ habit: Habit; isCompleted: boolean }>,
  tasks: Task[],
  date: string,
  taskHasLinks: Record<string, boolean> = {}
): TimelineSection[] {
  const morning: TimelineItem[] = [];
  const afternoon: TimelineItem[] = [];
  const evening: TimelineItem[] = [];
  const anytime: TimelineItem[] = [];

  // 1. Process scheduled habits
  for (const { habit, isCompleted } of habits) {
    if (!isScheduledOn(habit, date)) continue;

    const item: TimelineItem = {
      id: `habit-${habit.id}`,
      kind: "habit",
      title: habit.name,
      time: habit.reminderTime || null,
      done: isCompleted,
      color: habit.color,
      icon: habit.icon,
      habitId: habit.id,
    };

    if (!item.time) {
      anytime.push(item);
    } else {
      const hour = parseInt(item.time.split(":")[0], 10);
      if (hour < 12) morning.push(item);
      else if (hour < 17) afternoon.push(item);
      else evening.push(item);
    }
  }

  // 2. Process tasks scheduled for this date
  for (const task of tasks) {
    if (task.date !== date) continue;

    const item: TimelineItem = {
      id: `task-${task.id}`,
      kind: "task",
      title: task.title,
      time: task.startTime || null,
      done: task.done,
      category: task.category,
      color: THEME_COLORS.sky,
      hasLinks: Boolean(taskHasLinks[task.id]),
      taskId: task.id,
    };

    if (!item.time) {
      anytime.push(item);
    } else {
      const hour = parseInt(item.time.split(":")[0], 10);
      if (hour < 12) morning.push(item);
      else if (hour < 17) afternoon.push(item);
      else evening.push(item);
    }
  }

  // Sort timed items chronologically (habits before tasks on tie)
  const sortTimed = (a: TimelineItem, b: TimelineItem) => {
    const timeCmp = (a.time || "").localeCompare(b.time || "");
    if (timeCmp !== 0) return timeCmp;
    if (a.kind !== b.kind) return a.kind === "habit" ? -1 : 1;
    return a.title.localeCompare(b.title);
  };

  morning.sort(sortTimed);
  afternoon.sort(sortTimed);
  evening.sort(sortTimed);

  // Anytime items: habits first, then tasks, then by title
  anytime.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "habit" ? -1 : 1;
    return a.title.localeCompare(b.title);
  });

  const sections: TimelineSection[] = [];
  if (morning.length > 0) sections.push({ id: "morning", title: "Morning", items: morning });
  if (afternoon.length > 0) sections.push({ id: "afternoon", title: "Afternoon", items: afternoon });
  if (evening.length > 0) sections.push({ id: "evening", title: "Evening", items: evening });
  if (anytime.length > 0) sections.push({ id: "anytime", title: "Anytime", items: anytime });

  return sections;
}

export function getDayProgress(items: TimelineItem[]): {
  done: number;
  total: number;
  ratio: number;
} {
  const total = items.length;
  if (total === 0) return { done: 0, total: 0, ratio: 0 };
  const done = items.filter((i) => i.done).length;
  return { done, total, ratio: done / total };
}

export function getTopStreak(
  habitsWithStats: Array<{ habit: Habit; streak: number }>
): { habit: Habit | null; streak: number } {
  if (habitsWithStats.length === 0) return { habit: null, streak: 0 };

  let top = habitsWithStats[0];
  for (const item of habitsWithStats) {
    if (item.streak > top.streak) {
      top = item;
    }
  }
  return { habit: top.habit, streak: top.streak };
}

export function getWeeklyCompletion(
  habits: Habit[],
  completions: Record<string, string[]>,
  today: string = todayStr()
): number {
  if (habits.length === 0) return 0;
  const now = parseISO(`${today}T12:00:00`);
  const weekStart = toDateStr(startOfWeek(now, { weekStartsOn: 1 }));
  const weekEnd = toDateStr(endOfWeek(now, { weekStartsOn: 1 }));

  let scheduledSlots = 0;
  let completedSlots = 0;

  let curr = weekStart;
  while (curr <= weekEnd && curr <= today) {
    for (const h of habits) {
      if (isScheduledOn(h, curr)) {
        scheduledSlots++;
        const habitCompletions = completions[h.id] || [];
        if (habitCompletions.includes(curr)) {
          completedSlots++;
        }
      }
    }
    curr = addDays(curr, 1);
  }

  return scheduledSlots > 0 ? completedSlots / scheduledSlots : 0;
}
