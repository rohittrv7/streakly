import { useState, useEffect, useMemo, useCallback } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useHabitsStore } from "@/features/habits/store";
import { usePlannerStore } from "@/features/planner/store";
import { useHabitsForDate } from "@/features/habits/hooks";
import { useTasksForDate } from "@/features/planner/hooks";
import { computeStreak } from "@/features/habits/streak";
import { focusRepo } from "@/features/focus/repo";
import { useFocusStore, selectTodayFocusMinutes } from "@/features/focus";
import { youTubeRepo } from "@/features/youtube/repo";
import { useYouTubeStore } from "@/features/youtube/store";
import { todayStr } from "@/core/utils/dates";
import {
  buildTimeline,
  getDayProgress,
  getTopStreak,
  getWeeklyCompletion,
  getGreeting,
  formatDayLabel,
  type TimelineSection,
} from "./utils";

import { useT } from "@/core/i18n";

export function useTodayData(initialDate: string = todayStr()) {
  const { t, language } = useT();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [currentToday, setCurrentToday] = useState(todayStr());
  const [focusMinutes, setFocusMinutes] = useState(0);
  const [taskHasLinks, setTaskHasLinks] = useState<Record<string, boolean>>({});

  const habits = useHabitsStore((s) => s.habits);
  const completions = useHabitsStore((s) => s.completions);
  const freezes = useHabitsStore((s) => s.freezes);
  const habitsLoading = useHabitsStore((s) => s.loading);
  const loadHabits = useHabitsStore((s) => s.load);
  const toggleHabitCompletion = useHabitsStore((s) => s.toggleCompletion);

  const tasksLoading = usePlannerStore((s) => s.loading);
  const loadPlannerMonth = usePlannerStore((s) => s.loadCurrentMonth);
  const toggleTaskDone = usePlannerStore((s) => s.toggleTaskDone);

  // AppState listener for Midnight Rollover
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (nextState === "active") {
        const freshToday = todayStr();
        if (freshToday !== currentToday) {
          if (selectedDate === currentToday) {
            setSelectedDate(freshToday);
          }
          setCurrentToday(freshToday);
        }
      }
    });
    return () => subscription.remove();
  }, [currentToday, selectedDate]);

  // Initial load
  useEffect(() => {
    loadHabits();
    loadPlannerMonth();
  }, [loadHabits, loadPlannerMonth]);

  // Habits and tasks for selected date
  const habitsForDate = useHabitsForDate(selectedDate);
  const tasksForDate = useTasksForDate(selectedDate);

  // Focus minutes: live from useFocusStore for today, repo for other dates
  const todayFocusSessions = useFocusStore((s) => s.todaySessions);
  const liveTodayMinutes = useMemo(
    () => selectTodayFocusMinutes(todayFocusSessions),
    [todayFocusSessions]
  );

  useEffect(() => {
    if (selectedDate === currentToday) return;
    let isMounted = true;
    focusRepo.getSessionsForDate(selectedDate).then((sessions) => {
      if (!isMounted) return;
      const totalSeconds = sessions
        .filter((s) => s.completed)
        .reduce((acc, s) => acc + s.durationSeconds, 0);
      setFocusMinutes(Math.round(totalSeconds / 60));
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [selectedDate, currentToday]);

  const effectiveFocusMinutes = selectedDate === currentToday ? liveTodayMinutes : focusMinutes;

  // Load YouTube links for tasks in a single batch query
  useEffect(() => {
    const taskIds = tasksForDate.map((t) => t.id);
    if (taskIds.length > 0) {
      useYouTubeStore.getState().loadForTasks(taskIds);
    }
  }, [tasksForDate]);

  // Top streak calculation
  const topStreakInfo = useMemo(() => {
    const list = habits.map((h) => ({
      habit: h,
      streak: computeStreak(h, completions[h.id] || [], selectedDate, freezes[h.id] || []),
    }));
    return getTopStreak(list);
  }, [habits, completions, freezes, selectedDate]);

  // Timeline
  const timelineSections = useMemo<TimelineSection[]>(() => {
    return buildTimeline(habitsForDate, tasksForDate, selectedDate, taskHasLinks);
  }, [habitsForDate, tasksForDate, selectedDate, taskHasLinks]);

  // Overall day progress
  const allTimelineItems = useMemo(() => {
    return timelineSections.flatMap((s) => s.items);
  }, [timelineSections]);

  const dayProgress = useMemo(() => {
    return getDayProgress(allTimelineItems);
  }, [allTimelineItems]);

  const weeklyCompletionRatio = useMemo(() => {
    return getWeeklyCompletion(habits, completions, selectedDate);
  }, [habits, completions, selectedDate]);

  const habitsDoneCount = useMemo(() => {
    return habitsForDate.filter((h) => h.isCompleted).length;
  }, [habitsForDate]);

  const tasksDoneCount = useMemo(() => {
    return tasksForDate.filter((t) => t.done).length;
  }, [tasksForDate]);

  const isFutureDate = selectedDate > currentToday;

  const reloadAll = useCallback(async () => {
    await Promise.all([loadHabits(), loadPlannerMonth()]);
  }, [loadHabits, loadPlannerMonth]);

  const greeting = useMemo(() => {
    return getGreeting(new Date().getHours(), t);
  }, [t, language]);

  const dateLabel = useMemo(() => {
    return formatDayLabel(selectedDate, currentToday, t);
  }, [selectedDate, currentToday, t, language]);

  return {
    selectedDate,
    setSelectedDate,
    currentToday,
    isFutureDate,
    greeting,
    dateLabel,
    timelineSections,
    allTimelineItems,
    dayProgress,
    topStreakInfo,
    weeklyCompletionRatio,
    habitsDoneCount,
    habitsTotalCount: habitsForDate.length,
    tasksDoneCount,
    tasksTotalCount: tasksForDate.length,
    focusMinutes: effectiveFocusMinutes,
    loading: habitsLoading || tasksLoading,
    reloadAll,
    toggleHabit: toggleHabitCompletion,
    toggleTask: toggleTaskDone,
  };
}
