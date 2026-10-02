import { getDb } from "@/lib/db/client";
import { generateId } from "@/core/utils/id";
import { todayStr } from "@/core/utils/dates";
import {
  type HabitCompletion,
  type HabitCompletionRow,
  type HabitFreeze,
  type HabitFreezeRow,
  mapCompletionRow,
  mapFreezeRow,
} from "./types";

export async function toggleHabitCompletion(
  habitId: string,
  date: string = todayStr()
): Promise<{ completed: boolean; completion?: HabitCompletion }> {
  const db = await getDb();
  const existing = await db.getFirstAsync<HabitCompletionRow>(
    "SELECT * FROM habit_completions WHERE habit_id = ? AND date = ?;",
    [habitId, date]
  );

  if (existing) {
    await db.runAsync(
      "DELETE FROM habit_completions WHERE habit_id = ? AND date = ?;",
      [habitId, date]
    );
    return { completed: false };
  } else {
    const id = generateId();
    const createdAt = new Date().toISOString();
    await db.runAsync(
      "INSERT INTO habit_completions (id, habit_id, date, created_at) VALUES (?, ?, ?, ?);",
      [id, habitId, date, createdAt]
    );
    return {
      completed: true,
      completion: { id, habitId, date, createdAt },
    };
  }
}

export async function getHabitCompletions(
  habitId: string,
  from?: string,
  to?: string
): Promise<HabitCompletion[]> {
  const db = await getDb();
  let query = "SELECT * FROM habit_completions WHERE habit_id = ?";
  const params: string[] = [habitId];

  if (from && to) {
    query += " AND date >= ? AND date <= ?";
    params.push(from, to);
  } else if (from) {
    query += " AND date >= ?";
    params.push(from);
  } else if (to) {
    query += " AND date <= ?";
    params.push(to);
  }

  query += " ORDER BY date ASC;";
  const rows = await db.getAllAsync<HabitCompletionRow>(query, params);
  return rows.map(mapCompletionRow);
}

export async function getCompletionsForDate(
  date: string
): Promise<HabitCompletion[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<HabitCompletionRow>(
    "SELECT * FROM habit_completions WHERE date = ?;",
    [date]
  );
  return rows.map(mapCompletionRow);
}

export async function addHabitFreeze(
  habitId: string,
  date: string
): Promise<HabitFreeze> {
  const db = await getDb();
  const createdAt = new Date().toISOString();
  await db.runAsync(
    "INSERT OR REPLACE INTO habit_freezes (habit_id, date, created_at) VALUES (?, ?, ?);",
    [habitId, date, createdAt]
  );
  return { habitId, date, createdAt };
}

export async function removeHabitFreeze(
  habitId: string,
  date: string
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "DELETE FROM habit_freezes WHERE habit_id = ? AND date = ?;",
    [habitId, date]
  );
}

export async function getHabitFreezes(
  habitId: string,
  from?: string,
  to?: string
): Promise<HabitFreeze[]> {
  const db = await getDb();
  let query = "SELECT * FROM habit_freezes WHERE habit_id = ?";
  const params: string[] = [habitId];

  if (from && to) {
    query += " AND date >= ? AND date <= ?";
    params.push(from, to);
  } else if (from) {
    query += " AND date >= ?";
    params.push(from);
  } else if (to) {
    query += " AND date <= ?";
    params.push(to);
  }

  query += " ORDER BY date ASC;";
  const rows = await db.getAllAsync<HabitFreezeRow>(query, params);
  return rows.map(mapFreezeRow);
}

export async function getCompletionsInRange(
  from: string,
  to: string
): Promise<{ habitId: string; date: string }[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ habit_id: string; date: string }>(
    "SELECT habit_id, date FROM habit_completions WHERE date >= ? AND date <= ? ORDER BY date ASC;",
    [from, to]
  );
  return rows.map((r) => ({ habitId: r.habit_id, date: r.date }));
}

export async function getAllFreezesInRange(
  from: string,
  to: string
): Promise<{ habitId: string; date: string }[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ habit_id: string; date: string }>(
    "SELECT habit_id, date FROM habit_freezes WHERE date >= ? AND date <= ? ORDER BY date ASC;",
    [from, to]
  );
  return rows.map((r) => ({ habitId: r.habit_id, date: r.date }));
}
