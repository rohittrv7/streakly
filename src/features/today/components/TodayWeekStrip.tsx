import React from "react";
import { View, Pressable } from "react-native";
import { startOfWeek, endOfWeek, parseISO, format } from "date-fns";
import { CaretLeft, CaretRight } from "@/components/icons";
import { Haptics } from "@/core/utils/haptics";
import { Text } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { useAccent } from "@/lib/theme/store";
import { addDays, toDateStr } from "@/core/utils/dates";

export interface TodayWeekStripProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  today: string;
}

export function TodayWeekStrip({
  selectedDate,
  onSelectDate,
  today,
}: TodayWeekStripProps) {
  const { accent } = useAccent();
  const currentDate = parseISO(`${selectedDate}T12:00:00`);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const days: Array<{ date: string; dayShort: string; dayNum: string; isToday: boolean; isSelected: boolean }> = [];
  let curr = weekStart;
  while (curr <= weekEnd) {
    const dStr = toDateStr(curr);
    days.push({
      date: dStr,
      dayShort: format(curr, "EEEEE"),
      dayNum: format(curr, "d"),
      isToday: dStr === today,
      isSelected: dStr === selectedDate,
    });
    curr = parseISO(`${addDays(toDateStr(curr), 1)}T12:00:00`);
  }

  const handlePrevWeek = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectDate(addDays(selectedDate, -7));
  };

  const handleNextWeek = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectDate(addDays(selectedDate, 7));
  };

  const handleSelect = (date: string) => {
    Haptics.selectionAsync();
    onSelectDate(date);
  };

  const headerMonthLabel = format(currentDate, "MMMM yyyy");

  return (
    <View className="mb-6 bg-surface border border-border rounded-card p-3.5">
      {/* Month & Week Controls */}
      <View className="flex-row items-center justify-between mb-3 px-1">
        <Text variant="body" className="font-bold text-text-primary text-sm">
          {headerMonthLabel}
        </Text>
        <View className="flex-row items-center gap-1">
          <Pressable
            onPress={handlePrevWeek}
            hitSlop={8}
            className="w-8 h-8 rounded-full bg-elevated items-center justify-center active:opacity-70"
            accessibilityLabel="Previous week"
            accessibilityRole="button"
          >
            <CaretLeft size={16} color={THEME_COLORS.text.primary} weight="bold" />
          </Pressable>
          <Pressable
            onPress={handleNextWeek}
            hitSlop={8}
            className="w-8 h-8 rounded-full bg-elevated items-center justify-center active:opacity-70"
            accessibilityLabel="Next week"
            accessibilityRole="button"
          >
            <CaretRight size={16} color={THEME_COLORS.text.primary} weight="bold" />
          </Pressable>
        </View>
      </View>

      {/* 7 Days Row */}
      <View className="flex-row justify-between">
        {days.map((item) => (
          <Pressable
            key={item.date}
            onPress={() => handleSelect(item.date)}
            className="items-center py-1.5 px-2 rounded-card-sm min-w-[40px]"
            style={{
              backgroundColor: item.isSelected
                ? accent.hex
                : item.isToday
                ? THEME_COLORS.elevated
                : "transparent",
            }}
            accessibilityRole="button"
            accessibilityLabel={`${item.dayShort} ${item.dayNum}`}
          >
            <Text
              style={{
                color: item.isSelected
                  ? accent.onAccentHex
                  : item.isToday
                  ? accent.hex
                  : THEME_COLORS.text.muted,
              }}
              className="text-[11px] font-bold mb-0.5"
            >
              {item.dayShort}
            </Text>
            <Text
              style={{
                color: item.isSelected
                  ? accent.onAccentHex
                  : THEME_COLORS.text.primary,
              }}
              className="text-sm font-extrabold"
            >
              {item.dayNum}
            </Text>
            {item.isToday && (
              <View
                style={{
                  backgroundColor: item.isSelected
                    ? accent.onAccentHex
                    : accent.hex,
                }}
                className="w-1.5 h-1.5 rounded-full mt-1"
              />
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}
