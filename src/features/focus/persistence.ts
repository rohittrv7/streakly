import { settingsRepo } from "@/features/settings/repo";
import {
  type FocusSettings,
  type TimerState,
  DEFAULT_FOCUS_SETTINGS,
  createInitialTimerState,
} from "./timer";

const TIMER_STATE_KEY = "focus_timer_state";
const SETTINGS_KEY = "focus_settings";
const SELECTED_TASK_KEY = "focus_selected_task";
const SELECTED_CATEGORY_KEY = "focus_selected_category";

export const FOCUS_CONFIG_VERSION = 2;

export function migrateFocusSettings(raw: unknown): FocusSettings {
  if (!raw || typeof raw !== "object") return DEFAULT_FOCUS_SETTINGS;
  const p = raw as Record<string, unknown>;

  const MIN_SEC = 10;
  const MAX_SEC = 180 * 60; // 10,800 seconds

  let focusSec = DEFAULT_FOCUS_SETTINGS.focusSec ?? 1500;
  let shortBreakSec = DEFAULT_FOCUS_SETTINGS.shortBreakSec ?? 300;
  let longBreakSec = DEFAULT_FOCUS_SETTINGS.longBreakSec ?? 900;

  if (typeof p.focusSec === "number") {
    focusSec = Math.min(MAX_SEC, Math.max(MIN_SEC, p.focusSec));
  } else if (typeof p.focusMinutes === "number") {
    focusSec = Math.min(MAX_SEC, Math.max(MIN_SEC, Math.round(p.focusMinutes * 60)));
  }

  if (typeof p.shortBreakSec === "number") {
    shortBreakSec = Math.min(MAX_SEC, Math.max(MIN_SEC, p.shortBreakSec));
  } else if (typeof p.shortBreakMinutes === "number") {
    shortBreakSec = Math.min(MAX_SEC, Math.max(MIN_SEC, Math.round(p.shortBreakMinutes * 60)));
  }

  if (typeof p.longBreakSec === "number") {
    longBreakSec = Math.min(MAX_SEC, Math.max(MIN_SEC, p.longBreakSec));
  } else if (typeof p.longBreakMinutes === "number") {
    longBreakSec = Math.min(MAX_SEC, Math.max(MIN_SEC, Math.round(p.longBreakMinutes * 60)));
  }

  const sessionsBeforeLongBreak = Math.min(8, Math.max(2, Number(p.sessionsBeforeLongBreak) || 4));
  const keepScreenOn = p.keepScreenOn !== undefined ? Boolean(p.keepScreenOn) : true;

  return {
    version: FOCUS_CONFIG_VERSION,
    focusSec,
    shortBreakSec,
    longBreakSec,
    sessionsBeforeLongBreak,
    keepScreenOn,
    get focusMinutes() {
      return Math.round(focusSec / 60);
    },
    get shortBreakMinutes() {
      return Math.round(shortBreakSec / 60);
    },
    get longBreakMinutes() {
      return Math.round(longBreakSec / 60);
    },
  };
}

export async function loadSavedSettings(): Promise<FocusSettings> {
  try {
    const raw = await settingsRepo.get(SETTINGS_KEY);
    if (!raw) return DEFAULT_FOCUS_SETTINGS;
    const parsed = JSON.parse(raw);
    const migrated = migrateFocusSettings(parsed);
    if (!parsed.version || parsed.version < FOCUS_CONFIG_VERSION) {
      await saveSettings(migrated);
    }
    return migrated;
  } catch {
    return DEFAULT_FOCUS_SETTINGS;
  }
}

export async function saveSettings(settings: FocusSettings): Promise<void> {
  try {
    await settingsRepo.set(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn("Failed to persist focus settings:", err);
  }
}

export async function loadSavedTimerState(settings: FocusSettings): Promise<TimerState> {
  try {
    const raw = await settingsRepo.get(TIMER_STATE_KEY);
    if (!raw) return createInitialTimerState(settings);
    const parsed = JSON.parse(raw);
    const validModes = ["focus", "short_break", "long_break"];
    const validStatuses = ["idle", "running", "paused"];

    if (!validModes.includes(parsed.mode) || !validStatuses.includes(parsed.status)) {
      return createInitialTimerState(settings);
    }

    return {
      mode: parsed.mode,
      status: parsed.status,
      endAt: typeof parsed.endAt === "number" ? parsed.endAt : null,
      remainingMs: typeof parsed.remainingMs === "number" ? Math.max(0, parsed.remainingMs) : 0,
      completedFocusCount: typeof parsed.completedFocusCount === "number" ? parsed.completedFocusCount : 0,
      startedAt: typeof parsed.startedAt === "number" ? parsed.startedAt : null,
    };
  } catch {
    return createInitialTimerState(settings);
  }
}

export async function saveTimerState(state: TimerState): Promise<void> {
  try {
    await settingsRepo.set(TIMER_STATE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("Failed to persist timer state:", err);
  }
}

export async function loadSavedSelection(): Promise<{ taskId: string | null; category: string }> {
  try {
    const taskId = await settingsRepo.get(SELECTED_TASK_KEY);
    const category = await settingsRepo.get(SELECTED_CATEGORY_KEY);
    return { taskId: taskId || null, category: category || "Study" };
  } catch {
    return { taskId: null, category: "Study" };
  }
}

export async function saveSelection(taskId: string | null, category: string): Promise<void> {
  try {
    if (taskId) await settingsRepo.set(SELECTED_TASK_KEY, taskId);
    else await settingsRepo.remove(SELECTED_TASK_KEY);
    await settingsRepo.set(SELECTED_CATEGORY_KEY, category);
  } catch (err) {
    console.warn("Failed to persist focus selection:", err);
  }
}
