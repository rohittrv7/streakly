import React, { useEffect, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { X, PencilSimple, Clock, Calendar, WarningCircle } from "@/components/icons";
import { Haptics } from "@/core/utils/haptics";
import { Text, StrikeText, Checkbox, Button, Skeleton, CategoryChip } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { usePlannerStore } from "../store";
import { formatDayLabel } from "../utils";
import { todayStr } from "@/core/utils/dates";
import { YouTubeSection } from "@/features/youtube/components/YouTubeSection";
import type { TaskCategory } from "../types";
import { useT } from "@/core/i18n";
import { formatTimeRange } from "@/core/utils/time";

export interface TaskDetailViewProps {
  taskId: string;
  onClose: () => void;
  onEdit: () => void;
}

export function TaskDetailView({ taskId, onClose, onEdit }: TaskDetailViewProps) {
  const { t } = useT();
  const tasks = usePlannerStore((s) => s.tasks);
  const checklists = usePlannerStore((s) => s.checklists);
  const toggleTaskDone = usePlannerStore((s) => s.toggleTaskDone);
  const toggleChecklistItem = usePlannerStore((s) => s.toggleChecklistItem);
  const loadChecklist = usePlannerStore((s) => s.loadChecklist);

  const [loading, setLoading] = useState(true);
  const task = tasks.find((t) => t.id === taskId);
  const checklist = checklists[taskId] || [];

  useEffect(() => {
    let mounted = true;
    loadChecklist(taskId).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [taskId, loadChecklist]);

  if (!task && !loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center p-6">
        <Text variant="title" className="text-center mb-2">Task Not Found</Text>
        <Text variant="body" className="text-text-secondary text-center mb-6">
          This task may have been deleted or moved.
        </Text>
        <Button variant="primary" title="Close" onPress={onClose} />
      </View>
    );
  }

  if (loading && !task) {
    return (
      <View className="flex-1 bg-background p-6 gap-4">
        <Skeleton width="60%" height={28} />
        <Skeleton width="40%" height={20} />
        <Skeleton width="100%" height={120} />
      </View>
    );
  }

  const isMissed = !task!.done && task!.date < todayStr();
  const checkedCount = checklist.filter((c) => c.done).length;

  const handleToggleTask = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await toggleTaskDone(taskId);
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-2 border-b border-border">
        <Pressable onPress={onClose} hitSlop={10} className="w-10 h-10 rounded-full bg-elevated border border-border items-center justify-center active:opacity-70" accessibilityLabel={t("common.close")}>
          <X size={18} color={THEME_COLORS.text.primary} weight="bold" />
        </Pressable>
        <Text variant="label" className="tracking-widest">{t("planner.taskDetails").toUpperCase()}</Text>
        <Pressable onPress={onEdit} hitSlop={10} className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-elevated border border-border active:opacity-70" accessibilityLabel={t("common.edit")}>
          <PencilSimple size={14} color={THEME_COLORS.text.primary} weight="bold" />
          <Text variant="caption" className="font-bold text-text-primary">{t("common.edit")}</Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-5 py-4" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Title and Status */}
        <View className="gap-2.5 mb-4">
          <StrikeText struck={task!.done} variant="title" className="text-xl leading-tight">
            {task!.title}
          </StrikeText>

          <View className="flex-row flex-wrap items-center gap-2">
            <CategoryChip category={task!.category} />
            <View className="flex-row items-center gap-1 bg-surface px-2.5 py-1 rounded-pill border border-border">
              <Calendar size={12} color={THEME_COLORS.text.muted} />
              <Text variant="caption" className="text-[11px] font-bold text-text-secondary">
                {formatDayLabel(task!.date, t)}
              </Text>
            </View>
            {(task!.startTime || task!.endTime) && (
              <View className="flex-row items-center gap-1 bg-surface px-2.5 py-1 rounded-pill border border-border">
                <Clock size={12} color={THEME_COLORS.text.muted} />
                <Text variant="caption" className="text-[11px] font-bold text-text-secondary">
                  {formatTimeRange(task!.startTime, task!.endTime)}
                </Text>
              </View>
            )}
            {isMissed && (
              <View className="flex-row items-center gap-1 bg-coral/20 px-2 py-0.5 rounded-pill border border-coral/40">
                <WarningCircle size={11} color={THEME_COLORS.coral} weight="bold" />
                <Text className="text-[10px] font-extrabold text-coral uppercase tracking-wider">
                  {t("planner.missed")}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Notes */}
        {task!.notes ? (
          <View className="bg-surface rounded-[16px] p-3.5 border border-border mb-4">
            <Text variant="label" className="text-[10px] text-text-muted mb-1.5">NOTES</Text>
            <Text variant="body" selectable className="text-text-secondary text-sm leading-relaxed">
              {task!.notes}
            </Text>
          </View>
        ) : null}

        {/* Checklist */}
        {checklist.length > 0 && (
          <View className="mb-5 bg-surface rounded-[16px] p-3.5 border border-border gap-2.5">
            <View className="flex-row items-center justify-between">
              <Text variant="label" className="text-[10px]">CHECKLIST ({checkedCount}/{checklist.length})</Text>
            </View>
            <View className="gap-2">
              {checklist.map((item) => (
                <View key={item.id} className="flex-row items-center gap-3 py-1">
                  <Checkbox
                    checked={item.done}
                    onCheckedChange={() => toggleChecklistItem(item.id, taskId)}
                    color="lime"
                  />
                  <StrikeText struck={item.done} variant="body" className="flex-1 text-sm">
                    {item.text}
                  </StrikeText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Companion Videos */}
        <View className="mb-6">
          <YouTubeSection taskId={taskId} mode="view" onMarkTaskDone={() => toggleTaskDone(taskId)} />
        </View>

        {/* Primary Action Button */}
        <Button
          variant={task!.done ? "secondary" : "primary"}
          title={task!.done ? t("planner.markAsPending") : t("planner.markAsDone")}
          onPress={handleToggleTask}
          className="mt-2"
        />

        {__DEV__ && (
          <Button
            variant="ghost"
            size="sm"
            title={t("youtube.devPrintRows")}
            onPress={async () => {
              const { plannerRepo } = await import("../repo");
              const { youTubeRepo } = await import("@/features/youtube/repo");
              const dbTask = await plannerRepo.getById(taskId);
              const dbLinks = await youTubeRepo.getLinksForTask(taskId);
              console.log("[DEV DEBUG] Task row:", dbTask);
              console.log("[DEV DEBUG] Link rows:", dbLinks);
              alert(`Task: ${dbTask?.title}\nLinks (${dbLinks.length}):\n` + dbLinks.map((l) => `${l.kind}: ${l.externalId || l.url}`).join("\n"));
            }}
            className="mt-2"
          />
        )}
      </ScrollView>
    </View>
  );
}
