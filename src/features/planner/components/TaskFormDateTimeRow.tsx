import React from "react";
import { View, Pressable } from "react-native";
import { Calendar, Clock } from "@/components/icons";
import { Text } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { useT } from "@/core/i18n";

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
  const { t } = useT();

  return (
    <View className="gap-1.5">
      <View className="flex-row gap-3">
        <Pressable
          onPress={onPressDate}
          className="flex-1 bg-surface p-3 rounded-card border border-border"
        >
          <Text variant="label" className="mb-1">{t("planner.date").toUpperCase()}</Text>
          <View className="flex-row items-center gap-2">
            <Calendar size={16} color={THEME_COLORS.primary} />
            <Text variant="body" className="font-semibold text-sm">{date}</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={onPressStartTime}
          className="flex-1 bg-surface p-3 rounded-card border border-border"
        >
          <Text variant="label" className="mb-1">{t("planner.startTime").toUpperCase()}</Text>
          <View className="flex-row items-center gap-2">
            <Clock size={16} color={THEME_COLORS.text.muted} />
            <Text variant="body" className="font-semibold text-sm">{startTime || t("today.anytime")}</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={onPressEndTime}
          className="flex-1 bg-surface p-3 rounded-card border border-border"
        >
          <Text variant="label" className="mb-1">{t("planner.duration").toUpperCase()}</Text>
          <View className="flex-row items-center gap-2">
            <Clock size={16} color={THEME_COLORS.text.muted} />
            <Text variant="body" className="font-semibold text-sm">{endTime || "--:--"}</Text>
          </View>
        </Pressable>
      </View>
      {timesError && <Text className="text-coral text-xs mt-1">{timesError}</Text>}
    </View>
  );
}
