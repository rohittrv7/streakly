import React from "react";
import { View, Pressable } from "react-native";
import { Clock, DotsThreeVertical, CheckSquareOffset, CalendarPlus, Play } from "phosphor-react-native";
import { Haptics } from "@/core/utils/haptics";
import type { Task } from "../types";
import { CATEGORY_COLORS } from "../calendar";
import { isMissed } from "../utils";
import { Card, Text, StrikeText, Checkbox, Pill, Button, CategoryChip } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { todayStr } from "@/core/utils/dates";
import { useLinksProgress } from "@/features/youtube";

export interface PlannerTaskRowProps {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onPress?: () => void;
  onPressVideo?: () => void;
  onReschedule?: () => void;
  checklistProgress?: { done: number; total: number };
  today?: string;
}

export function PlannerTaskRow({
  task,
  onToggle,
  onEdit,
  onPress,
  onPressVideo,
  onReschedule,
  checklistProgress,
  today = todayStr(),
}: PlannerTaskRowProps) {
  const ytProgress = useLinksProgress(task.id);
  const isYtAllWatched = ytProgress.total > 0 && ytProgress.watched === ytProgress.total;
  const missed = isMissed(task, today);
  const categoryColor = CATEGORY_COLORS[task.category] || THEME_COLORS.sky;

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onEdit();
  };

  return (
    <Card
      variant="surface"
      className="p-3 mb-2.5 border border-border"
      style={{ opacity: task.done ? 0.7 : 1 }}
    >
      <View className="flex-row items-center justify-between">
        {/* Left: Category color bar + Title/details area (tap opens view, long press edits) */}
        <Pressable
          onPress={onPress}
          onLongPress={handleLongPress}
          delayLongPress={350}
          accessibilityRole="button"
          accessibilityLabel={`${task.title}, tap for details, long press to edit`}
          className="flex-row items-center gap-3 flex-1 mr-2"
        >
          {/* Category vertical indicator pill */}
          <View
            style={{ backgroundColor: categoryColor }}
            className="w-1.5 h-10 rounded-pill"
          />

          <View className="flex-1">
            <StrikeText
              struck={task.done}
              lineColor={categoryColor}
              variant="body"
              className="font-bold text-sm"
            >
              {task.title}
            </StrikeText>

            {/* Metadata row */}
            <View className="flex-row items-center gap-2 mt-1">
              {task.startTime && (
                <View className="flex-row items-center gap-1 bg-elevated px-1.5 py-0.5 rounded-pill border border-border">
                  <Clock size={10} color={THEME_COLORS.text.muted} />
                  <Text variant="caption" className="text-[10px] text-text-secondary">
                    {task.startTime}
                    {task.endTime ? ` - ${task.endTime}` : ""}
                  </Text>
                </View>
              )}

              <CategoryChip category={task.category} />

              {checklistProgress && checklistProgress.total > 0 && (
                <View className="flex-row items-center gap-1 bg-elevated px-1.5 py-0.5 rounded-pill border border-border">
                  <CheckSquareOffset size={10} color={THEME_COLORS.text.muted} />
                  <Text variant="caption" className="text-[10px] text-text-secondary">
                    {checklistProgress.done}/{checklistProgress.total}
                  </Text>
                </View>
              )}

              {ytProgress.total > 0 && (
                <Pressable
                  onPress={onPressVideo}
                  hitSlop={10}
                  className={`flex-row items-center gap-1 px-2 py-1 rounded-pill border min-h-[28px] ${
                    isYtAllWatched
                      ? "bg-primary/20 border-primary/40"
                      : "bg-elevated border-border"
                  }`}
                  accessibilityRole="button"
                  accessibilityLabel={`Companion videos: ${ytProgress.watched} of ${ytProgress.total} watched`}
                >
                  <Play
                    size={10}
                    color={isYtAllWatched ? THEME_COLORS.primary : THEME_COLORS.text.muted}
                    weight="fill"
                  />
                  <Text
                    variant="caption"
                    className={`text-[10px] ${
                      isYtAllWatched ? "text-primary font-bold" : "text-text-secondary"
                    }`}
                  >
                    {ytProgress.watched}/{ytProgress.total}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </Pressable>

        {/* Right: Actions (44px dots button & isolated checkbox) */}
        <View className="flex-row items-center gap-1">
          <Pressable
            onPress={onEdit}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${task.title}`}
            className="w-11 h-11 items-center justify-center rounded-full active:opacity-60"
          >
            <DotsThreeVertical size={18} color={THEME_COLORS.text.muted} weight="bold" />
          </Pressable>

          <Checkbox
            checked={task.done}
            onCheckedChange={onToggle}
            color="lime"
            accessibilityLabel={`Toggle ${task.title}`}
          />
        </View>
      </View>

      {/* Missed Task Banner & Reschedule Button */}
      {missed && onReschedule && (
        <View className="flex-row items-center justify-between mt-2.5 pt-2 border-t border-border">
          <View className="flex-row items-center gap-1.5">
            <View className="w-2 h-2 rounded-full bg-coral" />
            <Text className="text-[11px] font-bold text-coral">Missed task</Text>
          </View>

          <Button
            variant="secondary"
            size="sm"
            title="Reschedule"
            icon={<CalendarPlus size={14} color={THEME_COLORS.text.primary} />}
            onPress={onReschedule}
            className="py-1 px-2.5"
          />
        </View>
      )}
    </Card>
  );
}
