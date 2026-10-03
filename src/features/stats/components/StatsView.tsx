import React, { useState } from "react";
import { View, Text } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useReducedMotion,
} from "react-native-reanimated";
import { OverallHeroCard } from "./OverallHeroCard";
import { StatCard } from "./StatCard";
import { LineChart } from "./LineChart";
import { Heatmap } from "./Heatmap";
import { DayDetailSheet } from "./DayDetailSheet";
import { FocusStatsCard } from "./FocusStatsCard";
import { TasksStatsCard } from "./TasksStatsCard";
import { HabitBreakdownList } from "./HabitBreakdownList";
import { InsightChips } from "./InsightChips";
import type { StatsAggregatedData, HeatmapCell } from "../types";
import { useT } from "@/core/i18n";

interface StatsViewProps {
  data: StatsAggregatedData;
  highlightToday?: string;
}

export function StatsView({ data, highlightToday }: StatsViewProps) {
  const { t } = useT();
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const {
    range,
    overall,
    deltaPercent,
    streakSummary,
    consistencyBuckets,
    heatmapCells,
    focusSummary,
    focusBuckets,
    habitBreakdown,
    taskSummary,
    insights,
  } = data;

  const content = (
    <View className="gap-4 w-full">
      {/* Hero Card */}
      <OverallHeroCard
        overall={overall}
        delta={deltaPercent}
        range={range.range}
      />

      {/* Row of two StatCards: Current top streak and best streak ever */}
      <View className="flex-row gap-3">
        <StatCard
          label={t("habits.currentStreak")}
          value={streakSummary.topStreak}
          suffix="d"
          subtext={streakSummary.topStreakHabit?.name || t("today.noHabitsActive")}
        />
        <StatCard
          label={t("habits.bestStreak")}
          value={streakSummary.bestStreakEver}
          suffix="d"
          subtext={t("habits.bestStreak")}
        />
      </View>

      {/* Consistency Line Chart */}
      {consistencyBuckets.length > 0 && (
        <View className="bg-surface border border-white/5 rounded-2xl p-4">
          <Text className="text-muted text-xs font-semibold uppercase tracking-wider mb-2">
            {t("stats.overview")}
          </Text>
          <LineChart data={consistencyBuckets} height={150} />
        </View>
      )}

      {/* Heatmap Card */}
      {heatmapCells.length > 0 && (
        <View className="bg-surface border border-white/5 rounded-2xl p-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-muted text-xs font-semibold uppercase tracking-wider">
              {t("stats.weeklyActivity")}
            </Text>
          </View>
          <Heatmap
            cells={heatmapCells}
            onSelectCell={(cell) => setSelectedCell(cell)}
          />
        </View>
      )}

      {/* Focus & Deep Work Card */}
      <FocusStatsCard
        summary={focusSummary}
        buckets={focusBuckets}
        highlightDate={highlightToday}
      />

      {/* Habit Breakdown */}
      {habitBreakdown.length > 0 && (
        <View className="bg-surface border border-white/5 rounded-2xl p-4">
          <Text className="text-muted text-xs font-semibold uppercase tracking-wider mb-2">
            {t("stats.habitsPerformance")}
          </Text>
          <HabitBreakdownList items={habitBreakdown} />
        </View>
      )}

      {/* Tasks Overview Card */}
      <TasksStatsCard summary={taskSummary} />

      {/* Insights */}
      {insights.length > 0 && <InsightChips insights={insights} />}

      {/* Day Details Modal Sheet */}
      <DayDetailSheet
        cell={selectedCell}
        onClose={() => setSelectedCell(null)}
      />
    </View>
  );

  if (shouldReduceMotion) {
    return content;
  }

  return (
    <Animated.View
      key={range.range}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      className="w-full"
    >
      {content}
    </Animated.View>
  );
}
