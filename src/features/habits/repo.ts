import { getDb } from "@/lib/db/client";
import { generateId } from "@/core/utils/id";
import {
  type Habit,
  type HabitRow,
  mapHabitRow,
} from "./types";
import {
  toggleHabitCompletion,
  getHabitCompletions,
  getCompletionsForDate,
  addHabitFreeze,
  removeHabitFreeze,
  getHabitFreezes,
  getCompletionsInRange,
  getAllFreezesInRange,
} from "./repo-completions";

export const habitsRepo = {
  async list(includeArchived: boolean = false): Promise<Habit[]> {
    const db = await getDb();
    const query = includeArchived
      ? "SELECT * FROM habits ORDER BY created_at ASC;"
      : "SELECT * FROM habits WHERE archived_at IS NULL ORDER BY created_at ASC;";
    const rows = await db.getAllAsync<HabitRow>(query);
    return rows.map(mapHabitRow);
  },

  async getById(id: string): Promise<Habit | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<HabitRow>(
      "SELECT * FROM habits WHERE id = ?;",
      [id]
    );
    return row ? mapHabitRow(row) : null;
  },

  async create(data: {
    id?: string;
    name: string;
    icon: string;
    color: string;
    frequencyType: "daily" | "specific_days" | "times_per_week";
    weekdays?: number[];
    timesPerWeek?: number | null;
    reminderTime?: string | null;
    createdAt?: string;
  }): Promise<Habit> {
    const db = await getDb();
    const id = data.id || generateId();
    const createdAt = data.createdAt || new Date().toISOString();
    const weekdaysJson = data.weekdays ? JSON.stringify(data.weekdays) : null;

    await db.runAsync(
      `INSERT INTO habits (
        id, name, icon, color, frequency_type, weekdays, times_per_week, reminder_time, created_at, archived_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL);`,
      [
        id,
        data.name,
        data.icon,
        data.color,
        data.frequencyType,
        weekdaysJson,
        data.timesPerWeek ?? null,
        data.reminderTime ?? null,
        createdAt,
      ]
    );

    return {
      id,
      name: data.name,
      icon: data.icon,
      color: data.color,
      frequencyType: data.frequencyType,
      weekdays: data.weekdays || [],
      timesPerWeek: data.timesPerWeek ?? null,
      reminderTime: data.reminderTime ?? null,
      createdAt,
      archivedAt: null,
    };
  },

  async update(
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
  ): Promise<Habit | null> {
    const db = await getDb();
    const existing = await habitsRepo.getById(id);
    if (!existing) return null;

    const name = updates.name ?? existing.name;
    const icon = updates.icon ?? existing.icon;
    const color = updates.color ?? existing.color;
    const frequencyType = updates.frequencyType ?? existing.frequencyType;
    const weekdays = updates.weekdays ?? existing.weekdays;
    const timesPerWeek =
      (updates.timesPerWeek !== undefined
        ? updates.timesPerWeek
        : existing.timesPerWeek) ?? null;
    const reminderTime =
      (updates.reminderTime !== undefined
        ? updates.reminderTime
        : existing.reminderTime) ?? null;

    const weekdaysJson = weekdays ? JSON.stringify(weekdays) : null;

    await db.runAsync(
      `UPDATE habits SET
        name = ?,
        icon = ?,
        color = ?,
        frequency_type = ?,
        weekdays = ?,
        times_per_week = ?,
        reminder_time = ?
      WHERE id = ?;`,
      [
        name,
        icon,
        color,
        frequencyType,
        weekdaysJson,
        timesPerWeek,
        reminderTime,
        id,
      ]
    );

    return habitsRepo.getById(id);
  },

  async archive(id: string, archive: boolean = true): Promise<void> {
    const db = await getDb();
    const archivedAt = archive ? new Date().toISOString() : null;
    await db.runAsync("UPDATE habits SET archived_at = ? WHERE id = ?;", [
      archivedAt,
      id,
    ]);
  },

  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync("DELETE FROM habits WHERE id = ?;", [id]);
  },

  toggleCompletion: toggleHabitCompletion,
  getCompletions: getHabitCompletions,
  getCompletionsInRange: getCompletionsInRange,
  getCompletionsForDate: getCompletionsForDate,
  addFreeze: addHabitFreeze,
  removeFreeze: removeHabitFreeze,
  getFreezes: getHabitFreezes,
  getFreezesInRange: getAllFreezesInRange,
};
