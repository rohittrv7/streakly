import React, { useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Plus, Target } from "@/components/icons";
import { Screen, Text, Button, EmptyState, Stagger, Skeleton } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { useHabits } from "@/features/habits";
import { HabitCard } from "@/features/habits/components/HabitCard";
import { useT } from "@/core/i18n";

export default function HabitsScreen() {
  const router = useRouter();
  const { t } = useT();
  const { habits, loading, load } = useHabits();

  useEffect(() => {
    load();
  }, [load]);

  const activeCount = habits.length;

  return (
    <Screen scroll withTabBarInset>
      {/* Header */}
      <View className="flex-row items-center justify-between pt-4 pb-6">
        <View className="flex-1">
          <View className="flex-row items-center gap-1.5 mb-1">
            <Target size={14} color={THEME_COLORS.primary} weight="fill" />
            <Text variant="label">
              {t("habits.activeHabitsHeader", { count: activeCount })}
            </Text>
          </View>
          <Text variant="display">{t("habits.yourRoutines")}</Text>
        </View>
        <Button
          variant="primary"
          size="sm"
          title={t("common.new")}
          icon={<Plus size={16} color={THEME_COLORS.background} weight="bold" />}
          onPress={() => router.push("/habit/new")}
          accessibilityLabel={t("habits.newHabit")}
        />
      </View>

      {/* Loading Skeletons */}
      {loading && habits.length === 0 && (
        <View className="gap-3">
          <Skeleton height={110} borderRadius={24} />
          <Skeleton height={110} borderRadius={24} />
          <Skeleton height={110} borderRadius={24} />
        </View>
      )}

      {/* Empty State */}
      {!loading && habits.length === 0 && (
        <EmptyState
          illustration="empty-habits"
          title={t("habits.noHabitsYet")}
          description={t("habits.noHabitsDesc")}
          actionLabel={t("habits.createFirstHabit")}
          onAction={() => router.push("/habit/new")}
          className="mt-4"
        />
      )}

      {/* Habit Cards List */}
      {habits.length > 0 && (
        <Stagger delay={60}>
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onPress={() => router.push({ pathname: "/habit/[id]", params: { id: habit.id } })}
            />
          ))}
        </Stagger>
      )}
    </Screen>
  );
}
