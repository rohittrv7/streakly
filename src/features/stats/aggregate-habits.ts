import { parseISO, startOfWeek } from "date-fns";
import { addDays, toDateStr } from "@/core/utils/dates";
import type { Habit } from "@/features/habits/types";
import type {
  StatsRawData,
  DailyCompletion,
  OverallCompletion,
  DateRange,
} from "./types";
import { getDateList } from "./ranges";

export function isHabitActiveOnDate(habit: Habit, date: string): boolean {
  const createdDate = habit.createdAt.slice(0, 10);
  if (date < createdDate) return false;
  if (habit.archivedAt && date > habit.archivedAt.slice(0, 10)) return false;
  return true;
}

export function isHabitScheduledOnDate(habit: Habit, date: string): boolean {
  if (!isHabitActiveOnDate(habit, date)) return false;
  if (habit.frequencyType === "daily") return true;
  if (habit.frequencyType === "specific_days") {
    const day = parseISO(`${date}T12:00:00`).getDay();
    return (habit.weekdays || []).includes(day);
  }
  return false;
}

export function getDailyCompletion(
  range: DateRange,
  data: StatsRawData
): DailyCompletion[] {
  const dates = getDateList(range.from, range.to);
  const completionsSet = new Set(data.completions.map((c) => `${c.habitId}_${c.date}`));
  const freezesSet = new Set(data.freezes.map((f) => `${f.habitId}_${f.date}`));

  return dates.map((date) => {
    let scheduled = 0;
    let done = 0;

    // Daily & specific-day habits
    for (const habit of data.habits) {
      if (isHabitScheduledOnDate(habit, date)) {
        scheduled++;
        const key = `${habit.id}_${date}`;
        // Frozen dates do NOT count as completions
        if (completionsSet.has(key) && !freezesSet.has(key)) {
          done++;
        }
      }
    }

    // Tasks dated that day
    for (const task of data.tasks) {
      if (task.date === date) {
        scheduled++;
        if (task.done) done++;
      }
    }

    return {
      date,
      scheduled,
      done,
      ratio: scheduled === 0 ? null : done / scheduled,
    };
  });
}

export function getOverallCompletion(
  range: DateRange,
  data: StatsRawData
): OverallCompletion {
  const daily = getDailyCompletion(range, data);
  let totalScheduled = daily.reduce((acc, d) => acc + d.scheduled, 0);
  let totalDone = daily.reduce((acc, d) => acc + d.done, 0);

  // times_per_week habits contribute at weekly level
  const weeklyHabits = data.habits.filter((h) => h.frequencyType === "times_per_week");
  if (weeklyHabits.length > 0) {
    const dates = getDateList(range.from, range.to);
    const weekStarts = Array.from(
      new Set(dates.map((d) => toDateStr(startOfWeek(parseISO(d), { weekStartsOn: 1 }))))
    );

    for (const habit of weeklyHabits) {
      const target = habit.timesPerWeek && habit.timesPerWeek > 0 ? habit.timesPerWeek : 1;
      for (const wStart of weekStarts) {
        const wEnd = addDays(wStart, 6);
        const createdDate = habit.createdAt.slice(0, 10);
        if (wEnd < createdDate) continue;
        if (habit.archivedAt && wStart > habit.archivedAt.slice(0, 10)) continue;

        const weekCompletions = data.completions.filter(
          (c) => c.habitId === habit.id && c.date >= wStart && c.date <= wEnd
        ).length;

        totalScheduled += target;
        totalDone += Math.min(weekCompletions, target);
      }
    }
  }

  const percent = totalScheduled === 0 ? 0 : Math.round((totalDone / totalScheduled) * 100);
  return { done: totalDone, scheduled: totalScheduled, percent };
}

export function getDelta(current: OverallCompletion, previous: OverallCompletion | null): number | null {
  if (!previous || previous.scheduled === 0) return null;
  return current.percent - previous.percent;
}
