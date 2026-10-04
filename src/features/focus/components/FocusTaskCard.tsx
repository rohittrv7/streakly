import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import {
  Play,
  CaretRight,
  Target,
  GraduationCap,
  Barbell,
  Book,
  Briefcase,
  Bookmark,
} from "@/components/icons";
import { Card, Text, CategoryChip } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { getCategoryConfig } from "@/core/theme/categories";
import { usePlannerStore } from "@/features/planner/store";
import { useYouTubeStore } from "@/features/youtube/store";
import { VideoOpenSheet } from "@/features/youtube/components/VideoOpenSheet";
import { FocusTaskPickerSheet } from "./FocusTaskPickerSheet";
import { useT } from "@/core/i18n";
import { Haptics } from "@/core/utils/haptics";
import type { TaskLink } from "@/features/youtube/types";

export interface FocusTaskCardProps {
  selectedTaskId: string | null;
  selectedCategory: string;
  onSelectTask: (taskId: string | null, category?: string) => void;
  onSelectCategory: (category: string) => void;
}

export function FocusTaskCard({
  selectedTaskId,
  selectedCategory,
  onSelectTask,
  onSelectCategory,
}: FocusTaskCardProps) {
  const router = useRouter();
  const { t } = useT();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [videoSheetOpen, setVideoSheetOpen] = useState(false);
  const [activeLink, setActiveLink] = useState<TaskLink | null>(null);

  const tasks = usePlannerStore((s) => s.tasks);
  const task = tasks.find((t) => t.id === selectedTaskId);
  const effectiveCategory = task ? task.category : selectedCategory;
  const config = getCategoryConfig(effectiveCategory);

  const linksByTask = useYouTubeStore((s) => s.linksByTask);
  const links = task ? linksByTask[task.id] || [] : [];
  const watchedCount = links.filter((l) => l.watched).length;
  const totalCount = links.length;

  const handleOpenVideo = () => {
    Haptics.selectionAsync();
    const nextUnwatched = links.find((l) => !l.watched) || links[0] || null;
    if (nextUnwatched) {
      setActiveLink(nextUnwatched);
      setVideoSheetOpen(true);
    }
  };

  const renderIcon = () => {
    const size = 20;
    const color = config.color;
    if (!task) return <Target size={size} color={color} weight="bold" />;
    switch (task.category) {
      case "Study":
        return <GraduationCap size={size} color={color} weight="bold" />;
      case "Fitness":
        return <Barbell size={size} color={color} weight="bold" />;
      case "Reading":
        return <Book size={size} color={color} weight="bold" />;
      case "Work":
        return <Briefcase size={size} color={color} weight="bold" />;
      default:
        return <Bookmark size={size} color={color} weight="bold" />;
    }
  };

  return (
    <>
      <Card
        variant="surface"
        className="p-3.5 mx-1 border border-border"
      >
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            setPickerOpen(true);
          }}
          className="flex-row items-center justify-between min-h-[44px]"
          accessibilityRole="button"
          accessibilityLabel={task ? `Focusing on ${task.title}` : "Focusing on Free focus"}
        >
          {/* Left: 44px Category Bubble */}
          <View
            style={{
              backgroundColor: config.bgTint,
              borderColor: config.borderTint,
              borderWidth: 1,
            }}
            className="w-11 h-11 rounded-full items-center justify-center mr-3"
          >
            {renderIcon()}
          </View>

          {/* Center Details */}
          <View className="flex-1 mr-2">
            <Text variant="caption" className="text-[10px] text-text-muted font-bold tracking-wider uppercase">
              {t("focus.focusingOn")}
            </Text>
            <Text variant="body" className="font-bold text-sm text-text-primary mt-0.5" numberOfLines={1}>
              {task ? task.title : t("focus.freeFocus")}
            </Text>
            <View className="flex-row items-center flex-wrap gap-2 mt-1.5">
              <CategoryChip category={effectiveCategory} />
              {task?.startTime ? (
                <Text variant="caption" className="text-text-secondary text-xs">
                  {task.startTime}
                  {task.endTime ? ` - ${task.endTime}` : ""}
                </Text>
              ) : (
                <Text variant="caption" className="text-text-secondary text-xs">
                  {t("common.today")}
                </Text>
              )}

              {/* Tappable inline Video badge with isolated touch target */}
              {totalCount > 0 && (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    handleOpenVideo();
                  }}
                  hitSlop={8}
                  className="flex-row items-center gap-1 bg-elevated px-2 py-0.5 rounded-full border border-border min-h-[28px] active:opacity-70"
                  accessibilityRole="button"
                  accessibilityLabel={`Play companion video ${watchedCount} of ${totalCount}`}
                >
                  <Play size={10} color={THEME_COLORS.coral} weight="fill" />
                  <Text variant="caption" className="text-[11px] font-bold text-text-primary">
                    {watchedCount}/{totalCount}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* Right Chevron */}
          <CaretRight size={16} color={THEME_COLORS.text.muted} weight="bold" />
        </Pressable>
      </Card>

      <FocusTaskPickerSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedTaskId={selectedTaskId}
        selectedCategory={selectedCategory}
        onSelectTask={(id, cat) => {
          onSelectTask(id, cat);
          setPickerOpen(false);
        }}
        onSelectCategory={onSelectCategory}
      />

      <VideoOpenSheet
        visible={videoSheetOpen}
        onClose={() => {
          setVideoSheetOpen(false);
          setActiveLink(null);
        }}
        link={activeLink}
        onWatchInApp={() => {
          if (task) {
            router.push({
              pathname: "/task/view/[id]",
              params: { id: task.id },
            });
          }
        }}
      />
    </>
  );
}
