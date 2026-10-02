import { todayStr, addDays } from "@/core/utils/dates";
import type {
  StatsRawData,
  StatsAggregatedData,
  DateRange,
} from "./types";
import type { FocusSession } from "@/features/focus/types";
import {
  getDailyCompletion,
  getOverallCompletion,
  getDelta,
} from "./aggregate-habits";
import { getStreakSummary, getHabitBreakdown } from "./breakdown";
import { getTaskSummary, getFocusSummary } from "./aggregate-tasks";
import { getHeatmapCells } from "./heatmap";
import { getBuckets } from "./buckets";
import { getInsights } from "./insights";

export function aggregateStats(
  range: DateRange,
  rawData: StatsRawData,
  previousRawData: StatsRawData | null,
  today: string = todayStr(),
  heatmapData?: { completions: { habitId: string; date: string }[]; freezes: { habitId: string; date: string }[]; focusSessions: FocusSession[] }
): StatsAggregatedData {
  const dailyCompletions = getDailyCompletion(range, rawData);
  const overall = getOverallCompletion(range, rawData);
  const previousOverall = previousRawData
    ? getOverallCompletion(
        previousRawData.habits.length > 0
          ? {
              ...range,
              from: previousRawData.completions[0]?.date || range.from,
              to: previousRawData.completions[previousRawData.completions.length - 1]?.date || range.to,
            }
          : range,
        previousRawData
      )
    : null;
  const deltaPercent = getDelta(overall, previousOverall);

  const streakSummary = getStreakSummary(
    rawData.habits,
    rawData.completions,
    rawData.freezes,
    today
  );

  const habitBreakdown = getHabitBreakdown(range, rawData, today);
  const taskSummary = getTaskSummary(range, rawData.tasks, today);
  const focusSummary = getFocusSummary(range, rawData.focusSessions);

  // For heatmap, if heatmapData is provided, compute daily completions across the 13 weeks
  let heatmapDaily = dailyCompletions;
  let heatmapFocus = rawData.focusSessions;
  if (heatmapData) {
    const heatmapStart = addDays(today, -13 * 7);
    const hmRange: DateRange = {
      range: "90d",
      from: heatmapStart,
      to: today,
      days: 91,
    };
    heatmapDaily = getDailyCompletion(hmRange, {
      ...rawData,
      completions: heatmapData.completions,
      freezes: heatmapData.freezes,
    });
    heatmapFocus = heatmapData.focusSessions;
  }

  const heatmapCells = getHeatmapCells(
    range,
    heatmapDaily,
    heatmapFocus,
    today
  );

  // Daily consistency percentage points (0 - 100)
  const completionRatioPoints = dailyCompletions.map((dc) => ({
    date: dc.date,
    value: dc.ratio !== null ? Math.round(dc.ratio * 100) : 0,
  }));
  const consistencyBuckets = getBuckets(range, completionRatioPoints, "average");

  // Focus minutes buckets
  const focusBuckets = getBuckets(
    range,
    focusSummary.perDayMinutes.map((p) => ({ date: p.date, value: p.minutes })),
    "sum"
  );

  const insights = getInsights({ dailyCompletions, focusSummary });

  const hasData =
    rawData.completions.length > 0 ||
    taskSummary.done > 0 ||
    focusSummary.sessionCount > 0;

  return {
    range,
    overall,
    previousOverall,
    deltaPercent,
    streakSummary,
    dailyCompletions,
    habitBreakdown,
    taskSummary,
    focusSummary,
    heatmapCells,
    consistencyBuckets,
    focusBuckets,
    insights,
    hasData,
  };
}
