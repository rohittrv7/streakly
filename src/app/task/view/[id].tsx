import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Screen } from "@/components/ui";
import { TaskDetailView } from "@/features/planner/components/TaskDetailView";

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  if (!id) return null;

  return (
    <Screen scroll={false} edges={["top", "bottom"]} className="p-0">
      <TaskDetailView
        taskId={id}
        onClose={() => router.back()}
        onEdit={() => router.push({ pathname: "/task/[id]", params: { id } })}
      />
    </Screen>
  );
}
