import { getDb } from "./client";
import { todayStr, addDays } from "@/core/utils/dates";
import { THEME_COLORS } from "@/lib/theme";

const CATEGORIES: string[] = [
  THEME_COLORS.coral,
  THEME_COLORS.sky,
  THEME_COLORS.mint,
  THEME_COLORS.amber,
];

const ICONS = ["book", "run", "water", "gym", "meditate", "write", "code", "sleep"];
const TASK_CATS = ["work", "personal", "study", "health"];

export async function runStressSeed(): Promise<{
  habitsCount: number;
  completionsCount: number;
  tasksCount: number;
  sessionsCount: number;
}> {
  const db = await getDb();
  const today = todayStr();
  const now = new Date().toISOString();

  let completionsCount = 0;
  let tasksCount = 0;
  let sessionsCount = 0;

  await db.withTransactionAsync(async () => {
    // 1. Generate 40 habits
    const habitIds: string[] = [];
    for (let i = 1; i <= 40; i++) {
      const id = `stress_h_${i}`;
      habitIds.push(id);
      const icon = ICONS[i % ICONS.length];
      const color = CATEGORIES[i % CATEGORIES.length];
      await db.runAsync(
        `INSERT OR REPLACE INTO habits (id, name, icon, color, frequency_type, reminder_time, created_at)
         VALUES (?, ?, ?, ?, 'daily', '08:00', ?)`,
        [id, `Habit ${i}`, icon, color, addDays(today, -90)]
      );
    }

    // 2. Generate ~3000 completions spread across the 40 habits over the past 90 days
    // 40 habits * ~75 completions = 3000
    for (let dayOffset = -90; dayOffset <= 0; dayOffset++) {
      const d = addDays(today, dayOffset);
      for (let hIdx = 0; hIdx < habitIds.length; hIdx++) {
        // ~80% completion rate gives ~3000 completions
        if ((dayOffset + hIdx) % 5 !== 0) {
          const compId = `stress_comp_${hIdx}_${d}`;
          await db.runAsync(
            `INSERT OR IGNORE INTO habit_completions (id, habit_id, date, created_at)
             VALUES (?, ?, ?, ?)`,
            [compId, habitIds[hIdx], d, now]
          );
          completionsCount++;
        }
      }
    }

    // 3. Generate 1500 tasks across past 90 days to next 10 days
    const taskIds: string[] = [];
    for (let i = 1; i <= 1500; i++) {
      const id = `stress_t_${i}`;
      taskIds.push(id);
      const dayOffset = -80 + (i % 90);
      const date = addDays(today, dayOffset);
      const isDone = dayOffset < 0 && i % 3 !== 0 ? 1 : 0;
      const cat = TASK_CATS[i % TASK_CATS.length];

      await db.runAsync(
        `INSERT OR REPLACE INTO tasks (id, title, notes, category, date, done, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, `Task item ${i}`, `Notes for task ${i}`, cat, date, isDone, now]
      );
      tasksCount++;
    }

    // 4. Generate 600 focus sessions
    for (let i = 1; i <= 600; i++) {
      const id = `stress_fs_${i}`;
      const dayOffset = -60 + (i % 60);
      const started = `${addDays(today, dayOffset)}T10:00:00.000Z`;
      const taskId = i % 2 === 0 ? taskIds[i % taskIds.length] : null;
      const cat = TASK_CATS[i % TASK_CATS.length];

      await db.runAsync(
        `INSERT OR REPLACE INTO focus_sessions (id, task_id, category, started_at, duration_seconds, completed)
         VALUES (?, ?, ?, ?, 1500, 1)`,
        [id, taskId, cat, started]
      );
      sessionsCount++;
    }
  });

  return {
    habitsCount: 40,
    completionsCount,
    tasksCount,
    sessionsCount,
  };
}
