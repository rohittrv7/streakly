import { getDb } from "@/lib/db/client";
import { generateId } from "@/core/utils/id";
import {
  type Task,
  type TaskCategory,
  type TaskChecklistItem,
  type TaskRow,
  type TaskChecklistItemRow,
  mapTaskRow,
  mapChecklistItemRow,
} from "./types";

export const plannerRepo = {
  async getTasksByDate(date: string): Promise<Task[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<TaskRow>(
      "SELECT * FROM tasks WHERE date = ? ORDER BY done ASC, start_time ASC, created_at ASC;",
      [date]
    );
    return rows.map(mapTaskRow);
  },

  async getTasksInRange(from: string, to: string): Promise<Task[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<TaskRow>(
      "SELECT * FROM tasks WHERE date >= ? AND date <= ? ORDER BY date ASC, start_time ASC;",
      [from, to]
    );
    return rows.map(mapTaskRow);
  },

  async getById(id: string): Promise<Task | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<TaskRow>(
      "SELECT * FROM tasks WHERE id = ?;",
      [id]
    );
    return row ? mapTaskRow(row) : null;
  },

  async create(data: {
    id?: string;
    title: string;
    notes?: string | null;
    category: TaskCategory;
    date: string;
    startTime?: string | null;
    endTime?: string | null;
    done?: boolean;
    createdAt?: string;
  }): Promise<Task> {
    const db = await getDb();
    const id = data.id || generateId();
    const createdAt = data.createdAt || new Date().toISOString();
    const done = data.done ? 1 : 0;
    const completedAt = data.done ? new Date().toISOString() : null;

    await db.runAsync(
      `INSERT INTO tasks (
        id, title, notes, category, date, start_time, end_time, done, completed_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        id,
        data.title,
        data.notes ?? null,
        data.category,
        data.date,
        data.startTime ?? null,
        data.endTime ?? null,
        done,
        completedAt,
        createdAt,
      ]
    );

    return {
      id,
      title: data.title,
      notes: data.notes ?? null,
      category: data.category,
      date: data.date,
      startTime: data.startTime ?? null,
      endTime: data.endTime ?? null,
      done: Boolean(data.done),
      completedAt,
      createdAt,
    };
  },

  async createMany(
    tasks: Array<{
      id?: string;
      title: string;
      notes?: string | null;
      category: TaskCategory;
      date: string;
      startTime?: string | null;
      endTime?: string | null;
      done?: boolean;
      createdAt?: string;
    }>
  ): Promise<Task[]> {
    const db = await getDb();
    const results: Task[] = [];

    await db.withTransactionAsync(async () => {
      for (const t of tasks) {
        const id = t.id || generateId();
        const createdAt = t.createdAt || new Date().toISOString();
        const done = t.done ? 1 : 0;
        const completedAt = t.done ? new Date().toISOString() : null;

        await db.runAsync(
          `INSERT INTO tasks (
            id, title, notes, category, date, start_time, end_time, done, completed_at, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            id,
            t.title,
            t.notes ?? null,
            t.category,
            t.date,
            t.startTime ?? null,
            t.endTime ?? null,
            done,
            completedAt,
            createdAt,
          ]
        );

        results.push({
          id,
          title: t.title,
          notes: t.notes ?? null,
          category: t.category,
          date: t.date,
          startTime: t.startTime ?? null,
          endTime: t.endTime ?? null,
          done: Boolean(t.done),
          completedAt,
          createdAt,
        });
      }
    });

    return results;
  },

  async update(
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
  ): Promise<Task | null> {
    const db = await getDb();
    const existing = await plannerRepo.getById(id);
    if (!existing) return null;

    const title = updates.title ?? existing.title;
    const notes =
      (updates.notes !== undefined ? updates.notes : existing.notes) ?? null;
    const category = updates.category ?? existing.category;
    const date = updates.date ?? existing.date;
    const startTime =
      (updates.startTime !== undefined
        ? updates.startTime
        : existing.startTime) ?? null;
    const endTime =
      (updates.endTime !== undefined ? updates.endTime : existing.endTime) ?? null;

    let done = existing.done ? 1 : 0;
    let completedAt = existing.completedAt ?? null;
    if (updates.done !== undefined) {
      done = updates.done ? 1 : 0;
      completedAt = updates.done ? new Date().toISOString() : null;
    }

    await db.runAsync(
      `UPDATE tasks SET
        title = ?,
        notes = ?,
        category = ?,
        date = ?,
        start_time = ?,
        end_time = ?,
        done = ?,
        completed_at = ?
      WHERE id = ?;`,
      [
        title,
        notes,
        category,
        date,
        startTime,
        endTime,
        done,
        completedAt,
        id,
      ]
    );

    return plannerRepo.getById(id);
  },

  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync("DELETE FROM tasks WHERE id = ?;", [id]);
  },

  async toggleDone(taskId: string): Promise<{ done: boolean; task: Task | null }> {
    const db = await getDb();
    const task = await plannerRepo.getById(taskId);
    if (!task) return { done: false, task: null };

    const newDone = !task.done;
    const completedAt = newDone ? new Date().toISOString() : null;

    await db.runAsync(
      "UPDATE tasks SET done = ?, completed_at = ? WHERE id = ?;",
      [newDone ? 1 : 0, completedAt, taskId]
    );

    const updated = await plannerRepo.getById(taskId);
    return { done: newDone, task: updated };
  },

  async reschedule(taskId: string, newDate: string): Promise<Task | null> {
    const db = await getDb();
    await db.runAsync("UPDATE tasks SET date = ? WHERE id = ?;", [
      newDate,
      taskId,
    ]);
    return plannerRepo.getById(taskId);
  },

  // Checklist Items CRUD
  async getChecklistItems(taskId: string): Promise<TaskChecklistItem[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<TaskChecklistItemRow>(
      "SELECT * FROM task_checklist_items WHERE task_id = ? ORDER BY position ASC;",
      [taskId]
    );
    return rows.map(mapChecklistItemRow);
  },

  async addChecklistItem(
    taskId: string,
    text: string,
    position?: number
  ): Promise<TaskChecklistItem> {
    const db = await getDb();
    const id = generateId();

    let finalPos = position;
    if (finalPos === undefined) {
      const last = await db.getFirstAsync<{ max_pos: number | null }>(
        "SELECT MAX(position) as max_pos FROM task_checklist_items WHERE task_id = ?;",
        [taskId]
      );
      finalPos = (last?.max_pos ?? -1) + 1;
    }

    await db.runAsync(
      "INSERT INTO task_checklist_items (id, task_id, text, done, position) VALUES (?, ?, ?, 0, ?);",
      [id, taskId, text, finalPos]
    );

    return {
      id,
      taskId,
      text,
      done: false,
      position: finalPos,
    };
  },

  async updateChecklistItem(
    id: string,
    updates: Partial<{ text: string; done: boolean; position: number }>
  ): Promise<TaskChecklistItem | null> {
    const db = await getDb();
    const existingRow = await db.getFirstAsync<TaskChecklistItemRow>(
      "SELECT * FROM task_checklist_items WHERE id = ?;",
      [id]
    );
    if (!existingRow) return null;

    const existing = mapChecklistItemRow(existingRow);
    const text = updates.text ?? existing.text;
    const done =
      updates.done !== undefined ? (updates.done ? 1 : 0) : existing.done ? 1 : 0;
    const position = updates.position ?? existing.position;

    await db.runAsync(
      "UPDATE task_checklist_items SET text = ?, done = ?, position = ? WHERE id = ?;",
      [text, done, position, id]
    );

    return {
      id,
      taskId: existing.taskId,
      text,
      done: Boolean(done),
      position,
    };
  },

  async toggleChecklistItem(id: string): Promise<TaskChecklistItem | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<TaskChecklistItemRow>(
      "SELECT * FROM task_checklist_items WHERE id = ?;",
      [id]
    );
    if (!row) return null;

    const newDone = row.done === 1 ? 0 : 1;
    await db.runAsync(
      "UPDATE task_checklist_items SET done = ? WHERE id = ?;",
      [newDone, id]
    );

    return {
      id: row.id,
      taskId: row.task_id,
      text: row.text,
      done: newDone === 1,
      position: row.position,
    };
  },

  async deleteChecklistItem(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync("DELETE FROM task_checklist_items WHERE id = ?;", [id]);
  },
};
