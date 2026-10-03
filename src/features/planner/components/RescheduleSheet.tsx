import React, { useState } from "react";
import { View } from "react-native";
import { Sheet, Button, Text } from "@/components/ui";
import { MonthCalendar } from "./MonthCalendar";
import { todayStr, addDays } from "@/core/utils/dates";
import { parseISO } from "date-fns";
import { useT } from "@/core/i18n";

export interface RescheduleSheetProps {
  visible: boolean;
  onClose: () => void;
  onReschedule: (newDate: string) => void;
  taskTitle: string;
}

export function RescheduleSheet({
  visible,
  onClose,
  onReschedule,
  taskTitle,
}: RescheduleSheetProps) {
  const { t } = useT();
  const today = todayStr();
  const tomorrow = addDays(today, 1);
  const [showCalendar, setShowCalendar] = useState(false);

  const now = parseISO(`${today}T12:00:00`);
  const [pickerYear] = useState(now.getFullYear());
  const [pickerMonth] = useState(now.getMonth() + 1);

  const handlePick = (date: string) => {
    onReschedule(date);
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={t("planner.rescheduleTask")}>
      <View className="gap-3 pb-2">
        <Text variant="caption" className="text-text-secondary" numberOfLines={1}>
          {taskTitle}
        </Text>

        {/* Quick-choice options */}
        <View className="flex-row gap-2">
          <Button
            variant="primary"
            title={t("common.today")}
            className="flex-1"
            onPress={() => handlePick(today)}
          />
          <Button
            variant="secondary"
            title={t("common.tomorrow")}
            className="flex-1"
            onPress={() => handlePick(tomorrow)}
          />
        </View>

        <Button
          variant="ghost"
          title={showCalendar ? t("common.close") : t("planner.date")}
          onPress={() => setShowCalendar(!showCalendar)}
        />

        {/* Calendar Picker inside Sheet */}
        {showCalendar && (
          <View className="mt-1">
            <MonthCalendar
              year={pickerYear}
              month={pickerMonth}
              selectedDate={today}
              onSelectDate={handlePick}
            />
          </View>
        )}
      </View>
    </Sheet>
  );
}
