import { parseISO, startOfWeek, endOfWeek, subMinutes } from "date-fns";
import { addDays, toDateStr } from "@/core/utils/dates";
import { isScheduledOn } from "@/features/habits/streak";
import type {
  PlanBuilderInput,
  PlannedNotification,
  ScheduledSummary,
  NotificationTarget,
} from "./types";
import {
  buildLocalDate,
  isInsideQuietHours,
  computeContentHash,
} from "./plan-utils";
import {
  NOTIFICATION_COPY,
  getHabitReminderCopy,
  getTaskReminderCopy,
} from "./copy";

export { OWN_PREFIXES, isOurNotification, diffPlan } from "./diff";

export function buildNotificationPlan(
  input: PlanBuilderInput,
  now: Date = new Date()
): PlannedNotification[] {
  const {
    habits,
    completions,
    tasks,
    settings,
    permissionGranted,
    language = "en",
    lastOpenAt,
    todayStreaks = {},
  } = input;

  if (!settings.enabled || !permissionGranted) {
    return [];
  }

  const planned: PlannedNotification[] = [];
  const minFireAtMs = now.getTime() + 5000;
  const today = toDateStr(now);
  const copyTable = NOTIFICATION_COPY[language] || NOTIFICATION_COPY.en;

  const maybeAdd = (
    id: string,
    kind: PlannedNotification["kind"],
    fireAt: Date,
    title: string,
    body: string,
    target: NotificationTarget
  ) => {
    if (fireAt.getTime() < minFireAtMs) return;
    if (
      settings.quietHoursEnabled &&
      isInsideQuietHours(fireAt, settings.quietHoursStart, settings.quietHoursEnd)
    ) {
      return;
    }
    const contentHash = computeContentHash(title, body, fireAt, target);
    planned.push({ id, kind, fireAt, title, body, target, contentHash });
  };

  // 1. Habit Reminders (rolling 7 days: today to today + 6)
  if (settings.habitReminders) {
    const activeHabits = habits.filter((h) => !h.archivedAt && h.reminderTime);
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const dateStr = addDays(today, dayOffset);
      const d = parseISO(`${dateStr}T12:00:00`);
      const wStart = toDateStr(startOfWeek(d, { weekStartsOn: 1 }));
      const wEnd = toDateStr(endOfWeek(d, { weekStartsOn: 1 }));

      for (const habit of activeHabits) {
        if (!isScheduledOn(habit, dateStr)) continue;

        // Skip if already done on that date
        const habitCompletions = completions[habit.id] || [];
        if (habitCompletions.includes(dateStr)) continue;

        // For times_per_week: check if weekly target is already met
        if (habit.frequencyType === "times_per_week") {
          const target = habit.timesPerWeek && habit.timesPerWeek > 0 ? habit.timesPerWeek : 1;
          const weekCompletions = habitCompletions.filter((c) => c >= wStart && c <= wEnd).length;
          if (weekCompletions >= target) continue;
        }

        const fireAt = buildLocalDate(dateStr, habit.reminderTime!);
        const { title, body } = getHabitReminderCopy(habit.name, `${habit.id}_${dateStr}`, language);
        maybeAdd(`habit:${habit.id}:${dateStr}`, "habit", fireAt, title, body, { type: "today" });
      }
    }
  }

  // 2. Task Reminders (rolling 7 days, has startTime, not done, not past)
  if (settings.taskReminders) {
    const leadMs = settings.taskLeadMinutes * 60 * 1000;
    const windowEnd = addDays(today, 6);

    for (const task of tasks) {
      if (task.done || !task.startTime || task.date < today || task.date > windowEnd) continue;

      const baseFireAt = buildLocalDate(task.date, task.startTime);
      const fireAt = new Date(baseFireAt.getTime() - leadMs);
      const { title, body } = getTaskReminderCopy(task.title, task.id, language);
      maybeAdd(`task:${task.id}`, "task", fireAt, title, body, { type: "task", id: task.id });
    }
  }

  // 3. Evening Nudge (daily at eveningNudgeTime)
  if (settings.eveningNudge) {
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const dateStr = addDays(today, dayOffset);
      const fireAt = buildLocalDate(dateStr, settings.eveningNudgeTime);

      if (dayOffset === 0) {
        // Today: calculate pending habits and tasks
        const activeHabits = habits.filter((h) => !h.archivedAt && isScheduledOn(h, today));
        const pendingHabitsList = activeHabits.filter((h) => !(completions[h.id] || []).includes(today));
        const pendingTasksList = tasks.filter((t) => t.date === today && !t.done);

        // Skip if everything scheduled for today is done
        if (pendingHabitsList.length === 0 && pendingTasksList.length === 0) {
          continue;
        }

        let streakAtRiskHabit: { name: string; streak: number } | undefined;
        for (const h of pendingHabitsList) {
          const streak = todayStreaks[h.id] || 0;
          if (streak >= 3 && (!streakAtRiskHabit || streak > streakAtRiskHabit.streak)) {
            streakAtRiskHabit = { name: h.name, streak };
          }
        }

        const body = copyTable.eveningNudge.dynamicBody({
          pendingHabits: pendingHabitsList.length,
          pendingTasks: pendingTasksList.length,
          streakAtRiskHabit,
        });
        maybeAdd(`nudge:${dateStr}`, "nudge", fireAt, copyTable.eveningNudge.title, body, { type: "today" });
      } else {
        // Future days: generic body
        maybeAdd(`nudge:${dateStr}`, "nudge", fireAt, copyTable.eveningNudge.title, copyTable.eveningNudge.genericBody, { type: "today" });
      }
    }
  }

  // 4. Morning Briefing (if enabled)
  if (settings.morningBriefing) {
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const dateStr = addDays(today, dayOffset);
      const fireAt = buildLocalDate(dateStr, settings.morningBriefingTime);

      const scheduledHabits = habits.filter((h) => !h.archivedAt && isScheduledOn(h, dateStr)).length;
      const scheduledTasks = tasks.filter((t) => t.date === dateStr).length;

      const body = copyTable.morningBrief.body({ scheduledHabits, scheduledTasks });
      maybeAdd(`brief:${dateStr}`, "brief", fireAt, copyTable.morningBrief.title, body, { type: "today" });
    }
  }

  // 5. Comeback Notifications (+3 and +7 days after last open)
  const baseDate = lastOpenAt ? parseISO(lastOpenAt) : now;
  const day3Fire = buildLocalDate(toDateStr(addDays(toDateStr(baseDate), 3)), "18:00");
  const day7Fire = buildLocalDate(toDateStr(addDays(toDateStr(baseDate), 7)), "18:00");

  maybeAdd("comeback:3", "comeback", day3Fire, copyTable.comeback.day3.title, copyTable.comeback.day3.body, { type: "today" });
  maybeAdd("comeback:7", "comeback", day7Fire, copyTable.comeback.day7.title, copyTable.comeback.day7.body, { type: "today" });

  // 6. Cap at 60 notifications, keeping soonest
  planned.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime());
  return planned.slice(0, 60);
}
