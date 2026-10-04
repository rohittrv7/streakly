import React from "react";
import { View, Pressable } from "react-native";
import { Check } from "@/components/icons";
import { Haptics } from "@/core/utils/haptics";
import { getMonthGrid, type DayTaskDots } from "../calendar";
import { Text } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { useAccent } from "@/lib/theme/store";
import { todayStr } from "@/core/utils/dates";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

export interface MonthCalendarProps {
  year: number;
  month: number;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  taskDots?: Record<string, DayTaskDots>;
  today?: string;
}

export function MonthCalendar({
  year,
  month,
  selectedDate,
  onSelectDate,
  taskDots = {},
  today = todayStr(),
}: MonthCalendarProps) {
  const { accent } = useAccent();
  const grid = getMonthGrid(year, month);

  const handleSelect = (date: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectDate(date);
  };

  return (
    <View className="bg-surface p-3 rounded-card border border-border">
      {/* Weekday Labels (Mon-Sun) */}
      <View className="flex-row justify-between mb-2 pb-1 border-b border-border">
        {WEEKDAYS.map((w, idx) => (
          <View key={idx} className="flex-1 items-center">
            <Text variant="caption" className="font-bold text-[11px] text-text-muted">
              {w}
            </Text>
          </View>
        ))}
      </View>

      {/* 6x7 Calendar Grid */}
      <View className="flex-row flex-wrap">
        {grid.map((cell) => {
          const isSelected = cell.date === selectedDate;
          const isToday = cell.date === today;
          const dotsInfo = taskDots[cell.date];

          let cellBg = "transparent";
          if (isSelected) {
            cellBg = accent.hex;
          }

          let borderStyle: any = {};
          if (isToday && !isSelected) {
            borderStyle = { borderColor: accent.hex, borderWidth: 1.5 };
          }

          return (
            <View key={cell.date} className="w-[14.28%] items-center py-1">
              <Pressable
                onPress={() => handleSelect(cell.date)}
                style={[{ backgroundColor: cellBg }, borderStyle]}
                className={`w-9 h-9 rounded-full items-center justify-center ${
                  !cell.inMonth ? "opacity-25" : "opacity-100"
                }`}
                accessibilityRole="button"
                accessibilityLabel={`${cell.date}`}
              >
                <Text
                  style={{
                    color: isSelected
                      ? accent.onAccentHex
                      : isToday
                      ? accent.hex
                      : THEME_COLORS.text.primary,
                  }}
                  className="text-xs font-bold"
                >
                  {cell.dayNumber}
                </Text>

                {/* Task Indicators (Dots or Check) */}
                {dotsInfo && (
                  <View className="absolute bottom-1 flex-row gap-0.5 items-center justify-center">
                    {dotsInfo.count > 0 && !dotsInfo.allDone && (
                      <View className="w-1 h-1 rounded-full bg-coral" />
                    )}
                    {dotsInfo.allDone && !isSelected && (
                      <Check size={8} color={THEME_COLORS.mint} weight="bold" />
                    )}
                  </View>
                )}
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
