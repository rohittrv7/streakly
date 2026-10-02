export type FocusMode = "focus" | "short_break" | "long_break";
export * from "./duration";

export interface FocusSettings {
  version?: number;
  focusSec?: number;
  shortBreakSec?: number;
  longBreakSec?: number;
  sessionsBeforeLongBreak: number; // 2-8, default 4
  keepScreenOn?: boolean; // default true
  focusMinutes?: number;
  shortBreakMinutes?: number;
  longBreakMinutes?: number;
}

export const DEFAULT_FOCUS_SETTINGS: FocusSettings = {
  version: 2,
  focusSec: 25 * 60,
  shortBreakSec: 5 * 60,
  longBreakSec: 15 * 60,
  sessionsBeforeLongBreak: 4,
  keepScreenOn: true,
  get focusMinutes() {
    return Math.round((this.focusSec ?? 1500) / 60);
  },
  get shortBreakMinutes() {
    return Math.round((this.shortBreakSec ?? 300) / 60);
  },
  get longBreakMinutes() {
    return Math.round((this.longBreakSec ?? 900) / 60);
  },
};

export interface TimerState {
  mode: FocusMode;
  status: "idle" | "running" | "paused";
  endAt: number | null; // ms timestamp when running
  remainingMs: number; // when paused/idle
  completedFocusCount: number;
  startedAt: number | null; // ms timestamp when session started
}

export function getDurationMs(mode: FocusMode, settings: FocusSettings): number {
  switch (mode) {
    case "focus":
      return (settings.focusSec ?? (settings.focusMinutes ? settings.focusMinutes * 60 : 1500)) * 1000;
    case "short_break":
      return (settings.shortBreakSec ?? (settings.shortBreakMinutes ? settings.shortBreakMinutes * 60 : 300)) * 1000;
    case "long_break":
      return (settings.longBreakSec ?? (settings.longBreakMinutes ? settings.longBreakMinutes * 60 : 900)) * 1000;
  }
}


export function createInitialTimerState(settings: FocusSettings = DEFAULT_FOCUS_SETTINGS): TimerState {
  return {
    mode: "focus",
    status: "idle",
    endAt: null,
    remainingMs: getDurationMs("focus", settings),
    completedFocusCount: 0,
    startedAt: null,
  };
}

export function getRemainingMs(state: TimerState, now: number = Date.now()): number {
  if (state.status === "running") {
    if (state.endAt === null) return 0;
    return Math.max(0, state.endAt - now);
  }
  return Math.max(0, state.remainingMs);
}

export function isFinished(state: TimerState, now: number = Date.now()): boolean {
  if (state.status !== "running" || state.endAt === null) return false;
  return now >= state.endAt;
}

export function start(
  state: TimerState,
  settings: FocusSettings = DEFAULT_FOCUS_SETTINGS,
  now: number = Date.now()
): TimerState {
  const remaining = state.status === "idle" ? getDurationMs(state.mode, settings) : state.remainingMs;
  const endAt = now + remaining;
  return {
    ...state,
    status: "running",
    endAt,
    remainingMs: remaining,
    startedAt: state.startedAt ?? now,
  };
}

export function pause(state: TimerState, now: number = Date.now()): TimerState {
  if (state.status !== "running") return state;
  const remaining = getRemainingMs(state, now);
  return {
    ...state,
    status: "paused",
    endAt: null,
    remainingMs: remaining,
  };
}

export function resume(state: TimerState, now: number = Date.now()): TimerState {
  if (state.status !== "paused") return state;
  const endAt = now + state.remainingMs;
  return {
    ...state,
    status: "running",
    endAt,
  };
}

export function reset(state: TimerState, settings: FocusSettings = DEFAULT_FOCUS_SETTINGS): TimerState {
  const duration = getDurationMs(state.mode, settings);
  return {
    ...state,
    status: "idle",
    endAt: null,
    remainingMs: duration,
    startedAt: null,
  };
}

export function nextMode(
  state: TimerState,
  settings: FocusSettings = DEFAULT_FOCUS_SETTINGS
): { mode: FocusMode; completedFocusCount: number } {
  if (state.mode === "focus") {
    const nextCount = state.completedFocusCount + 1;
    if (nextCount >= settings.sessionsBeforeLongBreak) {
      return { mode: "long_break", completedFocusCount: 0 };
    }
    return { mode: "short_break", completedFocusCount: nextCount };
  }
  return { mode: "focus", completedFocusCount: state.completedFocusCount };
}

export function skip(state: TimerState, settings: FocusSettings = DEFAULT_FOCUS_SETTINGS): TimerState {
  const nextM: FocusMode = state.mode === "focus" ? "short_break" : "focus";
  const duration = getDurationMs(nextM, settings);
  return {
    ...state,
    mode: nextM,
    status: "idle",
    endAt: null,
    remainingMs: duration,
    startedAt: null,
  };
}

export function setMode(
  state: TimerState,
  newMode: FocusMode,
  settings: FocusSettings = DEFAULT_FOCUS_SETTINGS
): TimerState {
  const duration = getDurationMs(newMode, settings);
  return {
    ...state,
    mode: newMode,
    status: "idle",
    endAt: null,
    remainingMs: duration,
    startedAt: null,
  };
}

export function updateSettings(
  state: TimerState,
  newSettings: FocusSettings
): TimerState {
  if (state.status === "idle") {
    const duration = getDurationMs(state.mode, newSettings);
    return { ...state, remainingMs: duration };
  }
  return state;
}

