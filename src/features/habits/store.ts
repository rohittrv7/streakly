import { create } from "zustand";
import { habitsRepo } from "./repo";
import type { Habit } from "./types";
import { todayStr, addDays } from "@/core/utils/dates";
import { canUseFreezeForMonth } from "./utils";

export interface HabitsState {
  habits: Habit[];
  completions: Record<string, string[]>; // habitId -> YYYY-MM-DD[]
  freezes: Record<string, string[]>; // habitId -> YYYY-MM-DD[]
  loading: boolean;
  error: Error | null;

  load: () => Promise<void>;
  addHabit: (data: {
    name: string;
    icon: string;
    color: string;
    frequencyType: "daily" | "specific_days" | "times_per_week";
    weekdays?: number[];
    timesPerWeek?: number | null;
    reminderTime?: string | null;
  }) => Promise<Habit>;
  updateHabit: (
    id: string,
    updates: Partial<{
      name: string;
      icon: string;
      color: string;
      frequencyType: "daily" | "specific_days" | "times_per_week";
      weekdays: number[];
      timesPerWeek: number | null;
      reminderTime: string | null;
    }>
  ) => Promise<Habit | null>;
  archiveHabit: (id: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleCompletion: (habitId: string, date?: string) => Promise<boolean>;
  useFreeze: (habitId: string, date: string) => Promise<boolean>;
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  completions: {},
  freezes: {},
  loading: false,
  error: null,

  load: async () => {
    try {
      set({ loading: true, error: null });
      const habitsList = await habitsRepo.list(false);

      const completionsMap: Record<string, string[]> = {};
      const freezesMap: Record<string, string[]> = {};

      for (const h of habitsList) {
        const [comps, frzs] = await Promise.all([
          habitsRepo.getCompletions(h.id),
          habitsRepo.getFreezes(h.id),
        ]);
        completionsMap[h.id] = comps.map((c) => c.date);
        freezesMap[h.id] = frzs.map((f) => f.date);
      }

      set({
        habits: habitsList,
        completions: completionsMap,
        freezes: freezesMap,
        loading: false,
      });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err : new Error(String(err)),
      });
    }
  },

  addHabit: async (data) => {
    const habit = await habitsRepo.create(data);
    set((state) => ({
      habits: [...state.habits, habit],
      completions: { ...state.completions, [habit.id]: [] },
      freezes: { ...state.freezes, [habit.id]: [] },
    }));
    return habit;
  },

  updateHabit: async (id, updates) => {
    const updated = await habitsRepo.update(id, updates);
    if (!updated) return null;
    set((state) => ({
      habits: state.habits.map((h) => (h.id === id ? updated : h)),
    }));
    return updated;
  },

  archiveHabit: async (id) => {
    await habitsRepo.archive(id, true);
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== id),
    }));
  },

  deleteHabit: async (id) => {
    await habitsRepo.delete(id);
    set((state) => {
      const nextComps = { ...state.completions };
      const nextFreezes = { ...state.freezes };
      delete nextComps[id];
      delete nextFreezes[id];
      return {
        habits: state.habits.filter((h) => h.id !== id),
        completions: nextComps,
        freezes: nextFreezes,
      };
    });
  },

  toggleCompletion: async (habitId, date = todayStr()) => {
    const state = get();
    const currentDates = state.completions[habitId] || [];
    const isCompleted = currentDates.includes(date);

    // Optimistic update
    const nextDates = isCompleted
      ? currentDates.filter((d) => d !== date)
      : [...currentDates, date];

    set((s) => ({
      completions: { ...s.completions, [habitId]: nextDates },
    }));

    try {
      const result = await habitsRepo.toggleCompletion(habitId, date);
      return result.completed;
    } catch (err) {
      // Rollback on failure
      set((s) => ({
        completions: { ...s.completions, [habitId]: currentDates },
      }));
      throw err;
    }
  },

  useFreeze: async (habitId, date) => {
    const state = get();
    const currentFreezes = state.freezes[habitId] || [];

    if (!canUseFreezeForMonth(currentFreezes, date)) {
      return false;
    }

    try {
      await habitsRepo.addFreeze(habitId, date);
      set((s) => ({
        freezes: {
          ...s.freezes,
          [habitId]: [...(s.freezes[habitId] || []), date],
        },
      }));
      return true;
    } catch {
      return false;
    }
  },
}));
