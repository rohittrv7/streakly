import { Platform } from "react-native";
import { parseISO, startOfWeek, endOfWeek } from "date-fns";
import { addDays, toDateStr } from "@/core/utils/dates";
import { isScheduledOn } from "@/features/habits/streak";
import type { PlanBuilderInput, PlannedNotification, NotificationTarget } from "./types";
import { buildLocalDate, isInsideQuietHours, computeContentHash } from "./plan-utils";
import { NOTIFICATION_COPY, getPreReminderCopy, getAtReminderCopy, getOverdueReminderCopy, getStreakBrokenCopy } from "./copy";
import { groupItemsAtSameMinute, enforceDailyLimit, enforcePlatformCap, type ItemWithMeta } from "./plan-limits";

export { OWN_PREFIXES, isOurNotification, diffPlan } from "./diff";

export function buildNotificationPlan(input: PlanBuilderInput, now: Date = new Date()): PlannedNotification[] {
  const {
    habits,
    completions,
    freezes = {},
    tasks,
    settings,
    permissionGranted,
    language = "en",
    lastOpenAt,
    todayStreaks = {},
    platform = (Platform.OS === "ios" ? "ios" : "android"),
  } = input;

  if (!settings.enabled || !permissionGranted) return [];

  const minFireAtMs = now.getTime() + 5000;
  const today = toDateStr(now);
  const tomorrow = addDays(today, 1);
  const copyTable = NOTIFICATION_COPY[language] || NOTIFICATION_COPY.en;
  const tone = settings.tone || "friendly";

  // Platform cap & dynamic window length (2 to 7 days, today & tomorrow always included)
  const cap = platform === "android" ? 200 : 60;
  const activeHabitsCount = habits.filter((h) => !h.archivedAt && h.reminderTime).length;
  const estPerDay = Math.max(1, activeHabitsCount * 2 + 2);
  const windowDays = Math.max(2, Math.min(7, Math.floor(cap / estPerDay)));

  const candidatesWithMeta: ItemWithMeta[] = [];

  const maybeAdd = (
    id: string,
    kind: PlannedNotification["kind"],
    fireAt: Date,
    title: string,
    body: string,
    target: NotificationTarget,
    isExplicit: boolean,
    meta?: { dateStr: string; name?: string; isAt?: boolean }
  ) => {
    if (fireAt.getTime() < minFireAtMs) return;
    if (!isExplicit && settings.quietHoursEnabled && isInsideQuietHours(fireAt, settings.quietHoursStart, settings.quietHoursEnd)) {
      return;
    }
    const contentHash = computeContentHash(title, body, fireAt, target);
    const item: PlannedNotification = { id, kind, fireAt, title, body, target, contentHash };
    candidatesWithMeta.push({
      item,
      dateStr: meta?.dateStr || toDateStr(fireAt),
      name: meta?.name,
      isAt: meta?.isAt,
    });
  };

  // 1. Habit Reminders (PRE, AT, OVERDUE)
  if (settings.habitReminders) {
    const activeHabits = habits.filter((h) => !h.archivedAt && h.reminderTime);
    for (let dayOffset = 0; dayOffset < windowDays; dayOffset++) {
      const dateStr = addDays(today, dayOffset);
      const d = parseISO(`${dateStr}T12:00:00`);
      const wStart = toDateStr(startOfWeek(d, { weekStartsOn: 1 }));
      const wEnd = toDateStr(endOfWeek(d, { weekStartsOn: 1 }));

      for (const habit of activeHabits) {
        if (!isScheduledOn(habit, dateStr)) continue;
        const habitCompletions = completions[habit.id] || [];
        const isDone = habitCompletions.includes(dateStr);

        if (habit.frequencyType === "times_per_week") {
          const target = habit.timesPerWeek && habit.timesPerWeek > 0 ? habit.timesPerWeek : 1;
          const weekDone = habitCompletions.filter((c) => c >= wStart && c <= wEnd).length;
          if (weekDone >= target) continue;
        }

        const baseFire = buildLocalDate(dateStr, habit.reminderTime!);
        const streak = dayOffset === 0 ? todayStreaks[habit.id] : undefined;

        if (settings.habitLeadMinutes > 0 && !isDone) {
          const preFire = new Date(baseFire.getTime() - settings.habitLeadMinutes * 60000);
          const c = getPreReminderCopy(habit.name, settings.habitLeadMinutes, `${habit.id}_${dateStr}_pre`, streak, tone, language);
          maybeAdd(`habit:${habit.id}:${dateStr}:pre`, "habit", preFire, c.title, c.body, { type: "today" }, true, { dateStr, name: habit.name });
        }
        if ((settings.alsoNotifyAtExactTime || settings.habitLeadMinutes === 0) && !isDone) {
          const c = getAtReminderCopy(habit.name, `${habit.id}_${dateStr}_at`, streak, tone, language);
          maybeAdd(`habit:${habit.id}:${dateStr}:at`, "habit", baseFire, c.title, c.body, { type: "today" }, true, { dateStr, name: habit.name, isAt: true });
        }
        if (settings.overdueNudge && !isDone) {
          const lateFire = new Date(baseFire.getTime() + (settings.overdueDelayMinutes || 60) * 60000);
          const c = getOverdueReminderCopy(habit.name, `${habit.id}_${dateStr}_late`, streak, tone, language);
          maybeAdd(`habit:${habit.id}:${dateStr}:late`, "overdue", lateFire, c.title, c.body, { type: "today" }, false, { dateStr, name: habit.name });
        }
      }
    }
  }

  // 2. Task Reminders (PRE, AT)
  if (settings.taskReminders) {
    const windowEnd = addDays(today, windowDays - 1);
    for (const task of tasks) {
      if (task.done || !task.startTime || task.date < today || task.date > windowEnd) continue;
      const baseFire = buildLocalDate(task.date, task.startTime);

      if (settings.taskLeadMinutes > 0) {
        const preFire = new Date(baseFire.getTime() - settings.taskLeadMinutes * 60000);
        const c = getPreReminderCopy(task.title, settings.taskLeadMinutes, `${task.id}_pre`, undefined, tone, language);
        maybeAdd(`task:${task.id}:pre`, "task", preFire, c.title, c.body, { type: "task", id: task.id }, true, { dateStr: task.date, name: task.title });
      }
      if (settings.alsoNotifyAtExactTime || settings.taskLeadMinutes === 0) {
        const c = getAtReminderCopy(task.title, `${task.id}_at`, undefined, tone, language);
        maybeAdd(`task:${task.id}:at`, "task", baseFire, c.title, c.body, { type: "task", id: task.id }, true, { dateStr: task.date, name: task.title, isAt: true });
      }
    }
  }

  // 3. STREAK BROKEN (planned for tomorrow morning for today's broken streaks >= 2)
  if (settings.streakBrokenMessage) {
    const brokenHabits = habits.filter((h) =>
      !h.archivedAt && isScheduledOn(h, today) &&
      !(completions[h.id] || []).includes(today) &&
      !(freezes[h.id] || []).includes(today) &&
      (todayStreaks[h.id] || 0) >= 2
    );

    if (brokenHabits.length > 0) {
      const mornTime = settings.morningBriefingTime || "08:00";
      let mornFire = buildLocalDate(tomorrow, mornTime);
      if (settings.quietHoursEnabled && isInsideQuietHours(mornFire, settings.quietHoursStart, settings.quietHoursEnd)) {
        mornFire = buildLocalDate(tomorrow, settings.quietHoursEnd);
      }
      const unit = language === "hinglish" ? "din" : "days";
      const habitDetails = brokenHabits.map((h) => `${h.name} (${todayStreaks[h.id] || 0} ${unit})`).join(", ");
      const prefix = brokenHabits.length > 1
        ? (language === "hinglish" ? `Kal ${brokenHabits.length} streak: ${habitDetails}` : `${brokenHabits.length} streaks: ${habitDetails}`)
        : habitDetails;
      const copy = getStreakBrokenCopy(prefix, `broken_${tomorrow}`, tone, language);
      maybeAdd(`streakbroken:${tomorrow}`, "streakbroken", mornFire, copy.title, copy.body, { type: "today" }, false, { dateStr: tomorrow });
    }
  }

  // 4. Evening Nudge & Morning Briefing
  if (settings.eveningNudge) {
    for (let dayOffset = 0; dayOffset < windowDays; dayOffset++) {
      const dateStr = addDays(today, dayOffset);
      const fireAt = buildLocalDate(dateStr, settings.eveningNudgeTime);
      if (dayOffset === 0) {
        const active = habits.filter((h) => !h.archivedAt && isScheduledOn(h, today));
        const pHabits = active.filter((h) => !(completions[h.id] || []).includes(today)).length;
        const pTasks = tasks.filter((t) => t.date === today && !t.done).length;
        if (pHabits > 0 || pTasks > 0) {
          const body = copyTable.eveningNudge.dynamicBody({ pendingHabits: pHabits, pendingTasks: pTasks });
          maybeAdd(`nudge:${dateStr}`, "nudge", fireAt, copyTable.eveningNudge.title, body, { type: "today" }, false, { dateStr });
        }
      } else {
        maybeAdd(`nudge:${dateStr}`, "nudge", fireAt, copyTable.eveningNudge.title, copyTable.eveningNudge.genericBody, { type: "today" }, false, { dateStr });
      }
    }
  }

  if (settings.morningBriefing) {
    for (let dayOffset = 0; dayOffset < windowDays; dayOffset++) {
      const dateStr = addDays(today, dayOffset);
      const fireAt = buildLocalDate(dateStr, settings.morningBriefingTime);
      const scheduledHabits = habits.filter((h) => !h.archivedAt && isScheduledOn(h, dateStr)).length;
      const scheduledTasks = tasks.filter((t) => t.date === dateStr).length;
      const body = copyTable.morningBrief.body({ scheduledHabits, scheduledTasks });
      maybeAdd(`brief:${dateStr}`, "brief", fireAt, copyTable.morningBrief.title, body, { type: "today" }, false, { dateStr });
    }
  }

  // 5. Comeback Notifications (+3 and +7 days after last open)
  const baseDate = lastOpenAt ? parseISO(lastOpenAt) : now;
  const d3 = buildLocalDate(toDateStr(addDays(toDateStr(baseDate), 3)), "18:00");
  const d7 = buildLocalDate(toDateStr(addDays(toDateStr(baseDate), 7)), "18:00");
  maybeAdd("comeback:3", "comeback", d3, copyTable.comeback.day3.title, copyTable.comeback.day3.body, { type: "today" }, false);
  maybeAdd("comeback:7", "comeback", d7, copyTable.comeback.day7.title, copyTable.comeback.day7.body, { type: "today" }, false);

  // 6. Anti-spam grouping, daily limit (8 max with drop order), platform cap
  const grouped = groupItemsAtSameMinute(candidatesWithMeta, language);
  const dailyLimited = enforceDailyLimit(grouped);
  return enforcePlatformCap(dailyLimited, today, tomorrow, platform);
}
