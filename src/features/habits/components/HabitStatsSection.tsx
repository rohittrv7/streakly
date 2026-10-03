import React, { useState } from "react";
import { View } from "react-native";
import { Fire, Trophy, Archive, Trash } from "phosphor-react-native";
import { Haptics } from "@/core/utils/haptics";
import type { Habit } from "../types";
import { useHabitStats } from "../hooks";
import { Text, Card, Button, Sheet, AnimatedNumber } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { getWeekDays } from "@/core/utils/dates";
import { useT } from "@/core/i18n";

interface HabitStatsSectionProps {
  habit: Habit;
  onArchive: () => Promise<void>;
  onDelete: () => Promise<void>;
}

export function HabitStatsSection({
  habit,
  onArchive,
  onDelete,
}: HabitStatsSectionProps) {
  const { t } = useT();
  const { currentStreak, bestStreak, last7Days } = useHabitStats(habit);
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);
  const [archiveSheetOpen, setArchiveSheetOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleArchiveConfirm = async () => {
    setActionLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await onArchive();
    setActionLoading(false);
    setArchiveSheetOpen(false);
  };

  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    await onDelete();
    setActionLoading(false);
    setDeleteSheetOpen(false);
  };

  return (
    <View className="mt-6 gap-4">
      <Text variant="title">{t("stats.title")}</Text>

      {/* Stats Summary Cards */}
      <View className="flex-row gap-3">
        <Card variant="surface" className="flex-1 p-4 border border-border">
          <View className="flex-row items-center gap-1.5 mb-1">
            <Fire size={16} color={THEME_COLORS.coral} weight="fill" />
            <Text variant="caption">{t("habits.currentStreak")}</Text>
          </View>
          <View className="flex-row items-baseline gap-1">
            <AnimatedNumber value={currentStreak} className="text-2xl font-extrabold text-text-primary" />
            <Text variant="caption">{currentStreak === 1 ? t("common.day") : t("common.days")}</Text>
          </View>
        </Card>

        <Card variant="surface" className="flex-1 p-4 border border-border">
          <View className="flex-row items-center gap-1.5 mb-1">
            <Trophy size={16} color={THEME_COLORS.primary} weight="fill" />
            <Text variant="caption">{t("habits.bestStreak")}</Text>
          </View>
          <View className="flex-row items-baseline gap-1">
            <AnimatedNumber value={bestStreak} className="text-2xl font-extrabold text-text-primary" />
            <Text variant="caption">{bestStreak === 1 ? t("common.day") : t("common.days")}</Text>
          </View>
        </Card>
      </View>

      {/* Recent History Overview */}
      <Card variant="surface" className="p-4 border border-border">
        <Text variant="caption" className="font-bold mb-3">{t("planner.nextSevenDays")}</Text>
        <View className="flex-row items-center justify-between">
          {last7Days.map((d) => (
            <View key={d.date} className="items-center gap-1">
              <View
                style={{
                  backgroundColor: d.done
                    ? habit.color
                    : d.frozen
                    ? THEME_COLORS.sky
                    : THEME_COLORS.elevated,
                  borderColor: d.isToday ? habit.color : THEME_COLORS.border,
                }}
                className="w-8 h-8 rounded-full items-center justify-center border"
              >
                <Text
                  className={`text-[10px] font-bold ${
                    d.done ? "text-background" : "text-text-secondary"
                  }`}
                >
                  {d.dayShort}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* Danger & Archive Actions */}
      <View className="gap-2.5 mt-2">
        <Button
          variant="secondary"
          title={t("habits.archiveHabit")}
          icon={<Archive size={18} color={THEME_COLORS.text.secondary} />}
          onPress={() => setArchiveSheetOpen(true)}
        />
        <Button
          variant="ghost"
          title={t("habits.deleteHabit")}
          icon={<Trash size={18} color={THEME_COLORS.secondary.coral} />}
          textClassName="text-coral"
          onPress={() => setDeleteSheetOpen(true)}
        />
      </View>

      {/* Archive Confirmation Sheet */}
      <Sheet
        visible={archiveSheetOpen}
        onClose={() => setArchiveSheetOpen(false)}
        title={t("habits.archiveHabit")}
      >
        <View className="gap-4 pb-2">
          <Text variant="body" className="text-text-secondary">
            {t("habits.archiveConfirm")}
          </Text>
          <Button
            variant="primary"
            title={t("habits.archiveHabit")}
            loading={actionLoading}
            onPress={handleArchiveConfirm}
          />
          <Button
            variant="ghost"
            title={t("common.cancel")}
            onPress={() => setArchiveSheetOpen(false)}
          />
        </View>
      </Sheet>

      {/* Delete Confirmation Sheet */}
      <Sheet
        visible={deleteSheetOpen}
        onClose={() => setDeleteSheetOpen(false)}
        title={t("habits.deleteHabit")}
      >
        <View className="gap-4 pb-2">
          <Text variant="body" className="text-text-secondary">
            {t("habits.deleteConfirm")}
          </Text>
          <Button
            variant="secondary"
            title={t("common.delete")}
            loading={actionLoading}
            className="border-coral"
            textClassName="text-coral"
            onPress={handleDeleteConfirm}
          />
          <Button
            variant="ghost"
            title={t("common.cancel")}
            onPress={() => setDeleteSheetOpen(false)}
          />
        </View>
      </Sheet>
    </View>
  );
}
