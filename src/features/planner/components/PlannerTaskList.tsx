import React, { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import type { Task } from "../types";
import { PlannerTaskRow } from "./PlannerTaskRow";
import { EmptyState } from "@/components/ui";
import { useYouTubeStore } from "@/features/youtube/store";
import { getNextUnwatchedLink } from "@/features/youtube/utils";
import { VideoOpenSheet } from "@/features/youtube/components/VideoOpenSheet";
import { VideoPlayerSheet } from "@/features/youtube/components/VideoPlayerSheet";
import type { TaskLink } from "@/features/youtube/types";
import { useT } from "@/core/i18n";

export interface PlannerTaskListProps {
  tasks: Task[];
  today: string;
  selectedDate: string;
  onToggleTask: (id: string) => void;
  onReschedule: (task: Task) => void;
}

export function PlannerTaskList({
  tasks,
  today,
  selectedDate,
  onToggleTask,
  onReschedule,
}: PlannerTaskListProps) {
  const router = useRouter();
  const { t } = useT();
  const [activeVideo, setActiveVideo] = useState<TaskLink | null>(null);
  const [playerVideo, setPlayerVideo] = useState<TaskLink | null>(null);

  const handleVideoPress = async (task: Task) => {
    let links = useYouTubeStore.getState().linksByTask[task.id];
    if (!links) {
      links = await useYouTubeStore.getState().loadForTask(task.id);
    }
    const next = getNextUnwatchedLink(links);
    if (next) {
      setActiveVideo(next);
    } else {
      router.push({ pathname: "/task/view/[id]", params: { id: task.id } });
    }
  };

  if (tasks.length === 0) {
    return (
      <EmptyState
        illustration="empty-planner"
        title={t("planner.noTasks")}
        description={t("planner.nothingPlanned")}
        actionLabel={t("planner.newTask")}
        onAction={() => router.push({ pathname: "/task/new", params: { date: selectedDate } })}
        className="mt-1 mb-8"
      />
    );
  }

  return (
    <View className="pb-8">
      {tasks.map((t) => (
        <PlannerTaskRow
          key={t.id}
          task={t}
          today={today}
          onToggle={() => onToggleTask(t.id)}
          onPress={() => router.push({ pathname: "/task/view/[id]", params: { id: t.id } })}
          onPressVideo={() => handleVideoPress(t)}
          onEdit={() => router.push({ pathname: "/task/[id]", params: { id: t.id } })}
          onReschedule={() => onReschedule(t)}
        />
      ))}

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
