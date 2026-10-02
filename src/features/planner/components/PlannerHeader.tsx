import React from "react";
import { View, Pressable } from "react-native";
import { CaretLeft, CaretRight, CalendarPlus, Calendar } from "phosphor-react-native";
import { Text, Button } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";

export interface PlannerHeaderProps {
  monthLabel: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  showTodayButton: boolean;
  onJumpToday: () => void;
  onPlanMonth: () => void;
}

export function PlannerHeader({
  monthLabel,
  onPrevMonth,
  onNextMonth,
  showTodayButton,
  onJumpToday,
  onPlanMonth,
}: PlannerHeaderProps) {
  return (
    <View className="flex-row items-center justify-between pt-4 pb-3">
      <View className="flex-row items-center gap-1.5">
        <Calendar size={18} color={THEME_COLORS.primary} weight="fill" />
        <Text variant="title" className="text-xl font-bold">{monthLabel}</Text>
      </View>
      <View className="flex-row items-center gap-1">
        <Pressable
          onPress={onPrevMonth}
          className="w-10 h-10 items-center justify-center rounded-button active:opacity-60"
          accessibilityLabel="Previous month"
        >
          <CaretLeft size={18} color={THEME_COLORS.text.primary} />
        </Pressable>
        <Pressable
          onPress={onNextMonth}
          className="w-10 h-10 items-center justify-center rounded-button active:opacity-60"
          accessibilityLabel="Next month"
        >
          <CaretRight size={18} color={THEME_COLORS.text.primary} />
        </Pressable>
        {showTodayButton && (
          <Button variant="ghost" size="sm" title="Today" onPress={onJumpToday} className="px-2" />
        )}
        <Button
          variant="secondary"
          size="sm"
          title="Plan"
          icon={<CalendarPlus size={15} color={THEME_COLORS.text.primary} weight="bold" />}
          onPress={onPlanMonth}
        />
      </View>
    </View>
  );
}
