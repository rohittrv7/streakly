import { create } from "zustand";
import { plannerRepo } from "./repo";
import type { Task, TaskCategory, TaskChecklistItem } from "./types";
import { todayStr, addDays, toDateStr } from "@/core/utils/dates";
import { startOfMonth, endOfMonth, parseISO } from "date-fns";
import { useYouTubeStore } from "@/features/youtube/store";

export interface PlannerState {
  tasks: Task[];
  checklists: Record<string, TaskChecklistItem[]>;
  loading: boolean;
  error: Error | null;

  loadRange: (from: string, to: string) => Promise<void>;
  loadMonth: (year: number, month: number) => Promise<void>;
  loadCurrentMonth: () => Promise<void>;
  addTask: (data: {
    title: string;
    notes?: string | null;
    category: TaskCategory;
    date: string;
    startTime?: string | null;
    endTime?: string | null;
  }) => Promise<Task>;
  updateTask: (
    id: string,
    updates: Partial<{
      title: string;
      notes: string | null;
      category: TaskCategory;
      date: string;
      startTime: string | null;
      endTime: string | null;
      done: boolean;
    }>
  ) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<void>;
  rescheduleTask: (id: string, newDate: string) => Promise<Task | null>;
  createMany: (tasks: Array<{
    title: string;
    notes?: string | null;
    category: TaskCategory;
    date: string;
    startTime?: string | null;
    endTime?: string | null;
  }>) => Promise<Task[]>;
  toggleTaskDone: (id: string) => Promise<boolean>;

  // Checklist
  loadChecklist: (taskId: string) => Promise<TaskChecklistItem[]>;
  addChecklistItem: (taskId: string, text: string) => Promise<TaskChecklistItem>;
  toggleChecklistItem: (id: string, taskId: string) => Promise<void>;
  removeChecklistItem: (id: string, taskId: string) => Promise<void>;
  renameChecklistItem: (id: string, taskId: string, text: string) => Promise<void>;
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  tasks: [],
  checklists: {},
  loading: false,
  error: null,

  loadRange: async (from, to) => {
    try {
      set({ loading: true, error: null });
      const tasks = await plannerRepo.getTasksInRange(from, to);
      set({ tasks, loading: false });
      if (tasks.length > 0) {
        useYouTubeStore.getState().loadForTasks(tasks.map((t) => t.id));
      }
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err : new Error(String(err)) });
    }
  },

  loadMonth: async (year, month) => {
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const firstOfMonth = parseISO(`${year}-${monthStr}-01T12:00:00`);
    const from = toDateStr(addDays(toDateStr(firstOfMonth), -7));
    const to = toDateStr(addDays(toDateStr(endOfMonth(firstOfMonth)), 7));
    await get().loadRange(from, to);
  },

  loadCurrentMonth: async () => {
    const now = parseISO(`${todayStr()}T12:00:00`);
    await get().loadMonth(now.getFullYear(), now.getMonth() + 1);
  },

  addTask: async (data) => {
    const task = await plannerRepo.create(data);
    set((s) => ({ tasks: [...s.tasks, task] }));
    return task;
  },

  updateTask: async (id, updates) => {
    const prev = get().tasks.find((t) => t.id === id);
    if (!prev) return null;
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)) }));
    try {
      const updated = await plannerRepo.update(id, updates);
      return updated;
    } catch (err) {
      set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? prev : t)) }));
      throw err;
    }
  },

  deleteTask: async (id) => {
    const prev = get().tasks;
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
    try {
      await plannerRepo.delete(id);
    } catch (err) {
      set({ tasks: prev });
      throw err;
    }
  },

  rescheduleTask: async (id, newDate) => {
    return get().updateTask(id, { date: newDate });
  },

  createMany: async (taskList) => {
    const created = await plannerRepo.createMany(taskList);
    set((s) => ({ tasks: [...s.tasks, ...created] }));
    return created;
  },

  toggleTaskDone: async (id) => {
    const existing = get().tasks.find((t) => t.id === id);
    if (!existing) return false;
    const newDone = !existing.done;
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: newDone } : t)),
    }));
    try {
      const result = await plannerRepo.toggleDone(id);
      return result.done;
    } catch (err) {
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === id ? existing : t)),
      }));
      throw err;
    }
  },

  loadChecklist: async (taskId) => {
    const items = await plannerRepo.getChecklistItems(taskId);
    set((s) => ({ checklists: { ...s.checklists, [taskId]: items } }));
    return items;
  },

  addChecklistItem: async (taskId, text) => {
    const item = await plannerRepo.addChecklistItem(taskId, text);
    set((s) => ({
      checklists: { ...s.checklists, [taskId]: [...(s.checklists[taskId] || []), item] },
    }));
    return item;
  },

  toggleChecklistItem: async (id, taskId) => {
    const current = get().checklists[taskId] || [];
    set((s) => ({
      checklists: {
        ...s.checklists,
        [taskId]: current.map((i) => (i.id === id ? { ...i, done: !i.done } : i)),
      },
    }));
    await plannerRepo.toggleChecklistItem(id);
  },

  removeChecklistItem: async (id, taskId) => {
    set((s) => ({
      checklists: {
        ...s.checklists,
        [taskId]: (s.checklists[taskId] || []).filter((i) => i.id !== id),
      },
    }));
    await plannerRepo.deleteChecklistItem(id);
  },

  renameChecklistItem: async (id, taskId, text) => {
    set((s) => ({
      checklists: {
        ...s.checklists,
        [taskId]: (s.checklists[taskId] || []).map((i) => (i.id === id ? { ...i, text } : i)),
      },
    }));
    await plannerRepo.updateChecklistItem(id, { text });
  },
}));
