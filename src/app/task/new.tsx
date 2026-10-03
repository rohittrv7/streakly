import React from "react";
import { View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { X, CalendarPlus } from "phosphor-react-native";
import { Haptics } from "@/core/utils/haptics";
import { Screen, Text, Button } from "@/components/ui";
import { TaskForm } from "@/features/planner/components/TaskForm";
import { usePlannerStore, createTaskWithLinksTransaction } from "@/features/planner";
import { useYouTubeStore, type TaskLink } from "@/features/youtube";
import { THEME_COLORS } from "@/lib/theme";

export default function NewTaskScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date?: string }>();
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

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
    try {
      setErrorMsg(null);
      const res = await createTaskWithLinksTransaction({
        title: data.title,
        notes: data.notes,
        category: data.category,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        checklist: data.checklist,
        links: data.links,
      });

      // Update in-memory state for immediate responsiveness
      usePlannerStore.setState((s) => ({
        tasks: [...s.tasks, res.task],
        checklists: { ...s.checklists, [res.task.id]: res.checklist },
      }));

      // Refresh youtube store immediately
      await useYouTubeStore.getState().loadForTask(res.task.id);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      router.back();
    } catch (err) {
      console.error("Failed to create task with links:", err);
      const msg = err instanceof Error ? err.message : "Failed to create task";
      setErrorMsg(msg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
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

      {errorMsg && (
        <View className="p-3 mb-4 rounded-xl bg-coral/20 border border-coral/40">
          <Text className="text-coral font-bold text-sm">{errorMsg}</Text>
        </View>
      )}

      <TaskForm
        initialDate={date}
        onSubmit={handleCreate}
        submitLabel="Create Task"
      />
    </Screen>
  );
}
