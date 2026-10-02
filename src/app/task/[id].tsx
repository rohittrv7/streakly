import React from "react";
import { View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { X, CheckSquare } from "phosphor-react-native";
import { Haptics } from "@/core/utils/haptics";
import { Screen, Text, Button, Card } from "@/components/ui";
import { TaskForm } from "@/features/planner/components/TaskForm";
import { usePlanner, usePlannerTask, usePlannerChecklist } from "@/features/planner";
import { youTubeRepo } from "@/features/youtube";
import { THEME_COLORS } from "@/lib/theme";

export default function TaskDetailsModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const task = usePlannerTask(id);
  const { items: checklistItems } = usePlannerChecklist(id);
  const { updateTask, deleteTask, addTask, addChecklistItem } = usePlanner();

  if (!task) {
    return (
      <Screen scroll>
        <View className="pt-4 pb-6">
          <Button
            variant="ghost"
            title="← Back"
            onPress={() => router.back()}
            className="self-start mb-4"
          />
          <Card variant="surface" className="p-5 items-center">
            <Text variant="title" className="mb-2">Task Not Found</Text>
            <Text variant="caption">This task may have been removed.</Text>
          </Card>
        </View>
      </Screen>
    );
  }

  const handleUpdate = async (data: {
    title: string;
    notes?: string | null;
    category: any;
    date: string;
    startTime?: string | null;
    endTime?: string | null;
  }) => {
    await updateTask(task.id, {
      title: data.title,
      notes: data.notes,
      category: data.category,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.back();
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.back();
  };

  const handleDuplicate = async () => {
    const dup = await addTask({
      title: `${task.title} (Copy)`,
      notes: task.notes,
      category: task.category,
      date: task.date,
      startTime: task.startTime,
      endTime: task.endTime,
    });
    for (const item of checklistItems) {
      await addChecklistItem(dup.id, item.text);
    }
    const existingLinks = await youTubeRepo.getLinksForTask(task.id);
    for (const link of existingLinks) {
      await youTubeRepo.addLink({
        taskId: dup.id,
        url: link.url,
        kind: link.kind,
        externalId: link.externalId,
        title: link.title,
        thumbnailUrl: link.thumbnailUrl,
        watched: false,
        watchedTillSeconds: null,
        note: link.note,
        playlistTotal: link.playlistTotal,
        playlistDone: 0,
      });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.back();
  };

  return (
    <Screen scroll>
      <View className="flex-row items-center justify-between pt-2 pb-5 mb-5 border-b border-border">
        <View>
          <View className="flex-row items-center gap-1.5 mb-0.5">
            <CheckSquare size={14} color={THEME_COLORS.primary} weight="fill" />
            <Text variant="label">TASK</Text>
          </View>
          <Text variant="title">Edit Task</Text>
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
        initialTask={task}
        initialDate={task.date}
        initialChecklist={checklistItems}
        onSubmit={handleUpdate}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        submitLabel="Save Changes"
      />
    </Screen>
  );
}
