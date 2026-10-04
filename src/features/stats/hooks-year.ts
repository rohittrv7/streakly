import { useState, useCallback, useRef } from "react";
import { useFocusEffect } from "expo-router";
import { parseISO } from "date-fns";
import { todayStr, toDateStr } from "@/core/utils/dates";
import { habitsRepo } from "@/features/habits/repo";
import { plannerRepo } from "@/features/planner/repo";
import { focusRepo } from "@/features/focus/repo";
import type { Task } from "@/features/planner/types";
import type { FocusSession } from "@/features/focus/types";
import { getDailyCompletion } from "./aggregate-habits";
import {
  getYearDots,
  getYearSummary,
  getDaysInYear,
  type YearDot,
  type YearSummary,
} from "./year";
import type { DailyCompletion, StatsRawData } from "./types";

export interface YearDataState {
  dots: YearDot[];
  summary: YearSummary;
  loading: boolean;
  error: string | null;
  earliestYear: number;
  currentYear: number;
  retry: () => void;
  dailyCompletions: DailyCompletion[];
  tasks: Task[];
  focusSessions: FocusSession[];
}

const yearDataCache = new Map<
  number,
  {
    dots: YearDot[];
    summary: YearSummary;
    earliestYear: number;
    dailyCompletions: DailyCompletion[];
    tasks: Task[];
    focusSessions: FocusSession[];
  }
>();

export function useYearData(year: number): YearDataState {
  const [dots, setDots] = useState<YearDot[]>(() => yearDataCache.get(year)?.dots ?? []);
  const [summary, setSummary] = useState<YearSummary>(() => {
    return (
      yearDataCache.get(year)?.summary ?? {
        dayOfYear: 0,
        totalDays: 0,
        daysLeft: 0,
        percentPassed: 0,
        activeDays: 0,
        perfectDays: 0,
      }
    );
  });
  const [loading, setLoading] = useState(!yearDataCache.has(year));
  const [error, setError] = useState<string | null>(null);
  const [earliestYear, setEarliestYear] = useState<number>(() => {
    return yearDataCache.get(year)?.earliestYear ?? new Date().getFullYear();
  });
  const [dailyCompletions, setDailyCompletions] = useState<DailyCompletion[]>(
    () => yearDataCache.get(year)?.dailyCompletions ?? []
  );
  const [tasks, setTasks] = useState<Task[]>(() => yearDataCache.get(year)?.tasks ?? []);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(
    () => yearDataCache.get(year)?.focusSessions ?? []
  );

  const currentYear = new Date().getFullYear();
  const yearRef = useRef(year);
  yearRef.current = year;

  const loadYearData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const targetYear = yearRef.current;
      const today = todayStr();
      const from = `${targetYear}-01-01`;
      const to = `${targetYear}-12-31`;

      const [habits, completions, freezes, yearTasks, sessions] = await Promise.all([
        habitsRepo.list(true),
        habitsRepo.getCompletionsInRange(from, to),
        habitsRepo.getFreezesInRange(from, to),
        plannerRepo.getTasksInRange(from, to),
        focusRepo.getSessionsInRange(from, to),
      ]);

      const validSessions = sessions.filter((s) => s.completed || s.durationSeconds >= 60);

      const rawData: StatsRawData = {
        habits,
        completions,
        freezes,
        tasks: yearTasks,
        focusSessions: validSessions.filter((s) => {
          const d = toDateStr(parseISO(s.startedAt));
          return d >= from && d <= to;
        }),
      };

      const totalYearDays = getDaysInYear(targetYear);
      const daily = getDailyCompletion({ range: "year", from, to, days: totalYearDays }, rawData);
      const computedDots = getYearDots(targetYear, today, daily);
      const computedSummary = getYearSummary(computedDots, today);

      // Determine earliest year
      let earliest = currentYear;
      for (const h of habits) {
        if (h.createdAt) {
          const y = parseInt(h.createdAt.slice(0, 4), 10);
          if (!isNaN(y) && y < earliest) earliest = y;
        }
      }
      for (const c of completions) {
        const y = parseInt(c.date.slice(0, 4), 10);
        if (!isNaN(y) && y < earliest) earliest = y;
      }
      for (const t of yearTasks) {
        const y = parseInt(t.date.slice(0, 4), 10);
        if (!isNaN(y) && y < earliest) earliest = y;
      }

      yearDataCache.set(targetYear, {
        dots: computedDots,
        summary: computedSummary,
        earliestYear: earliest,
        dailyCompletions: daily,
        tasks: yearTasks,
        focusSessions: validSessions,
      });

      setDots(computedDots);
      setSummary(computedSummary);
      setEarliestYear(earliest);
      setDailyCompletions(daily);
      setTasks(yearTasks);
      setFocusSessions(validSessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load year data");
    } finally {
      setLoading(false);
    }
  }, [currentYear]);

  useFocusEffect(
    useCallback(() => {
      loadYearData();
    }, [loadYearData])
  );

  return {
    dots,
    summary,
    loading,
    error,
    earliestYear,
    currentYear,
    retry: loadYearData,
    dailyCompletions,
    tasks,
    focusSessions,
  };
}
