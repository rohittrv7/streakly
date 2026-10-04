import React from "react";
import { View } from "react-native";
import { Fire, CheckCircle, ListChecks, Timer } from "@/components/icons";
import type { Habit } from "@/features/habits/types";
import { Card, Text, AnimatedNumber, ProgressRing } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { useAccent } from "@/lib/theme/store";
import { useT } from "@/core/i18n";

export interface TodayBentoGridProps {
  topStreakHabit: Habit | null;
  topStreak: number;
  dayDone: number;
  dayTotal: number;
  dayRatio: number;
  habitsDone: number;
  habitsTotal: number;
  tasksDone: number;
  tasksTotal: number;
  focusMinutes: number;
}

export function TodayBentoGrid({
  topStreakHabit,
  topStreak,
  dayDone,
  dayTotal,
  dayRatio,
  habitsDone,
  habitsTotal,
  tasksDone,
  tasksTotal,
  focusMinutes,
}: TodayBentoGridProps) {
  const { accent } = useAccent();
  const { t } = useT();

  return (
    <View className="gap-3 mb-6">
      {/* Top Row: Large Streak Card + Progress Ring Card */}
      <View className="flex-row gap-3">
        {/* a) Large streak card */}
        <Card variant="surface" className="flex-[1.2] p-4 border border-border justify-between min-h-[120px]">
          <View className="flex-row items-center gap-1.5">
            <Fire size={18} color={accent.hex} weight="fill" />
            <Text variant="label" style={{ color: accent.hex }} className="font-bold">
              {t("today.topStreak")}
            </Text>
          </View>

          <View>
            <View className="flex-row items-baseline gap-1.5">
              <AnimatedNumber value={topStreak} className="text-3xl font-extrabold text-text-primary" />
              <Text variant="caption">
                {topStreak === 1 ? t("common.day") : t("common.days")}
              </Text>
            </View>
            <Text variant="caption" className="text-text-secondary mt-0.5" numberOfLines={1}>
              {topStreakHabit?.name || t("today.noHabitsActive")}
            </Text>
          </View>
        </Card>

        {/* b) Progress Ring Card */}
        <Card variant="surface" className="flex-1 p-3 border border-border items-center justify-center min-h-[120px]">
          <ProgressRing
            progress={dayRatio}
            size={72}
            strokeWidth={7}
            color={accent.hex}
          >
            <View className="items-center">
              <Text className="text-base font-extrabold text-text-primary">
                {dayDone}/{dayTotal}
              </Text>
              <Text variant="caption" className="text-[10px] text-text-muted">
                {t("today.dayProgressDone")}
              </Text>
            </View>
          </ProgressRing>
        </Card>
      </View>

      {/* Bottom Row: 3 Small Stat Cards */}
      <View className="flex-row gap-3">
        {/* 1. Habits Today */}
        <Card variant="surface" className="flex-1 p-3.5 border border-border justify-between min-h-[90px]">
          <View className="flex-row items-center justify-between">
            <Text variant="caption" className="text-text-muted">{t("today.habitsCard")}</Text>
            <CheckCircle size={15} color={THEME_COLORS.mint} weight="fill" />
          </View>
          <View className="flex-row items-baseline gap-1 mt-2">
            <AnimatedNumber value={habitsDone} className="text-xl font-bold text-text-primary" />
            <Text variant="caption" className="text-text-secondary">/{habitsTotal}</Text>
          </View>
        </Card>

        {/* 2. Tasks Due Today */}
        <Card variant="surface" className="flex-1 p-3.5 border border-border justify-between min-h-[90px]">
          <View className="flex-row items-center justify-between">
            <Text variant="caption" className="text-text-muted">{t("today.tasksCard")}</Text>
            <ListChecks size={15} color={THEME_COLORS.sky} weight="fill" />
          </View>
          <View className="flex-row items-baseline gap-1 mt-2">
            <AnimatedNumber value={tasksDone} className="text-xl font-bold text-text-primary" />
            <Text variant="caption" className="text-text-secondary">/{tasksTotal}</Text>
          </View>
        </Card>

        {/* 3. Deep Focus Today */}
        <Card variant="surface" className="flex-1 p-3.5 border border-border justify-between min-h-[90px]">
          <View className="flex-row items-center justify-between">
            <Text variant="caption" className="text-text-muted">{t("today.focusCard")}</Text>
            <Timer size={15} color={THEME_COLORS.coral} weight="fill" />
          </View>
          <View className="flex-row items-baseline gap-0.5 mt-2">
            <AnimatedNumber value={focusMinutes} className="text-xl font-bold text-text-primary" />
            <Text variant="caption" className="text-text-secondary">{t("common.min")}</Text>
          </View>
        </Card>
      </View>
    </View>
  );
}
