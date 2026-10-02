import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Haptics } from "@/core/utils/haptics";
import type { Habit, HabitFrequencyType } from "../types";
import { HabitVisualPickers } from "./HabitVisualPickers";
import { HabitStatsSection } from "./HabitStatsSection";
import { Text, Input, Button, Pill } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";

const WEEKDAYS = [
  { day: 1, label: "M" },
  { day: 2, label: "T" },
  { day: 3, label: "W" },
  { day: 4, label: "T" },
  { day: 5, label: "F" },
  { day: 6, label: "S" },
  { day: 0, label: "S" },
];

export interface HabitFormProps {
  initialHabit?: Habit | null;
  onSubmit: (data: {
    name: string;
    icon: string;
    color: string;
    frequencyType: HabitFrequencyType;
    weekdays: number[];
    timesPerWeek: number | null;
    reminderTime: string | null;
  }) => Promise<void>;
  onArchive?: () => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function HabitForm({
  initialHabit,
  onSubmit,
  onArchive,
  onDelete,
}: HabitFormProps) {
  const isEditing = Boolean(initialHabit);
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 16) + 32;

  const [name, setName] = useState(initialHabit?.name || "");
  const [icon, setIcon] = useState(initialHabit?.icon || "book");
  const [color, setColor] = useState(initialHabit?.color || THEME_COLORS.lime);
  const [freqType, setFreqType] = useState<HabitFrequencyType>(
    initialHabit?.frequencyType || "daily"
  );
  const [weekdays, setWeekdays] = useState<number[]>(
    initialHabit?.weekdays?.length ? initialHabit.weekdays : [1, 2, 3, 4, 5]
  );
  const [timesPerWeek, setTimesPerWeek] = useState<number>(
    initialHabit?.timesPerWeek || 3
  );
  const [reminderTime, setReminderTime] = useState(initialHabit?.reminderTime || "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toggleWeekday = (day: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (weekdays.includes(day)) {
      if (weekdays.length > 1) setWeekdays(weekdays.filter((d) => d !== day));
    } else {
      setWeekdays([...weekdays, day]);
    }
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a habit name.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }
    if (trimmed.length > 40) {
      setError("Habit name must be 40 characters or fewer.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }
    if (freqType === "specific_days" && weekdays.length === 0) {
      setError("Select at least one weekday.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        name: trimmed,
        icon,
        color,
        frequencyType: freqType,
        weekdays: freqType === "specific_days" ? weekdays : [],
        timesPerWeek: freqType === "times_per_week" ? timesPerWeek : null,
        reminderTime: reminderTime.trim() || null,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save habit");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ paddingBottom: bottomPadding }} className="gap-5">
      {/* 1. Name Input */}
      <View>
        <Text variant="label" className="mb-2">HABIT NAME</Text>
        <Input
          placeholder="e.g. Read 15 pages, Morning Run"
          value={name}
          onChangeText={(val) => {
            setName(val);
            if (error) setError(null);
          }}
          maxLength={40}
        />
        {error && <Text variant="caption" className="text-coral mt-1.5">{error}</Text>}
      </View>

      {/* 2. Visual Pickers (Color & Icon) */}
      <HabitVisualPickers
        color={color}
        onColorChange={setColor}
        icon={icon}
        onIconChange={setIcon}
      />

      {/* 3. Frequency Selector */}
      <View>
        <Text variant="label" className="mb-2">FREQUENCY</Text>
        <View className="flex-row gap-2 mb-3">
          <Pill label="Daily" selected={freqType === "daily"} onPress={() => setFreqType("daily")} />
          <Pill label="Specific Days" selected={freqType === "specific_days"} onPress={() => setFreqType("specific_days")} />
          <Pill label="Times / Week" selected={freqType === "times_per_week"} onPress={() => setFreqType("times_per_week")} />
        </View>

        {freqType === "specific_days" && (
          <View className="flex-row justify-between bg-surface p-3 rounded-card border border-border">
            {WEEKDAYS.map(({ day, label }) => {
              const active = weekdays.includes(day);
              return (
                <Pressable
                  key={day}
                  onPress={() => toggleWeekday(day)}
                  style={{ backgroundColor: active ? color : THEME_COLORS.elevated }}
                  className="w-9 h-9 rounded-full items-center justify-center border border-border"
                >
                  <Text className={`text-xs font-bold ${active ? "text-background" : "text-text-secondary"}`}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {freqType === "times_per_week" && (
          <View className="flex-row items-center justify-between bg-surface p-3 rounded-card border border-border">
            <Text variant="body" className="font-semibold">Goal per week</Text>
            <View className="flex-row items-center gap-3">
              <Button variant="secondary" size="sm" title="-" onPress={() => setTimesPerWeek(Math.max(1, timesPerWeek - 1))} />
              <Text variant="title" className="min-w-[24px] text-center font-extrabold">{timesPerWeek}</Text>
              <Button variant="secondary" size="sm" title="+" onPress={() => setTimesPerWeek(Math.min(7, timesPerWeek + 1))} />
            </View>
          </View>
        )}
      </View>

      {/* 4. Reminder Time */}
      <View>
        <Text variant="label" className="mb-2">DAILY REMINDER (OPTIONAL)</Text>
        <Input placeholder="e.g. 08:30" value={reminderTime} onChangeText={setReminderTime} maxLength={10} />
      </View>

      {/* Save Button */}
      <Button
        variant="primary"
        title={isEditing ? "Save Changes" : "Create Habit"}
        loading={submitting}
        onPress={handleSave}
        className="mt-2"
      />

      {/* In Edit mode: stats, archive & delete */}
      {isEditing && initialHabit && onArchive && onDelete && (
        <HabitStatsSection habit={initialHabit} onArchive={onArchive} onDelete={onDelete} />
      )}
    </View>
  );
}
