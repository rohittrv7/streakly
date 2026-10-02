import { getDb } from "@/lib/db/client";
import { type SettingRow } from "./types";

export const settingsRepo = {
  async get(key: string): Promise<string | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<SettingRow>(
      "SELECT value FROM settings WHERE key = ?;",
      [key]
    );
    return row ? row.value : null;
  },

  async set(key: string, value: string): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      `INSERT INTO settings (key, value)
       VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value;`,
      [key, value]
    );
  },

  async getAll(): Promise<Record<string, string>> {
    const db = await getDb();
    const rows = await db.getAllAsync<SettingRow>("SELECT key, value FROM settings;");
    const map: Record<string, string> = {};
    for (const r of rows) {
      map[r.key] = r.value;
    }
    return map;
  },

  async remove(key: string): Promise<void> {
    const db = await getDb();
    await db.runAsync("DELETE FROM settings WHERE key = ?;", [key]);
  },
};
