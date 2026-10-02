import React, { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { X, Sparkle } from "phosphor-react-native";
import { Screen, Text, Button } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { useHabits } from "@/features/habits";
import { HabitForm } from "@/features/habits/components/HabitForm";
import { canShowPrePermissionSheet } from "@/lib/notifications";
import { PrePermissionSheet } from "@/features/settings";

export default function NewHabitModal() {
  const router = useRouter();
  const { addHabit } = useHabits();
  const [showPermSheet, setShowPermSheet] = useState(false);

  const handleCreate = async (data: Parameters<typeof addHabit>[0]) => {
    await addHabit(data);
    if (data.reminderTime) {
      const canAsk = await canShowPrePermissionSheet();
      if (canAsk) {
        setShowPermSheet(true);
        return;
      }
    }
    router.back();
  };

  return (
    <Screen scroll>
      {/* Custom Modal Header */}
      <View className="flex-row items-center justify-between pt-2 pb-6 border-b border-border mb-6">
        <View>
          <View className="flex-row items-center gap-1.5 mb-0.5">
            <Sparkle size={13} color={THEME_COLORS.primary} weight="fill" />
            <Text variant="label">HABITS</Text>
          </View>
          <Text variant="title">New Habit</Text>
        </View>
        <Button
          variant="icon-only"
          size="sm"
          icon={<X size={18} color={THEME_COLORS.text.primary} weight="bold" />}
          onPress={() => router.back()}
          accessibilityLabel="Close"
        />
      </View>

      {/* Habit Creation Form */}
      <HabitForm onSubmit={handleCreate} />

      <PrePermissionSheet
        visible={showPermSheet}
        onClose={() => router.back()}
        onGranted={() => router.back()}
      />
    </Screen>
  );
}
