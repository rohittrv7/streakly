import React from "react";
import { View, Text } from "react-native";
import { THEME_COLORS } from "@/lib/theme";
import type { TaskSummary } from "../types";

interface TasksStatsCardProps {
  summary: TaskSummary;
}

export function TasksStatsCard({ summary }: TasksStatsCardProps) {
  const { done, missed, upcoming, total, byCategory } = summary;

  if (total === 0) {
    return (
      <View className="bg-surface border border-white/5 rounded-2xl p-4">
        <Text className="text-muted text-xs font-medium uppercase mb-2">
          Tasks
        </Text>
        <Text className="text-muted text-sm">No tasks scheduled in this period.</Text>
      </View>
    );
  }

  const doneRatio = total > 0 ? (done / total) * 100 : 0;
  const missedRatio = total > 0 ? (missed / total) * 100 : 0;
  const upcomingRatio = total > 0 ? (upcoming / total) * 100 : 0;

  const categories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  return (
    <View className="bg-surface border border-white/5 rounded-2xl p-4">
      <Text className="text-muted text-xs font-medium uppercase tracking-wider mb-3">
        Tasks Overview
      </Text>

      {/* Top 3 numbers */}
      <View className="flex-row justify-between mb-4">
        <View className="items-center flex-1">
          <Text className="text-lime text-2xl font-bold">{done}</Text>
          <Text className="text-muted text-xs font-medium mt-0.5">Done</Text>
        </View>
        <View className="items-center flex-1 border-x border-white/5">
          <Text className="text-coral text-2xl font-bold">{missed}</Text>
          <Text className="text-muted text-xs font-medium mt-0.5">Missed</Text>
        </View>
        <View className="items-center flex-1">
          <Text className="text-sky text-2xl font-bold">{upcoming}</Text>
          <Text className="text-muted text-xs font-medium mt-0.5">Upcoming</Text>
        </View>
      </View>

      {/* Stacked proportion bar */}
      <View className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden flex-row mb-3">
        {doneRatio > 0 && (
          <View
            style={{ width: `${doneRatio}%`, backgroundColor: THEME_COLORS.lime }}
            className="h-full"
          />
        )}
        {missedRatio > 0 && (
          <View
            style={{ width: `${missedRatio}%`, backgroundColor: THEME_COLORS.coral }}
            className="h-full"
          />
        )}
        {upcomingRatio > 0 && (
          <View
            style={{ width: `${upcomingRatio}%`, backgroundColor: THEME_COLORS.sky }}
            className="h-full"
          />
        )}
      </View>

      {/* Categories chips */}
      {categories.length > 0 && (
        <View className="flex-row flex-wrap gap-2 pt-1 border-t border-white/5">
          {categories.map(([cat, count]) => (
            <View
              key={cat}
              className="bg-elevated px-2.5 py-1 rounded-lg border border-white/5 flex-row items-center gap-1.5"
            >
              <Text className="text-text-secondary text-xs capitalize">
                {cat}
              </Text>
              <Text className="text-text-primary text-xs font-bold">
                {count}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
