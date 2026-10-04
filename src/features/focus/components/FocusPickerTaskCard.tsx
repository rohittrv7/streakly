import React from "react";
import { View, Pressable } from "react-native";
import { Calendar, Play, Check } from "@/components/icons";
import { Text, CategoryChip } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { useAccent } from "@/lib/theme/store";
import { formatDayLabel } from "@/features/planner/utils";
import type { Task } from "@/features/planner/types";

export interface FocusPickerTaskCardProps {
  task: Task;
  selected: boolean;
  showDate?: boolean;
  videoCount?: number;
  watchedCount?: number;
  onSelect: () => void;
}

export function FocusPickerTaskCard({
  task,
  selected,
  showDate = false,
  videoCount = 0,
  watchedCount = 0,
  onSelect,
}: FocusPickerTaskCardProps) {
  const { accent } = useAccent();

  return (
    <Pressable
      onPress={onSelect}
      style={{
        borderColor: selected ? accent.hex : THEME_COLORS.border,
        backgroundColor: selected ? accent.softBackground : THEME_COLORS.elevated,
      }}
      className="flex-row items-center justify-between p-3 rounded-2xl border"
      accessibilityRole="button"
      accessibilityLabel={`Select task ${task.title}`}
    >
      <View className="flex-1 mr-2">
        <Text variant="body" className="font-bold text-sm text-text-primary mb-1.5" numberOfLines={2}>
          {task.title}
        </Text>
        <View className="flex-row items-center flex-wrap gap-2">
          <CategoryChip category={task.category} />
          {task.startTime && (
            <Text variant="caption" className="text-text-secondary text-xs">
              {task.startTime}
              {task.endTime ? ` - ${task.endTime}` : ""}
            </Text>
          )}
          {showDate && (
            <View className="flex-row items-center gap-1 bg-surface px-2 py-0.5 rounded-full border border-border">
              <Calendar size={11} color={THEME_COLORS.text.muted} />
              <Text variant="caption" className="text-[11px] text-text-secondary">
                {formatDayLabel(task.date)}
              </Text>
            </View>
          )}
          {videoCount > 0 && (
            <View className="flex-row items-center gap-1 bg-surface px-2 py-0.5 rounded-full border border-border">
              <Play size={10} color={THEME_COLORS.coral} weight="fill" />
              <Text variant="caption" className="text-[11px] text-text-secondary font-medium">
                {watchedCount}/{videoCount}
              </Text>
            </View>
          )}
        </View>
      </View>
      {selected && <Check size={18} color={accent.hex} weight="bold" />}
    </Pressable>
  );
}
