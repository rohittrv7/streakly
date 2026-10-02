import { parseISO } from "date-fns";
import { computeStreak, computeBestStreak } from "@/features/habits/streak";
import { addDays, toDateStr, todayStr } from "@/core/utils/dates";
import { startOfWeek } from "date-fns";
import type { Habit } from "@/features/habits/types";
import type { StatsRawData, HabitBreakdownItem, StreakSummary, DateRange } from "./types";
import { getDateList } from "./ranges";
import { isHabitScheduledOnDate } from "./aggregate-habits";

export function getStreakSummary(
  habits: Habit[],
  completions: { habitId: string; date: string }[],
  freezes: { habitId: string; date: string }[],
  today: string = todayStr()
): StreakSummary {
  if (habits.length === 0) {
    return { topStreakHabit: null, topStreak: 0, bestStreakEver: 0 };
  }

  const completionsByHabit: Record<string, string[]> = {};
  for (const c of completions) {
    if (!completionsByHabit[c.habitId]) completionsByHabit[c.habitId] = [];
    completionsByHabit[c.habitId].push(c.date);
  }

  const freezesByHabit: Record<string, string[]> = {};
  for (const f of freezes) {
    if (!freezesByHabit[f.habitId]) freezesByHabit[f.habitId] = [];
    freezesByHabit[f.habitId].push(f.date);
  }

  let topStreak = 0;
  let topHabit: Habit | null = null;
  let bestStreakEver = 0;

  for (const habit of habits) {
    const dates = completionsByHabit[habit.id] || [];
    const frz = freezesByHabit[habit.id] || [];
    const current = computeStreak(habit, dates, today, frz);
    const best = computeBestStreak(habit, dates, frz, today);

    if (current > topStreak || topHabit === null) {
      topStreak = current;
      topHabit = habit;
    }
    if (best > bestStreakEver) {
      bestStreakEver = best;
    }
  }

  return {
    topStreakHabit: topHabit,
    topStreak,
    bestStreakEver,
  };
}

export function getHabitBreakdown(
  range: DateRange,
  data: StatsRawData,
  today: string = todayStr()
): HabitBreakdownItem[] {
  const dates = getDateList(range.from, range.to);
  const completionsByHabit: Record<string, string[]> = {};
  for (const c of data.completions) {
    if (!completionsByHabit[c.habitId]) completionsByHabit[c.habitId] = [];
    completionsByHabit[c.habitId].push(c.date);
  }

  const freezesByHabit: Record<string, string[]> = {};
  for (const f of data.freezes) {
    if (!freezesByHabit[f.habitId]) freezesByHabit[f.habitId] = [];
    freezesByHabit[f.habitId].push(f.date);
  }

  const result: HabitBreakdownItem[] = [];

  for (const habit of data.habits) {
    let scheduled = 0;
    let done = 0;

    if (habit.frequencyType === "times_per_week") {
      const target = habit.timesPerWeek && habit.timesPerWeek > 0 ? habit.timesPerWeek : 1;
      const weekStarts = Array.from(
        new Set(dates.map((d) => toDateStr(startOfWeek(parseISO(d), { weekStartsOn: 1 }))))
      );
      for (const wStart of weekStarts) {
        const wEnd = addDays(wStart, 6);
        const createdDate = habit.createdAt.slice(0, 10);
        if (wEnd < createdDate) continue;
        if (habit.archivedAt && wStart > habit.archivedAt.slice(0, 10)) continue;

        const count = (completionsByHabit[habit.id] || []).filter(
          (d) => d >= wStart && d <= wEnd
        ).length;
        scheduled += target;
        done += Math.min(count, target);
      }
    } else {
      const compDates = new Set(completionsByHabit[habit.id] || []);
      const frzDates = new Set(freezesByHabit[habit.id] || []);
      for (const d of dates) {
        if (isHabitScheduledOnDate(habit, d)) {
          scheduled++;
          if (compDates.has(d) && !frzDates.has(d)) {
            done++;
          }
        }
      }
    }

    const percent = scheduled === 0 ? 0 : Math.round((done / scheduled) * 100);
    const streak = computeStreak(
      habit,
      completionsByHabit[habit.id] || [],
      today,
      freezesByHabit[habit.id] || []
    );

    result.push({
      id: habit.id,
      name: habit.name,
      color: habit.color,
      icon: habit.icon,
      percent,
      done,
      scheduled,
      currentStreak: streak,
    });
  }

  return result.sort((a, b) => b.percent - a.percent);
}
