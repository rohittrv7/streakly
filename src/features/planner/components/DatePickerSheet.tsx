import React, { useState, useEffect } from "react";
import { View, Pressable } from "react-native";
import { CaretLeft, CaretRight } from "@/components/icons";
import { parseISO, format } from "date-fns";
import { Sheet, Button, Text } from "@/components/ui";
import { MonthCalendar } from "./MonthCalendar";
import { shiftMonth } from "../calendar";
import { todayStr } from "@/core/utils/dates";
import { THEME_COLORS } from "@/lib/theme";

export interface DatePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  title?: string;
}

export function DatePickerSheet({
  visible,
  onClose,
  selectedDate,
  onSelectDate,
  title = "Select Date",
}: DatePickerSheetProps) {
  const [year, setYear] = useState(() => parseInt(selectedDate.slice(0, 4), 10) || 2026);
  const [month, setMonth] = useState(() => parseInt(selectedDate.slice(5, 7), 10) || 10);

  useEffect(() => {
    if (selectedDate && visible) {
      setYear(parseInt(selectedDate.slice(0, 4), 10) || 2026);
      setMonth(parseInt(selectedDate.slice(5, 7), 10) || 10);
    }
  }, [selectedDate, visible]);

  const handlePrev = () => {
    const next = shiftMonth(year, month, -1);
    setYear(next.year);
    setMonth(next.month);
  };

  const handleNext = () => {
    const next = shiftMonth(year, month, 1);
    setYear(next.year);
    setMonth(next.month);
  };

  const monthDate = parseISO(
    `${year}-${month < 10 ? `0${month}` : month}-01T12:00:00`
  );
  const monthTitle = format(monthDate, "MMMM yyyy");

  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <View className="gap-3 pb-3">
        {/* Month Selector Bar */}
        <View className="flex-row items-center justify-between px-1">
          <Pressable
            onPress={handlePrev}
            className="w-11 h-11 items-center justify-center rounded-button active:opacity-60"
            accessibilityLabel="Previous month"
          >
            <CaretLeft size={20} color={THEME_COLORS.text.primary} />
          </Pressable>

          <Text variant="title" className="text-base font-bold">
            {monthTitle}
          </Text>

          <Pressable
            onPress={handleNext}
            className="w-11 h-11 items-center justify-center rounded-button active:opacity-60"
            accessibilityLabel="Next month"
          >
            <CaretRight size={20} color={THEME_COLORS.text.primary} />
          </Pressable>
        </View>

        {/* Month Calendar */}
        <MonthCalendar
          year={year}
          month={month}
          selectedDate={selectedDate}
          onSelectDate={(d) => {
            onSelectDate(d);
            onClose();
          }}
        />

        {/* Today Quick Select */}
        <Button
          variant="ghost"
          size="sm"
          title="Jump to Today"
          onPress={() => {
            const today = todayStr();
            onSelectDate(today);
            onClose();
          }}
        />
      </View>
    </Sheet>
  );
}
