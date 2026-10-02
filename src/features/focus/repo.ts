import { getDb } from "@/lib/db/client";
import { generateId } from "@/core/utils/id";
import {
  type FocusSession,
  type FocusSessionRow,
  mapFocusSessionRow,
} from "./types";

export const focusRepo = {
  async logSession(data: {
    id?: string;
    taskId?: string | null;
    category: string;
    startedAt?: string;
    durationSeconds: number;
    completed?: boolean;
  }): Promise<FocusSession> {
    const db = await getDb();
    const id = data.id || generateId();
    const startedAt = data.startedAt || new Date().toISOString();
    const completed = data.completed !== undefined ? (data.completed ? 1 : 0) : 1;

    await db.runAsync(
      `INSERT INTO focus_sessions (
        id, task_id, category, started_at, duration_seconds, completed
      ) VALUES (?, ?, ?, ?, ?, ?);`,
      [
        id,
        data.taskId ?? null,
        data.category,
        startedAt,
        data.durationSeconds,
        completed,
      ]
    );

    return {
      id,
      taskId: data.taskId ?? null,
      category: data.category,
      startedAt,
      durationSeconds: data.durationSeconds,
      completed: Boolean(completed),
    };
  },

  async getSessionsInRange(from: string, to: string): Promise<FocusSession[]> {
    const db = await getDb();
    const fromBoundary = from.includes("T") ? from : `${from}T00:00:00.000Z`;
    const toBoundary = to.includes("T") ? to : `${to}T23:59:59.999Z`;
    const rows = await db.getAllAsync<FocusSessionRow>(
      "SELECT * FROM focus_sessions WHERE started_at >= ? AND started_at <= ? ORDER BY started_at ASC;",
      [fromBoundary, toBoundary]
    );
    return rows.map(mapFocusSessionRow);
  },

  async getSessionsForDate(date: string): Promise<FocusSession[]> {
    const db = await getDb();
    const startOfLocalDay = new Date(`${date}T00:00:00`).toISOString();
    const endOfLocalDay = new Date(`${date}T23:59:59.999`).toISOString();
    const rows = await db.getAllAsync<FocusSessionRow>(
      `SELECT * FROM focus_sessions 
       WHERE started_at LIKE ? OR (started_at >= ? AND started_at <= ?)
       ORDER BY started_at DESC;`,
      [`${date}%`, startOfLocalDay, endOfLocalDay]
    );
    const seen = new Set<string>();
    const result: FocusSession[] = [];
    for (const r of rows) {
      if (!seen.has(r.id)) {
        seen.add(r.id);
        result.push(mapFocusSessionRow(r));
      }
    }
    return result;
  },

  async deleteSession(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync("DELETE FROM focus_sessions WHERE id = ?;", [id]);
  },

  async getAll(): Promise<FocusSession[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<FocusSessionRow>(
      "SELECT * FROM focus_sessions ORDER BY started_at DESC;"
    );
    return rows.map(mapFocusSessionRow);
  },
};
