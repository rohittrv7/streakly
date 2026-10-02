export type TaskCategory =
  | "Study"
  | "Fitness"
  | "Reading"
  | "Work"
  | "Custom";

export interface Task {
  id: string;
  title: string;
  notes?: string | null;
  category: TaskCategory;
  date: string; // YYYY-MM-DD
  startTime?: string | null; // e.g. "14:00"
  endTime?: string | null; // e.g. "15:00"
  done: boolean;
  completedAt?: string | null;
  createdAt: string;
}

export interface TaskChecklistItem {
  id: string;
  taskId: string;
  text: string;
  done: boolean;
  position: number;
}

export interface TaskRow {
  id: string;
  title: string;
  notes: string | null;
  category: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  done: number;
  completed_at: string | null;
  created_at: string;
}

export interface TaskChecklistItemRow {
  id: string;
  task_id: string;
  text: string;
  done: number;
  position: number;
}

export function mapTaskRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    category: row.category as TaskCategory,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    done: row.done === 1,
    completedAt: row.completed_at,
    createdAt: row.created_at,
  };
}

export function mapChecklistItemRow(row: TaskChecklistItemRow): TaskChecklistItem {
  return {
    id: row.id,
    taskId: row.task_id,
    text: row.text,
    done: row.done === 1,
    position: row.position,
  };
}
