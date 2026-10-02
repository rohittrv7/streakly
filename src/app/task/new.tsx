import React from "react";
import { View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { X, CalendarPlus } from "phosphor-react-native";
import { Haptics } from "@/core/utils/haptics";
import { Screen, Text, Button } from "@/components/ui";
import { TaskForm } from "@/features/planner/components/TaskForm";
import { usePlanner } from "@/features/planner";
import { youTubeRepo, type TaskLink } from "@/features/youtube";
import { THEME_COLORS } from "@/lib/theme";

export default function NewTaskScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date?: string }>();
  const { addTask, addChecklistItem } = usePlanner();

  const handleCreate = async (data: {
    title: string;
    notes?: string | null;
    category: any;
    date: string;
    startTime?: string | null;
    endTime?: string | null;
    checklist?: any[];
    links?: TaskLink[];
  }) => {
    const created = await addTask({
      title: data.title,
      notes: data.notes,
      category: data.category,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
    });

    if (data.checklist && data.checklist.length > 0) {
      for (const item of data.checklist) {
        if (item.text.trim()) {
          await addChecklistItem(created.id, item.text.trim());
        }
      }
    }

    if (data.links && data.links.length > 0) {
      for (const link of data.links) {
        await youTubeRepo.addLink({
          taskId: created.id,
          url: link.url,
          kind: link.kind,
          externalId: link.externalId,
          title: link.title,
          thumbnailUrl: link.thumbnailUrl,
          watched: link.watched,
          watchedTillSeconds: link.watchedTillSeconds,
          note: link.note,
          playlistTotal: link.playlistTotal,
          playlistDone: link.playlistDone,
        });
      }
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.back();
  };

  return (
    <Screen scroll>
      <View className="flex-row items-center justify-between pt-2 pb-5 mb-5 border-b border-border">
        <View>
          <View className="flex-row items-center gap-1.5 mb-0.5">
            <CalendarPlus size={14} color={THEME_COLORS.primary} weight="fill" />
            <Text variant="label">PLANNER</Text>
          </View>
          <Text variant="title">New Task</Text>
        </View>

        <Button
          variant="icon-only"
          size="sm"
          icon={<X size={18} color={THEME_COLORS.text.primary} weight="bold" />}
          onPress={() => router.back()}
          accessibilityLabel="Close"
        />
      </View>

      <TaskForm
        initialDate={date}
        onSubmit={handleCreate}
        submitLabel="Create Task"
      />
    </Screen>
  );
}
