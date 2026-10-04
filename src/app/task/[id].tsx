import React from "react";
import { View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { X, CheckSquare } from "@/components/icons";
import { Haptics } from "@/core/utils/haptics";
import { Screen, Text, Button, Card } from "@/components/ui";
import { TaskForm } from "@/features/planner/components/TaskForm";
import {
  usePlanner,
  usePlannerTask,
  usePlannerChecklist,
  usePlannerStore,
  createTaskWithLinksTransaction,
  updateTaskWithLinksTransaction,
} from "@/features/planner";
import { useTaskLinks, useYouTubeStore, type TaskLink } from "@/features/youtube";
import { THEME_COLORS } from "@/lib/theme";

export default function TaskDetailsModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const task = usePlannerTask(id);
  const { items: checklistItems } = usePlannerChecklist(id);
  const existingLinks = useTaskLinks(id);
  const { deleteTask } = usePlanner();

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
    checklist?: any[];
    links?: TaskLink[];
  }) => {
    try {
      const updated = await updateTaskWithLinksTransaction({
        taskId: task.id,
        title: data.title,
        notes: data.notes,
        category: data.category,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        checklist: checklistItems,
        links: data.links,
      });
      usePlannerStore.setState((s) => ({
        tasks: s.tasks.map((t) => (t.id === task.id ? updated : t)),
      }));
      await useYouTubeStore.getState().loadForTask(task.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      router.back();
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    useYouTubeStore.setState((s) => {
      const next = { ...s.linksByTask };
      delete next[task.id];
      return { linksByTask: next };
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.back();
  };

  const handleDuplicate = async () => {
    try {
      const dup = await createTaskWithLinksTransaction({
        title: `${task.title} (Copy)`,
        notes: task.notes,
        category: task.category,
        date: task.date,
        startTime: task.startTime,
        endTime: task.endTime,
        checklist: checklistItems.map((c) => ({ text: c.text })),
        links: existingLinks.map((l) => ({
          url: l.url,
          kind: l.kind,
          externalId: l.externalId,
          title: l.title,
          thumbnailUrl: l.thumbnailUrl,
          watched: false,
          watchedTillSeconds: null,
          note: l.note,
          playlistTotal: l.playlistTotal,
          playlistDone: 0,
        })),
      });
      usePlannerStore.setState((s) => ({
        tasks: [...s.tasks, dup.task],
        checklists: { ...s.checklists, [dup.task.id]: dup.checklist },
      }));
      await useYouTubeStore.getState().loadForTask(dup.task.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      router.back();
    } catch (err) {
      console.error("Failed to duplicate task:", err);
    }
  };

  return (
    <Screen scroll keyboard>
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
        initialLinks={existingLinks}
        onSubmit={handleUpdate}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        submitLabel="Save Changes"
      />
    </Screen>
  );
}
