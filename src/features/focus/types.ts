import type { FocusMode, FocusSettings, TimerState } from "./timer";

export interface FocusSession {
  id: string;
  taskId?: string | null;
  category: string;
  startedAt: string; // ISO string
  durationSeconds: number;
  completed: boolean;
}

export interface FocusSessionRow {
  id: string;
  task_id: string | null;
  category: string;
  started_at: string;
  duration_seconds: number;
  completed: number;
}

export function mapFocusSessionRow(row: FocusSessionRow): FocusSession {
  return {
    id: row.id,
    taskId: row.task_id,
    category: row.category,
    startedAt: row.started_at,
    durationSeconds: row.duration_seconds,
    completed: row.completed === 1,
  };
}

export interface FocusStoreState {
  timer: TimerState;
  settings: FocusSettings;
  selectedTaskId: string | null;
  selectedCategory: string;
  todaySessions: FocusSession[];
  loading: boolean;
  finishedWhileAway: boolean;
  showPrePermissionSheet: boolean;

  init: () => Promise<void>;
  loadToday: () => Promise<void>;
  checkBackgroundCompletion: (now?: number) => Promise<boolean>;
  start: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  reset: () => Promise<void>;
  skip: () => Promise<void>;
  setMode: (mode: FocusMode) => Promise<void>;
  finishSession: () => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  selectTask: (taskId: string | null, category?: string) => Promise<void>;
  selectCategory: (category: string) => Promise<void>;
  updateSettings: (newSettings: Partial<FocusSettings>) => Promise<void>;
  dismissFinishedWhileAway: () => void;
  setShowPrePermissionSheet: (show: boolean) => void;
}
