import { todayStr } from "@/core/utils/dates";
import { format, parseISO } from "date-fns";
import type { Task, TaskCategory } from "./types";

export function formatDayLabel(dateStr: string): string {
  try {
    const today = todayStr();
    if (dateStr === today) return "Today";
    const d = parseISO(dateStr);
    return format(d, "EEE, MMM d");
  } catch {
    return dateStr;
  }
}

export function isMissed(task: Task, today: string = todayStr()): boolean {
  return task.date < today && !task.done;
}

export function getMonthProgress(
  tasks: Task[],
  today: string = todayStr()
): {
  done: number;
  total: number;
  missed: number;
  ratio: number;
} {
  const total = tasks.length;
  if (total === 0) return { done: 0, total: 0, missed: 0, ratio: 0 };

  let done = 0;
  let missed = 0;

  for (const t of tasks) {
    if (t.done) {
      done++;
    } else if (isMissed(t, today)) {
      missed++;
    }
  }

  return {
    done,
    total,
    missed,
    ratio: done / total,
  };
}

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // 1. Items with startTime sort first chronologically
    if (a.startTime && b.startTime) {
      const timeCmp = a.startTime.localeCompare(b.startTime);
      if (timeCmp !== 0) return timeCmp;
    } else if (a.startTime) {
      return -1;
    } else if (b.startTime) {
      return 1;
    }

    // 2. Tie-break by creation date
    return a.createdAt.localeCompare(b.createdAt);
  });
}

export interface TaskValidationErrors {
  title?: string;
  times?: string;
}

export function validateTask(input: {
  title?: string;
  startTime?: string | null;
  endTime?: string | null;
}): { valid: boolean; errors: TaskValidationErrors } {
  const errors: TaskValidationErrors = {};

  const trimmed = (input.title || "").trim();
  if (!trimmed) {
    errors.title = "Task title is required.";
  } else if (trimmed.length > 80) {
    errors.title = "Task title must be 80 characters or fewer.";
  }

  if (input.startTime && input.endTime) {
    if (input.endTime <= input.startTime) {
      errors.times = "End time must be after start time.";
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
