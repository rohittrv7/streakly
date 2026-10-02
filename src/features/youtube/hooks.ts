import { useEffect, useMemo } from "react";
import { useYouTubeStore } from "./store";
import { getLinksProgress } from "./utils";
import type { TaskLink } from "./types";

export function useYouTube() {
  return useYouTubeStore();
}

export function useTaskLinks(taskId: string | undefined): TaskLink[] {
  const linksByTask = useYouTubeStore((s) => s.linksByTask);
  const loadForTask = useYouTubeStore((s) => s.loadForTask);

  useEffect(() => {
    if (taskId) {
      loadForTask(taskId);
    }
  }, [taskId, loadForTask]);

  return useMemo(() => {
    if (!taskId) return [];
    return linksByTask[taskId] || [];
  }, [linksByTask, taskId]);
}

export function useLinksProgress(taskId: string | undefined): {
  watched: number;
  total: number;
  ratio: number;
} {
  const links = useTaskLinks(taskId);
  return useMemo(() => getLinksProgress(links), [links]);
}
