import React from "react";
import { View, Pressable } from "react-native";
import { Clock, Play, DotsThreeVertical } from "phosphor-react-native";
import { Haptics } from "@/core/utils/haptics";
import type { TimelineItem } from "../utils";
import { HabitIcon } from "@/features/habits/components/HabitIcon";
import { StrikeText, Checkbox, Text, Card } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { useLinksProgress } from "@/features/youtube";

export interface TodayTimelineItemProps {
  item: TimelineItem;
  canToggle: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onPress?: () => void;
  onPressVideo?: () => void;
}

export function TodayTimelineItem({
  item,
  canToggle,
  onToggle,
  onEdit,
  onPress,
  onPressVideo,
}: TodayTimelineItemProps) {
  const ytProgress = useLinksProgress(item.taskId);
  const isYtAllWatched = ytProgress.total > 0 && ytProgress.watched === ytProgress.total;

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onEdit();
  };

  return (
    <Card
      variant="surface"
      className="p-3 mb-2.5 border border-border flex-row items-center justify-between"
      style={{ opacity: item.done ? 0.7 : 1 }}
    >
      {/* Left: Pressable Icon + Title area (tap opens details for task, long press edits) */}
      <Pressable
        onPress={item.kind === "task" ? onPress : undefined}
        onLongPress={handleLongPress}
        delayLongPress={350}
        accessibilityRole="button"
        accessibilityLabel={item.kind === "task" ? `${item.title}, tap for details, long press to edit` : `${item.title}, long press to edit`}
        className="flex-row items-center gap-3 flex-1 mr-2"
      >
        {/* Icon or Color Bubble */}
        {item.kind === "habit" ? (
          <View
            style={{ backgroundColor: `${item.color}20` }}
            className="w-9 h-9 rounded-full items-center justify-center border border-border"
          >
            <HabitIcon name={item.icon || "target"} color={item.color} size={18} />
          </View>
        ) : (
          <View className="w-9 h-9 rounded-full bg-elevated items-center justify-center border border-border">
            <View
              style={{ backgroundColor: THEME_COLORS.sky }}
              className="w-3 h-3 rounded-full"
            />
          </View>
        )}

        {/* Title & Metadata chips */}
        <View className="flex-1">
          <StrikeText
            struck={item.done}
            lineColor={item.color}
            variant="body"
            className="font-bold text-sm"
          >
            {item.title}
          </StrikeText>

          <View className="flex-row items-center gap-2 mt-0.5">
            {item.time && (
              <View className="flex-row items-center gap-1 bg-elevated px-1.5 py-0.5 rounded-pill border border-border">
                <Clock size={10} color={THEME_COLORS.text.muted} />
                <Text variant="caption" className="text-[10px] text-text-secondary">
                  {item.time}
                </Text>
              </View>
            )}

            {item.category && (
              <Text variant="caption" className="text-[11px] text-text-muted">
                {item.category}
              </Text>
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

      {/* Right: 44px Dots Edit Button + Isolated Checkbox */}
      <View className="flex-row items-center gap-1">
        <Pressable
          onPress={onEdit}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${item.title}`}
          className="w-11 h-11 items-center justify-center rounded-full active:opacity-60"
        >
          <DotsThreeVertical size={18} color={THEME_COLORS.text.muted} weight="bold" />
        </Pressable>

        <View className="items-center justify-center">
          {canToggle ? (
            <Checkbox
              checked={item.done}
              onCheckedChange={onToggle}
              color="lime"
              accessibilityLabel={`Toggle ${item.title}`}
            />
          ) : (
            <View className="w-[44px] h-[44px] items-center justify-center opacity-30">
              <View className="w-5 h-5 rounded-full border border-border" />
            </View>
          )}
        </View>
      </View>
    </Card>
  );
}
