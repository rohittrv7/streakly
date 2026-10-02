import { Platform } from "react-native";
import * as SQLite from "expo-sqlite";

let dbInstance: SQLite.SQLiteDatabase | null = null;
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const DB_NAME = "streakly.db";

/**
 * Returns a singleton instance of the SQLite database.
 * Foreign keys and WAL journal mode are enabled upon initialization.
 */
export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (Platform.OS === "web") {
    throw new Error(
      "SQLite is not supported on web in Streakly. Please run on Android or iOS."
    );
  }

  if (dbInstance) {
    return dbInstance;
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = (async () => {
    try {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync(`
        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;
      `);
      dbInstance = db;
      return db;
    } catch (error) {
      dbPromise = null;
      throw error;
    }
  })();

  return dbPromise;
}

/**
 * Close database connection (useful for testing or full app resets).
 */
export async function closeDb(): Promise<void> {
  if (dbInstance) {
    try {
      await dbInstance.closeAsync();
    } catch {
      // Ignore closing errors
    }
    dbInstance = null;
    dbPromise = null;
  }
}

/**
 * Injects a mock database instance for testing.
 */
export function setDbInstanceForTesting(mockDb: any): void {
  dbInstance = mockDb;
  dbPromise = mockDb ? Promise.resolve(mockDb) : null;
}
