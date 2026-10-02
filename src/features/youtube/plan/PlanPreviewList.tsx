import React from "react";
import { View, Pressable, ScrollView } from "react-native";
import { CheckSquare, Square } from "phosphor-react-native";
import { Text } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import type { DayPlan } from "./types";
import { formatPlanDuration } from "./format";

interface PlanPreviewListProps {
  days: DayPlan[];
  skippedDates: Set<string>;
  onToggleSkipDate: (date: string) => void;
}

export function PlanPreviewList({ days, skippedDates, onToggleSkipDate }: PlanPreviewListProps) {
  if (days.length === 0) {
    return (
      <View className="py-4 items-center">
        <Text variant="caption" className="text-text-muted">No days match your schedule criteria.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="max-h-56 my-2" nestedScrollEnabled showsVerticalScrollIndicator>
      <View className="gap-2 pb-2">
        {days.map((day) => {
          const isSkipped = skippedDates.has(day.date);
          return (
            <View
              key={day.date}
              className={`p-2.5 rounded-[12px] border ${
                isSkipped ? "bg-card/40 border-border/40 opacity-50" : "bg-card border-border"
              }`}
            >
              <Pressable
                onPress={() => onToggleSkipDate(day.date)}
                className="flex-row items-center justify-between mb-1.5 min-h-[36px]"
              >
                <View className="flex-row items-center gap-2 flex-1">
                  {isSkipped ? (
                    <Square size={18} color={THEME_COLORS.text.muted} />
                  ) : (
                    <CheckSquare size={18} color={THEME_COLORS.primary} weight="fill" />
                  )}
                  <Text variant="body" className={`font-bold text-xs ${isSkipped ? "line-through text-text-muted" : ""}`}>
                    Day {day.dayIndex} · {day.date}
                  </Text>
                </View>
                <Text variant="caption" className="text-[10px] text-text-muted">
                  {day.videos.length} videos · {formatPlanDuration(day.totalDurationSeconds)}
                </Text>
              </Pressable>

              {!isSkipped && (
                <View className="pl-6 gap-0.5">
                  {day.videos.map((v, i) => (
                    <Text key={v.videoId + i} variant="caption" className="text-[11px] text-text-secondary" numberOfLines={1}>
                      • {v.title}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
