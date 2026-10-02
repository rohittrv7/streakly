import { useMemo, useEffect, useCallback } from "react";
import { usePlannerStore } from "./store";
import { sortTasks } from "./utils";
import type { Task, TaskChecklistItem } from "./types";

export function usePlanner() {
  const store = usePlannerStore();
  return store;
}

export function useTasksForDate(date: string): Task[] {
  const tasks = usePlannerStore((s) => s.tasks);

  return useMemo(() => {
    const filtered = tasks.filter((t) => t.date === date);
    return sortTasks(filtered);
  }, [tasks, date]);
}

export function usePlannerTask(id: string | undefined): Task | null {
  const tasks = usePlannerStore((s) => s.tasks);
  return useMemo(() => {
    if (!id) return null;
    return tasks.find((t) => t.id === id) || null;
  }, [tasks, id]);
}

export function usePlannerChecklist(taskId: string | undefined) {
  const checklists = usePlannerStore((s) => s.checklists);
  const loadChecklist = usePlannerStore((s) => s.loadChecklist);
  const addChecklistItem = usePlannerStore((s) => s.addChecklistItem);
  const toggleChecklistItem = usePlannerStore((s) => s.toggleChecklistItem);
  const removeChecklistItem = usePlannerStore((s) => s.removeChecklistItem);
  const renameChecklistItem = usePlannerStore((s) => s.renameChecklistItem);

  const items = useMemo<TaskChecklistItem[]>(() => {
    if (!taskId) return [];
    return checklists[taskId] || [];
  }, [checklists, taskId]);

  useEffect(() => {
    if (taskId) {
      loadChecklist(taskId);
    }
  }, [taskId, loadChecklist]);

  return {
    items,
    addItem: (text: string) => (taskId ? addChecklistItem(taskId, text) : Promise.reject()),
    toggleItem: (id: string) => (taskId ? toggleChecklistItem(id, taskId) : Promise.resolve()),
    removeItem: (id: string) => (taskId ? removeChecklistItem(id, taskId) : Promise.resolve()),
    renameItem: (id: string, text: string) =>
      taskId ? renameChecklistItem(id, taskId, text) : Promise.resolve(),
  };
}
