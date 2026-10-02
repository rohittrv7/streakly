import { useState, useCallback, useRef, useEffect } from "react";
import { useFocusEffect } from "expo-router";
import { parseISO } from "date-fns";
import { todayStr, addDays, toDateStr } from "@/core/utils/dates";
import { habitsRepo } from "@/features/habits/repo";
import { plannerRepo } from "@/features/planner/repo";
import { focusRepo } from "@/features/focus/repo";
import { getRange, getPreviousRange } from "./ranges";
import { aggregateStats } from "./aggregate";
import type {
  StatsRange,
  StatsAggregatedData,
  StatsRawData,
} from "./types";

export function useStatsData(range: StatsRange) {
  const [data, setData] = useState<StatsAggregatedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rangeRef = useRef(range);
  rangeRef.current = range;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const today = todayStr();
      const currentRange = getRange(rangeRef.current, today);
      const prevRange = getPreviousRange(currentRange, today);

      // Load enough history to cover current period, previous period, and 13 weeks of heatmap
      const heatmap13WeeksAgo = addDays(today, -13 * 7);
      const earliestStart = [prevRange.from, currentRange.from, heatmap13WeeksAgo].sort()[0];
      const latestEnd = currentRange.to;

      const [habits, completions, freezes, tasks, sessions] = await Promise.all([
        habitsRepo.list(true),
        habitsRepo.getCompletionsInRange(earliestStart, latestEnd),
        habitsRepo.getFreezesInRange(earliestStart, latestEnd),
        plannerRepo.getTasksInRange(earliestStart, latestEnd),
        focusRepo.getSessionsInRange(earliestStart, latestEnd),
      ]);

      // Normalize focus session dates using parseISO + toDateStr (never new Date("YYYY-MM-DD"))
      const validSessions = sessions.filter((s) => {
        return s.completed || s.durationSeconds >= 60;
      });

      const currentRawData: StatsRawData = {
        habits,
        completions: completions.filter(
          (c) => c.date >= currentRange.from && c.date <= currentRange.to
        ),
        freezes: freezes.filter(
          (f) => f.date >= currentRange.from && f.date <= currentRange.to
        ),
        tasks: tasks.filter(
          (t) => t.date >= currentRange.from && t.date <= currentRange.to
        ),
        focusSessions: validSessions.filter((s) => {
          const d = toDateStr(parseISO(s.startedAt));
          return d >= currentRange.from && d <= currentRange.to;
        }),
      };

      const previousRawData: StatsRawData = {
        habits,
        completions: completions.filter(
          (c) => c.date >= prevRange.from && c.date <= prevRange.to
        ),
        freezes: freezes.filter(
          (f) => f.date >= prevRange.from && f.date <= prevRange.to
        ),
        tasks: tasks.filter(
          (t) => t.date >= prevRange.from && t.date <= prevRange.to
        ),
        focusSessions: validSessions.filter((s) => {
          const d = toDateStr(parseISO(s.startedAt));
          return d >= prevRange.from && d <= prevRange.to;
        }),
      };

      const aggregated = aggregateStats(
        currentRange,
        currentRawData,
        previousRawData,
        today,
        {
          completions,
          freezes,
          focusSessions: validSessions,
        }
      );

      setData(aggregated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [range, loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  return {
    data,
    loading,
    error,
    retry: loadData,
    refresh: loadData,
  };
}
