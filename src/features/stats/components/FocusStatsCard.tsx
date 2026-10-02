import React from "react";
import { View, Text } from "react-native";
import { THEME_COLORS } from "@/lib/theme";
import { BarChart } from "./BarChart";
import { HorizontalBars, type HorizontalBarItem } from "./HorizontalBars";
import { formatMinutes } from "../format";
import type { FocusSummary, StatBucket } from "../types";

const CATEGORY_COLORS: Record<string, string> = {
  Study: THEME_COLORS.lime,
  study: THEME_COLORS.lime,
  Fitness: THEME_COLORS.mint,
  fitness: THEME_COLORS.mint,
  Reading: THEME_COLORS.coral,
  reading: THEME_COLORS.coral,
  Work: THEME_COLORS.sky,
  work: THEME_COLORS.sky,
  Custom: THEME_COLORS.text.muted,
  custom: THEME_COLORS.text.muted,
};

interface FocusStatsCardProps {
  summary: FocusSummary;
  buckets: StatBucket[];
  highlightDate?: string;
}

export function FocusStatsCard({
  summary,
  buckets,
  highlightDate,
}: FocusStatsCardProps) {
  const { totalMinutes, sessionCount, averagePerDay, perCategoryMinutes } =
    summary;

  if (sessionCount === 0) {
    return (
      <View className="bg-surface border border-white/5 rounded-2xl p-4">
        <Text className="text-muted text-xs font-medium uppercase tracking-wider mb-2">
          Focus Time
        </Text>
        <Text className="text-muted text-sm">
          No focus sessions recorded in this period.
        </Text>
      </View>
    );
  }

  const barItems: HorizontalBarItem[] = perCategoryMinutes.map((c) => ({
    id: c.category,
    label: c.category.charAt(0).toUpperCase() + c.category.slice(1),
    value: c.minutes,
    formattedValue: `${formatMinutes(c.minutes)} (${c.percent}%)`,
    color: CATEGORY_COLORS[c.category] || THEME_COLORS.lime,
  }));

  return (
    <View className="bg-surface border border-white/5 rounded-2xl p-4">
      <Text className="text-muted text-xs font-medium uppercase tracking-wider mb-3">
        Focus & Deep Work
      </Text>

      {/* 3 top metrics */}
      <View className="flex-row justify-between mb-4">
        <View className="items-center flex-1">
          <Text className="text-lime text-2xl font-bold">
            {formatMinutes(totalMinutes)}
          </Text>
          <Text className="text-muted text-xs font-medium mt-0.5">Total</Text>
        </View>
        <View className="items-center flex-1 border-x border-white/5">
          <Text className="text-text-primary text-2xl font-bold">
            {sessionCount}
          </Text>
          <Text className="text-muted text-xs font-medium mt-0.5">Sessions</Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-sky text-2xl font-bold">
            {formatMinutes(Math.round(averagePerDay))}
          </Text>
          <Text className="text-muted text-xs font-medium mt-0.5">Daily Avg</Text>
        </View>
      </View>

      {/* BarChart of focus minutes per day/week */}
      {buckets.length > 0 && (
        <View className="mb-4">
          <BarChart
            data={buckets}
            height={130}
            highlightDate={highlightDate}
            barColor={THEME_COLORS.sky}
            unit="m"
          />
        </View>
      )}

      {/* HorizontalBars for focus by category */}
      {barItems.length > 0 && (
        <View className="pt-3 border-t border-white/5">
          <Text className="text-muted text-xs font-medium uppercase tracking-wider mb-2.5">
            By Category
          </Text>
          <HorizontalBars items={barItems} />
        </View>
      )}
    </View>
  );
}
