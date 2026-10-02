import { create } from "zustand";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { Haptics } from "@/core/utils/haptics";
import { focusRepo } from "./repo";
import { todayStr } from "@/core/utils/dates";
import {
  type FocusMode, type TimerState, DEFAULT_FOCUS_SETTINGS,
  createInitialTimerState, start as timerStart, pause as timerPause,
  resume as timerResume, reset as timerReset, skip as timerSkip,
  setMode as timerSetMode, nextMode as timerNextMode,
  getDurationMs, getRemainingMs, isFinished, updateSettings as timerUpdateSettings,
} from "./timer";
import {
  loadSavedSettings, saveSettings, loadSavedTimerState,
  saveTimerState, loadSavedSelection, saveSelection,
} from "./persistence";
import { scheduleSessionEnd, cancelSessionEnd } from "@/lib/notifications/focus";
import { hasNotificationPermission } from "@/lib/notifications/permissions";
import { logCompletedFocusSession, logEarlyStoppedFocusSession } from "./session-logger";
import type { FocusStoreState } from "./types";

export const useFocusStore = create<FocusStoreState>((set, get) => ({
  timer: createInitialTimerState(),
  settings: DEFAULT_FOCUS_SETTINGS,
  selectedTaskId: null,
  selectedCategory: "Study",
  todaySessions: [],
  loading: true,
  finishedWhileAway: false,
  showPrePermissionSheet: false,
  completionOverlay: null,

  init: async () => {
    try {
      const settings = await loadSavedSettings();
      const timer = await loadSavedTimerState(settings);
      const selection = await loadSavedSelection();
      set({ settings, timer, selectedTaskId: selection.taskId, selectedCategory: selection.category, loading: false });
      await get().loadToday();
      await get().checkBackgroundCompletion();
    } catch {
      set({ loading: false });
    }
  },

  loadToday: async () => {
    try {
      const sessions = await focusRepo.getSessionsForDate(todayStr());
      set({ todaySessions: sessions });
    } catch (err) {
      console.warn("Failed to load today sessions:", err);
    }
  },

  checkBackgroundCompletion: async (now = Date.now()) => {
    const { timer, settings, selectedTaskId, selectedCategory } = get();
    if (timer.status !== "running" || !isFinished(timer, now)) return false;

    if (timer.mode === "focus") {
      const durationSec = settings.focusSec ?? (settings.focusMinutes ? settings.focusMinutes * 60 : 1500);
      const startedAt = timer.startedAt || (timer.endAt! - durationSec * 1000);
      await logCompletedFocusSession(durationSec, startedAt, selectedTaskId, selectedCategory);
    }

    const next = timerNextMode(timer, settings);
    const nextState: TimerState = {
      mode: next.mode, status: "idle", endAt: null,
      remainingMs: getDurationMs(next.mode, settings),
      completedFocusCount: next.completedFocusCount, startedAt: null,
    };
    set({
      timer: nextState, finishedWhileAway: true,
      completionOverlay: { visible: true, withSound: false, completedMode: timer.mode, linkedTaskId: selectedTaskId },
    });
    await saveTimerState(nextState);
    await cancelSessionEnd();
    await get().loadToday();
    return true;
  },

  start: async () => {
    const { timer, settings } = get();
    if (!(await hasNotificationPermission())) set({ showPrePermissionSheet: true });
    const nextState = timerStart(timer, settings);
    set({ timer: nextState });
    await saveTimerState(nextState);
    if (settings.keepScreenOn) activateKeepAwakeAsync().catch(() => {});
    if (nextState.endAt) scheduleSessionEnd(nextState.endAt, nextState.mode).catch(() => {});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },

  pause: async () => {
    const nextState = timerPause(get().timer);
    set({ timer: nextState });
    await saveTimerState(nextState);
    deactivateKeepAwake().catch(() => {});
    await cancelSessionEnd();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },

  resume: async () => {
    const { timer, settings } = get();
    const nextState = timerResume(timer);
    set({ timer: nextState });
    await saveTimerState(nextState);
    if (settings.keepScreenOn) activateKeepAwakeAsync().catch(() => {});
    if (nextState.endAt) scheduleSessionEnd(nextState.endAt, nextState.mode).catch(() => {});
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },

  reset: async () => {
    const { timer, settings, selectedTaskId, selectedCategory } = get();
    if (timer.mode === "focus" && timer.status !== "idle") {
      const elapsedSeconds = Math.round((getDurationMs("focus", settings) - getRemainingMs(timer)) / 1000);
      if (elapsedSeconds >= 60) {
        await logEarlyStoppedFocusSession(elapsedSeconds, timer.startedAt, selectedTaskId, selectedCategory);
        await get().loadToday();
      }
    }
    const nextState = timerReset(timer, settings);
    set({ timer: nextState });
    await saveTimerState(nextState);
    deactivateKeepAwake().catch(() => {});
    await cancelSessionEnd();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },

  skip: async () => {
    const nextState = timerSkip(get().timer, get().settings);
    set({ timer: nextState });
    await saveTimerState(nextState);
    deactivateKeepAwake().catch(() => {});
    await cancelSessionEnd();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },

  setMode: async (mode: FocusMode) => {
    const nextState = timerSetMode(get().timer, mode, get().settings);
    set({ timer: nextState });
    await saveTimerState(nextState);
    await cancelSessionEnd();
  },

  finishSession: async () => {
    const { timer, settings, selectedTaskId, selectedCategory } = get();
    if (timer.mode === "focus") {
      const durationSec = settings.focusSec ?? (settings.focusMinutes ? settings.focusMinutes * 60 : 1500);
      await logCompletedFocusSession(durationSec, timer.startedAt, selectedTaskId, selectedCategory);
      await get().loadToday();
    }
    const next = timerNextMode(timer, settings);
    const nextState: TimerState = {
      mode: next.mode,
      status: "idle",
      endAt: null,
      remainingMs: getDurationMs(next.mode, settings),
      completedFocusCount: next.completedFocusCount,
      startedAt: null,
    };
    set({
      timer: nextState,
      completionOverlay: { visible: true, withSound: true, completedMode: timer.mode, linkedTaskId: selectedTaskId },
    });
    await saveTimerState(nextState);
    deactivateKeepAwake().catch(() => {});
    await cancelSessionEnd();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },

  deleteSession: async (id: string) => {
    await focusRepo.deleteSession(id);
    set((s) => ({ todaySessions: s.todaySessions.filter((sess) => sess.id !== id) }));
  },

  selectTask: async (taskId, category) => {
    set((s) => ({ selectedTaskId: taskId, selectedCategory: category || s.selectedCategory }));
    await saveSelection(taskId, category || get().selectedCategory);
  },

  selectCategory: async (category) => {
    set({ selectedCategory: category });
    await saveSelection(get().selectedTaskId, category);
  },

  updateSettings: async (newSettings) => {
    const merged = { ...get().settings, ...newSettings };
    const updatedTimer = timerUpdateSettings(get().timer, merged);
    set({ settings: merged, timer: updatedTimer });
    await saveSettings(merged);
    await saveTimerState(updatedTimer);
  },

  dismissFinishedWhileAway: () => set({ finishedWhileAway: false }),
  setShowPrePermissionSheet: (show) => set({ showPrePermissionSheet: show }),
  showCompletionOverlay: (opts) => set({ completionOverlay: { visible: true, ...opts } }),
  hideCompletionOverlay: () => set({ completionOverlay: null }),
}));
