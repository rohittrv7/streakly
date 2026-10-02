import type { SQLiteDatabase } from "expo-sqlite";

export interface Migration {
  version: number;
  name: string;
  up: (db: SQLiteDatabase) => Promise<void>;
}

export const MIGRATION_1_SQL = `
  CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    frequency_type TEXT NOT NULL,
    weekdays TEXT,
    times_per_week INTEGER,
    reminder_time TEXT,
    created_at TEXT NOT NULL,
    archived_at TEXT
  );

  CREATE TABLE IF NOT EXISTS habit_completions (
    id TEXT PRIMARY KEY,
    habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(habit_id, date)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    notes TEXT,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    done INTEGER NOT NULL DEFAULT 0,
    completed_at TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS task_checklist_items (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS task_links (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    kind TEXT NOT NULL,
    external_id TEXT,
    title TEXT,
    thumbnail_url TEXT,
    watched INTEGER NOT NULL DEFAULT 0,
    watched_till_seconds INTEGER,
    note TEXT,
    playlist_total INTEGER,
    playlist_done INTEGER,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS focus_sessions (
    id TEXT PRIMARY KEY,
    task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    started_at TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL,
    completed INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  -- Performance and foreign key indexes
  CREATE INDEX IF NOT EXISTS idx_habits_archived ON habits(archived_at);
  CREATE INDEX IF NOT EXISTS idx_completions_habit_date ON habit_completions(habit_id, date);
  CREATE INDEX IF NOT EXISTS idx_completions_date ON habit_completions(date);
  CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
  CREATE INDEX IF NOT EXISTS idx_tasks_done ON tasks(done);
  CREATE INDEX IF NOT EXISTS idx_checklist_task ON task_checklist_items(task_id);
  CREATE INDEX IF NOT EXISTS idx_links_task ON task_links(task_id);
  CREATE INDEX IF NOT EXISTS idx_focus_task ON focus_sessions(task_id);
  CREATE INDEX IF NOT EXISTS idx_focus_started ON focus_sessions(started_at);
`;

export const MIGRATION_2_SQL = `
  CREATE TABLE IF NOT EXISTS habit_freezes (
    habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (habit_id, date)
  );

  CREATE INDEX IF NOT EXISTS idx_freezes_habit_date ON habit_freezes(habit_id, date);
`;

export const MIGRATION_3_SQL = `
  ALTER TABLE task_links ADD COLUMN position INTEGER;
  ALTER TABLE task_links ADD COLUMN duration_seconds INTEGER;
  ALTER TABLE task_links ADD COLUMN parent_link_id TEXT REFERENCES task_links(id) ON DELETE CASCADE;
  CREATE INDEX IF NOT EXISTS idx_links_parent ON task_links(parent_link_id);
`;

export const migrations: Migration[] = [
  {
    version: 1,
    name: "initial_schema",
    up: async (db: SQLiteDatabase) => {
      await db.execAsync(MIGRATION_1_SQL);
    },
  },
  {
    version: 2,
    name: "habit_freezes",
    up: async (db: SQLiteDatabase) => {
      await db.execAsync(MIGRATION_2_SQL);
    },
  },
  {
    version: 3,
    name: "task_links_hierarchy",
    up: async (db: SQLiteDatabase) => {
      await db.execAsync(MIGRATION_3_SQL);
    },
  },
];

export async function getUserVersion(db: SQLiteDatabase): Promise<number> {
  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version;"
  );
  return result?.user_version ?? 0;
}

export async function runMigrations(db: SQLiteDatabase): Promise<{
  fromVersion: number;
  toVersion: number;
  appliedCount: number;
}> {
  const currentVersion = await getUserVersion(db);
  const pending = migrations
    .filter((m) => m.version > currentVersion)
    .sort((a, b) => a.version - b.version);

  if (pending.length === 0) {
    return {
      fromVersion: currentVersion,
      toVersion: currentVersion,
      appliedCount: 0,
    };
  }

  for (const migration of pending) {
    await db.withTransactionAsync(async () => {
      await migration.up(db);
      await db.execAsync(`PRAGMA user_version = ${migration.version};`);
    });
  }

  const finalVersion = await getUserVersion(db);
  return {
    fromVersion: currentVersion,
    toVersion: finalVersion,
    appliedCount: pending.length,
  };
}
