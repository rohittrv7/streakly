import React, { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import type { TimelineSection } from "../utils";
import { TodayTimelineItem } from "./TodayTimelineItem";
import { Text } from "@/components/ui";
import { useYouTubeStore } from "@/features/youtube/store";
import { getNextUnwatchedLink } from "@/features/youtube/utils";
import { VideoOpenSheet } from "@/features/youtube/components/VideoOpenSheet";
import { VideoPlayerSheet } from "@/features/youtube/components/VideoPlayerSheet";
import type { TaskLink } from "@/features/youtube/types";
import { useT } from "@/core/i18n";

export interface TodayTimelineProps {
  sections: TimelineSection[];
  canToggle: boolean;
  onToggleHabit: (habitId: string) => void;
  onToggleTask: (taskId: string) => void;
}

export function TodayTimeline({
  sections,
  canToggle,
  onToggleHabit,
  onToggleTask,
}: TodayTimelineProps) {
  const router = useRouter();
  const { t } = useT();
  const [activeVideo, setActiveVideo] = useState<TaskLink | null>(null);
  const [playerVideo, setPlayerVideo] = useState<TaskLink | null>(null);

  const handleVideoPress = async (taskId: string) => {
    let links = useYouTubeStore.getState().linksByTask[taskId];
    if (!links) {
      links = await useYouTubeStore.getState().loadForTask(taskId);
    }
    const next = getNextUnwatchedLink(links);
    if (next) {
      setActiveVideo(next);
    } else {
      router.push({ pathname: "/task/view/[id]", params: { id: taskId } });
    }
  };

  return (
    <View className="gap-5">
      {sections.map((section) => {
        const title =
          section.id === "morning"
            ? t("today.morning")
            : section.id === "afternoon"
            ? t("today.afternoon")
            : section.id === "evening"
            ? t("today.evening")
            : t("today.anytime");

        return (
          <View key={section.id}>
            {/* Section Header */}
            <Text variant="label" className="mb-2 text-text-secondary tracking-wider">
              {title.toUpperCase()}
            </Text>

          {/* Section Items */}
          <View>
            {section.items.map((item) => (
              <TodayTimelineItem
                key={item.id}
                item={item}
                canToggle={canToggle}
                onToggle={() => {
                  if (item.kind === "habit" && item.habitId) {
                    onToggleHabit(item.habitId);
                  } else if (item.kind === "task" && item.taskId) {
                    onToggleTask(item.taskId);
                  }
                }}
                onPress={() => {
                  if (item.kind === "task" && item.taskId) {
                    router.push({ pathname: "/task/view/[id]", params: { id: item.taskId } });
                  }
                }}
                onPressVideo={() => {
                  if (item.kind === "task" && item.taskId) {
                    handleVideoPress(item.taskId);
                  }
                }}
                onEdit={() => {
                  if (item.kind === "habit" && item.habitId) {
                    router.push({
                      pathname: "/habit/[id]",
                      params: { id: item.habitId },
                    });
                  } else if (item.kind === "task" && item.taskId) {
                    router.push({
                      pathname: "/task/[id]",
                      params: { id: item.taskId },
                    });
                  }
                }}
              />
            ))}
          </View>
        </View>
      );
      })}

      {/* Video Sheets */}
      <VideoOpenSheet
        visible={activeVideo !== null}
        onClose={() => setActiveVideo(null)}
        link={activeVideo}
        onWatchInApp={() => {
          setPlayerVideo(activeVideo);
          setActiveVideo(null);
        }}
      />

      <VideoPlayerSheet
        visible={playerVideo !== null}
        onClose={() => setPlayerVideo(null)}
        link={playerVideo}
        onSavePosition={(sec) => {
          if (playerVideo?.taskId) {
            useYouTubeStore.getState().setWatchedTill(playerVideo.id, playerVideo.taskId, sec);
          }
        }}
        onMarkWatched={() => {
          if (playerVideo?.taskId) {
            useYouTubeStore.getState().toggleWatched(playerVideo.id, playerVideo.taskId);
          }
        }}
      />
    </View>
  );
}
