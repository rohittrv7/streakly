import React from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Check, Target } from "@/components/icons";
import { Sheet, Text, Pill, Button } from "@/components/ui";
import { THEME_COLORS, useAccent } from "@/lib/theme";
import { CATEGORIES, CATEGORY_CONFIG } from "@/core/theme/categories";
import { usePlannerStore } from "@/features/planner/store";
import { useYouTubeStore } from "@/features/youtube/store";
import { todayStr, addDays } from "@/core/utils/dates";
import { useT } from "@/core/i18n";
import { Haptics } from "@/core/utils/haptics";
import { FocusPickerTaskCard } from "./FocusPickerTaskCard";

export interface FocusTaskPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedTaskId: string | null;
  selectedCategory: string;
  onSelectTask: (taskId: string | null, category?: string) => void;
  onSelectCategory: (category: string) => void;
}

export function FocusTaskPickerSheet({
  visible,
  onClose,
  selectedTaskId,
  selectedCategory,
  onSelectTask,
  onSelectCategory,
}: FocusTaskPickerSheetProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useT();
  const { accent } = useAccent();
  const tasks = usePlannerStore((s) => s.tasks);
  const linksByTask = useYouTubeStore((s) => s.linksByTask);

  const today = todayStr();
  const next7Days = addDays(today, 7);

  const todayTasks = tasks.filter((t) => t.date === today && !t.done);
  const upcomingTasks = tasks.filter((t) => t.date > today && t.date <= next7Days && !t.done);
  const doneTasks = tasks.filter((t) => t.date >= today && t.date <= next7Days && t.done);
  const hasNoTasks = todayTasks.length === 0 && upcomingTasks.length === 0 && doneTasks.length === 0;

  const handlePickTask = (taskId: string | null, category?: string) => {
    Haptics.selectionAsync();
    onSelectTask(taskId, category);
    setTimeout(() => {
      onClose();
    }, 120);
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={t("planner.selectTask") || "Select Task to Focus On"} size="tall">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 24 }}
      >
        {/* Free Focus Option */}
        <View className="mb-4">
          <Pressable
            onPress={() => handlePickTask(null)}
            style={{
              borderColor: selectedTaskId === null ? accent.hex : THEME_COLORS.border,
              backgroundColor: selectedTaskId === null ? accent.softBackground : THEME_COLORS.elevated,
            }}
            className="flex-row items-center justify-between p-3.5 rounded-2xl border"
            accessibilityRole="button"
            accessibilityLabel={t("focus.freeFocus")}
          >
            <View className="flex-row items-center gap-3 flex-1 pr-2">
              <View
                style={{ backgroundColor: selectedTaskId === null ? accent.hex : THEME_COLORS.surface }}
                className="w-9 h-9 rounded-full items-center justify-center"
              >
                <Target size={18} color={selectedTaskId === null ? accent.onAccentHex : THEME_COLORS.text.secondary} weight="bold" />
              </View>
              <View className="flex-1">
                <Text variant="body" className="font-bold text-sm text-text-primary">
                  {t("focus.freeFocus")}
                </Text>
                <Text variant="caption" className="text-text-muted text-xs mt-0.5">
                  {t("focus.freeFocusDesc")}
                </Text>
              </View>
            </View>
            {selectedTaskId === null && <Check size={18} color={accent.hex} weight="bold" />}
          </Pressable>

          {/* Category selection row when Free Focus is selected */}
          {selectedTaskId === null && (
            <View className="flex-row flex-wrap gap-2 mt-3 pl-1">
              {CATEGORIES.map((cat) => (
                <Pill
                  key={cat}
                  label={cat}
                  colorDot={CATEGORY_CONFIG[cat].color}
                  selected={selectedCategory === cat}
                  onPress={() => {
                    Haptics.selectionAsync();
                    onSelectCategory(cat);
                  }}
                />
              ))}
            </View>
          )}
        </View>

        {/* Empty State */}
        {hasNoTasks && (
          <View className="py-8 items-center justify-center">
            <Text variant="body" className="text-text-secondary font-medium mb-3">
              {t("planner.nothingPlanned")}
            </Text>
            <Button
              title={t("planner.goToPlanner")}
              variant="secondary"
              size="sm"
              onPress={() => {
                onClose();
                router.navigate("/(tabs)/planner");
              }}
            />
          </View>
        )}

        {/* Today's Tasks */}
        {todayTasks.length > 0 && (
          <View className="mb-4">
            <Text variant="label" className="text-[11px] text-text-muted mb-2 tracking-wider">
              {t("planner.dueToday").toUpperCase()} ({todayTasks.length})
            </Text>
            <View className="gap-2">
              {todayTasks.map((t) => (
                <FocusPickerTaskCard
                  key={t.id}
                  task={t}
                  selected={selectedTaskId === t.id}
                  videoCount={linksByTask[t.id]?.length || 0}
                  watchedCount={linksByTask[t.id]?.filter((l) => l.watched).length || 0}
                  onSelect={() => handlePickTask(t.id, t.category)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Next 7 Days */}
        {upcomingTasks.length > 0 && (
          <View className="mb-4">
            <Text variant="label" className="text-[11px] text-text-muted mb-2 tracking-wider">
              {t("planner.nextSevenDays").toUpperCase()} ({upcomingTasks.length})
            </Text>
            <View className="gap-2">
              {upcomingTasks.map((t) => (
                <FocusPickerTaskCard
                  key={t.id}
                  task={t}
                  showDate
                  selected={selectedTaskId === t.id}
                  videoCount={linksByTask[t.id]?.length || 0}
                  watchedCount={linksByTask[t.id]?.filter((l) => l.watched).length || 0}
                  onSelect={() => handlePickTask(t.id, t.category)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Done Tasks */}
        {doneTasks.length > 0 && (
          <View className="mb-4 opacity-50">
            <Text variant="label" className="text-[11px] text-text-muted mb-2 tracking-wider">
              {t("common.done").toUpperCase()} ({doneTasks.length})
            </Text>
            <View className="gap-2">
              {doneTasks.map((t) => (
                <FocusPickerTaskCard
                  key={t.id}
                  task={t}
                  showDate
                  selected={selectedTaskId === t.id}
                  videoCount={linksByTask[t.id]?.length || 0}
                  watchedCount={linksByTask[t.id]?.filter((l) => l.watched).length || 0}
                  onSelect={() => handlePickTask(t.id, t.category)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </Sheet>
  );
}
