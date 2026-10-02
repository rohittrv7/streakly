import React, { useState } from "react";
import { View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CaretLeft, Target } from "phosphor-react-native";
import { Screen, Text, Button } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { useHabit, useHabits } from "@/features/habits";
import { HabitForm } from "@/features/habits/components/HabitForm";
import { canShowPrePermissionSheet } from "@/lib/notifications";
import { PrePermissionSheet } from "@/features/settings";

export default function HabitDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const habit = useHabit(id);
  const { updateHabit, archiveHabit, deleteHabit } = useHabits();
  const [showPermSheet, setShowPermSheet] = useState(false);

  if (!habit) {
    return (
      <Screen scroll>
        <View className="flex-row items-center gap-3 pt-2 pb-6 border-b border-border mb-6">
          <Button
            variant="icon-only"
            size="sm"
            icon={<CaretLeft size={20} color={THEME_COLORS.text.primary} weight="bold" />}
            onPress={() => router.back()}
            accessibilityLabel="Back"
          />
          <Text variant="title">Habit Not Found</Text>
        </View>
        <Text variant="body" className="text-text-secondary">
          This habit may have been deleted or does not exist.
        </Text>
      </Screen>
    );
  }

  const handleUpdate = async (data: Parameters<typeof updateHabit>[1]) => {
    await updateHabit(habit.id, data);
    if (data.reminderTime && !habit.reminderTime) {
      const canAsk = await canShowPrePermissionSheet();
      if (canAsk) {
        setShowPermSheet(true);
        return;
      }
    }
    router.back();
  };

  const handleArchive = async () => {
    await archiveHabit(habit.id);
    router.back();
  };

  const handleDelete = async () => {
    await deleteHabit(habit.id);
    router.back();
  };

  return (
    <Screen scroll>
      {/* Custom Header with Back Button */}
      <View className="flex-row items-center gap-3 pt-2 pb-6 border-b border-border mb-6">
        <Button
          variant="icon-only"
          size="sm"
          icon={<CaretLeft size={20} color={THEME_COLORS.text.primary} weight="bold" />}
          onPress={() => router.back()}
          accessibilityLabel="Back"
        />
        <View className="flex-1">
          <View className="flex-row items-center gap-1.5 mb-0.5">
            <Target size={13} color={habit.color} weight="fill" />
            <Text variant="label">EDIT ROUTINE</Text>
          </View>
          <Text variant="title" numberOfLines={1}>{habit.name}</Text>
        </View>
      </View>

      {/* Habit Edit Form with Stats, Archive & Delete */}
      <HabitForm
        initialHabit={habit}
        onSubmit={handleUpdate}
        onArchive={handleArchive}
        onDelete={handleDelete}
      />

      <PrePermissionSheet
        visible={showPermSheet}
        onClose={() => router.back()}
        onGranted={() => router.back()}
      />
    </Screen>
  );
}
