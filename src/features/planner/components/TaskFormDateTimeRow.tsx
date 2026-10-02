import React from "react";
import { View, Pressable } from "react-native";
import { Calendar, Clock } from "phosphor-react-native";
import { Text } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";

export interface TaskFormDateTimeRowProps {
  date: string;
  startTime: string | null;
  endTime: string | null;
  onPressDate: () => void;
  onPressStartTime: () => void;
  onPressEndTime: () => void;
  timesError?: string;
}

export function TaskFormDateTimeRow({
  date,
  startTime,
  endTime,
  onPressDate,
  onPressStartTime,
  onPressEndTime,
  timesError,
}: TaskFormDateTimeRowProps) {
  return (
    <View className="gap-1.5">
      <View className="flex-row gap-3">
        <Pressable
          onPress={onPressDate}
          className="flex-1 bg-surface p-3 rounded-card border border-border"
        >
          <Text variant="label" className="mb-1">DATE</Text>
          <View className="flex-row items-center gap-2">
            <Calendar size={16} color={THEME_COLORS.primary} />
            <Text variant="body" className="font-semibold text-sm">{date}</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={onPressStartTime}
          className="flex-1 bg-surface p-3 rounded-card border border-border"
        >
          <Text variant="label" className="mb-1">START TIME</Text>
          <View className="flex-row items-center gap-2">
            <Clock size={16} color={THEME_COLORS.text.muted} />
            <Text variant="body" className="font-semibold text-sm">{startTime || "Anytime"}</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={onPressEndTime}
          className="flex-1 bg-surface p-3 rounded-card border border-border"
        >
          <Text variant="label" className="mb-1">END TIME</Text>
          <View className="flex-row items-center gap-2">
            <Clock size={16} color={THEME_COLORS.text.muted} />
            <Text variant="body" className="font-semibold text-sm">{endTime || "None"}</Text>
          </View>
        </Pressable>
      </View>
      {timesError && <Text className="text-coral text-xs mt-1">{timesError}</Text>}
    </View>
  );
}
