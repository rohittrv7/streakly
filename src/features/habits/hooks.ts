import { useMemo, useCallback } from "react";
import { useHabitsStore } from "./store";
import type { Habit } from "./types";
import {
  computeStreak,
  computeBestStreak,
  getLast7Days,
  getWeekProgress,
  isScheduledOn,
} from "./utils";
import { todayStr } from "@/core/utils/dates";

export function useHabits() {
  const habits = useHabitsStore((s) => s.habits);
  const loading = useHabitsStore((s) => s.loading);
  const error = useHabitsStore((s) => s.error);
  const load = useHabitsStore((s) => s.load);
  const addHabit = useHabitsStore((s) => s.addHabit);
  const updateHabit = useHabitsStore((s) => s.updateHabit);
  const archiveHabit = useHabitsStore((s) => s.archiveHabit);
  const deleteHabit = useHabitsStore((s) => s.deleteHabit);
  const toggleCompletion = useHabitsStore((s) => s.toggleCompletion);
  const useFreeze = useHabitsStore((s) => s.useFreeze);

  return {
    habits,
    loading,
    error,
    load,
    addHabit,
    updateHabit,
    archiveHabit,
    deleteHabit,
    toggleCompletion,
    useFreeze,
  };
}

export function useHabit(id: string | undefined): Habit | null {
  const habits = useHabitsStore((s) => s.habits);
  return useMemo(() => {
    if (!id) return null;
    return habits.find((h) => h.id === id) || null;
  }, [habits, id]);
}

export function useHabitStats(
  habit: Habit | null | undefined,
  targetDate: string = todayStr()
) {
  const habitId = habit?.id || "";
  const completions = useHabitsStore(
    useCallback((s) => (habitId ? s.completions[habitId] || [] : []), [habitId])
  );
  const freezes = useHabitsStore(
    useCallback((s) => (habitId ? s.freezes[habitId] || [] : []), [habitId])
  );
  const toggleStore = useHabitsStore((s) => s.toggleCompletion);
  const useFreezeStore = useHabitsStore((s) => s.useFreeze);

  const stats = useMemo(() => {
    if (!habit) {
      return {
        currentStreak: 0,
        bestStreak: 0,
        last7Days: [],
        weekProgress: { done: 0, target: 1, percentage: 0 },
        isCompletedToday: false,
        isScheduledToday: false,
      };
    }

    const currentStreak = computeStreak(habit, completions, targetDate, freezes);
    const bestStreak = computeBestStreak(habit, completions, freezes);
    const last7Days = getLast7Days(habit, completions, targetDate, freezes);
    const weekProgress = getWeekProgress(habit, completions, targetDate);
    const isCompletedToday = completions.includes(targetDate);
    const isScheduledToday = isScheduledOn(habit, targetDate);

    return {
      currentStreak,
      bestStreak,
      last7Days,
      weekProgress,
      isCompletedToday,
      isScheduledToday,
    };
  }, [habit, completions, freezes, targetDate]);

  const toggleToday = useCallback(async () => {
    if (!habit) return false;
    return toggleStore(habit.id, targetDate);
  }, [habit, targetDate, toggleStore]);

  const freezeToday = useCallback(async () => {
    if (!habit) return false;
    return useFreezeStore(habit.id, targetDate);
  }, [habit, targetDate, useFreezeStore]);

  return {
    ...stats,
    toggleToday,
    freezeToday,
  };
}

export function useHabitsForDate(date: string) {
  const habits = useHabitsStore((s) => s.habits);
  const completions = useHabitsStore((s) => s.completions);
  const freezes = useHabitsStore((s) => s.freezes);
  const toggleCompletion = useHabitsStore((s) => s.toggleCompletion);

  return useMemo(() => {
    return habits
      .filter((h) => isScheduledOn(h, date))
      .map((habit) => {
        const habitCompletions = completions[habit.id] || [];
        const habitFreezes = freezes[habit.id] || [];
        const isCompleted = habitCompletions.includes(date);
        const isFrozen = habitFreezes.includes(date);
        const currentStreak = computeStreak(habit, habitCompletions, date, habitFreezes);

        return {
          habit,
          isCompleted,
          isFrozen,
          currentStreak,
          toggle: () => toggleCompletion(habit.id, date),
        };
      });
  }, [habits, completions, freezes, date, toggleCompletion]);
}
