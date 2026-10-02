import { getDb } from "./client";
import { settingsRepo } from "@/features/settings/repo";
import { habitsRepo } from "@/features/habits/repo";
import { isScheduledOn } from "@/features/habits/streak";
import { plannerRepo } from "@/features/planner/repo";
import { focusRepo } from "@/features/focus/repo";
import { todayStr, addDays } from "@/core/utils/dates";
import { THEME_COLORS } from "@/lib/theme";
import {
  generatePastTasks,
  generatePastFocusSessions,
  generateHistoricalCompletions,
} from "./seed-data";

export const SEED_FLAG_KEY = "seed_completed";

export async function resetAndReseedDatabase(): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      DELETE FROM habit_freezes;
      DELETE FROM habit_completions;
      DELETE FROM habits;
      DELETE FROM focus_sessions;
      DELETE FROM task_links;
      DELETE FROM task_checklist_items;
      DELETE FROM tasks;
      DELETE FROM settings;
    `);
  });
  await seedDatabase(true);
}

export async function seedDatabase(force: boolean = false): Promise<boolean> {
  const isSeeded = await settingsRepo.get(SEED_FLAG_KEY);
  if (isSeeded === "true" && !force) return false;

  const today = todayStr();
  const db = await getDb();

  await db.withTransactionAsync(async () => {
    // 1. Seed Habits with canonical icon keys and createdAt 45 days ago
    const habitRun = await habitsRepo.create({
      name: "Morning run",
      icon: "run",
      color: THEME_COLORS.coral,
      frequencyType: "daily",
      reminderTime: "06:30",
      createdAt: addDays(today, -45),
    });

    const habitRead = await habitsRepo.create({
      name: "Read 20 pages",
      icon: "book",
      color: THEME_COLORS.sky,
      frequencyType: "daily",
      reminderTime: "21:00",
      createdAt: addDays(today, -45),
    });

    const habitWater = await habitsRepo.create({
      name: "Drink 3L water",
      icon: "drop",
      color: THEME_COLORS.mint,
      frequencyType: "daily",
      reminderTime: "12:00",
      createdAt: addDays(today, -45),
    });

    const habitDsa = await habitsRepo.create({
      name: "DSA 2 problems",
      icon: "code",
      color: THEME_COLORS.lime,
      frequencyType: "daily",
      reminderTime: "17:00",
      createdAt: addDays(today, -45),
    });

    const habitSleep = await habitsRepo.create({
      name: "Sleep before 11:30",
      icon: "moon",
      color: THEME_COLORS.coral,
      frequencyType: "specific_days",
      weekdays: [1, 2, 3, 4, 5],
      reminderTime: "23:00",
      createdAt: addDays(today, -45),
    });

    // 2. Exact current streaks + historical completions (gap day guarantees streaks match exact requirements)
    // Run: 4-day current (today-3 to today), gap at -4, earlier max consecutive 3
    for (let i = 0; i <= 3; i++) {
      await habitsRepo.toggleCompletion(habitRun.id, addDays(today, -i));
    }
    for (const d of generateHistoricalCompletions(habitRun.id, today, 3, 5, 45)) {
      await habitsRepo.toggleCompletion(habitRun.id, d);
    }

    // Read: 7-day current, gap at -7, earlier max consecutive 5
    for (let i = 0; i <= 6; i++) {
      await habitsRepo.toggleCompletion(habitRead.id, addDays(today, -i));
    }
    for (const d of generateHistoricalCompletions(habitRead.id, today, 5, 8, 45)) {
      await habitsRepo.toggleCompletion(habitRead.id, d);
    }

    // Water: 12-day current, gap at -12, earlier max consecutive 7
    for (let i = 0; i <= 11; i++) {
      await habitsRepo.toggleCompletion(habitWater.id, addDays(today, -i));
    }
    for (const d of generateHistoricalCompletions(habitWater.id, today, 7, 13, 45)) {
      await habitsRepo.toggleCompletion(habitWater.id, d);
    }

    // DSA: 3-day current (yesterday -1 back to -3, today 0 not done), gap at -4, earlier max consecutive 2
    for (let i = 1; i <= 3; i++) {
      await habitsRepo.toggleCompletion(habitDsa.id, addDays(today, -i));
    }
    for (const d of generateHistoricalCompletions(habitDsa.id, today, 2, 5, 45)) {
      await habitsRepo.toggleCompletion(habitDsa.id, d);
    }

    // Sleep: last 2 scheduled weekdays before today completed
    let sleepCount = 0;
    let offset = 1;
    while (sleepCount < 2 && offset < 14) {
      const past = addDays(today, -offset);
      if (isScheduledOn(habitSleep, past)) {
        await habitsRepo.toggleCompletion(habitSleep.id, past);
        sleepCount++;
      }
      offset++;
    }

    // 3. Seed Tasks (today, upcoming, and 35 past tasks with 80% completion)
    const taskPhysics = await plannerRepo.create({
      title: "Physics - Rotational Motion",
      notes: "Moment of inertia and angular momentum conservation.",
      category: "Study",
      date: today,
      startTime: "10:00",
      endTime: "11:30",
      done: false,
    });
    await plannerRepo.addChecklistItem(taskPhysics.id, "Revise parallel axis theorem", 0);
    await plannerRepo.addChecklistItem(taskPhysics.id, "Solve HC Verma Chapter 10 exercises 1-15", 1);

    await plannerRepo.createMany(generatePastTasks(today));

    // 4. Seed ~30 Focus Sessions across the last 30 days
    for (const s of generatePastFocusSessions(today)) {
      await focusRepo.logSession(s);
    }

    // 5. Mark as seeded
    await settingsRepo.set(SEED_FLAG_KEY, "true");
    await settingsRepo.set("app_version", "1.0.0");
    await settingsRepo.set("language", "en");
    await settingsRepo.set("theme_accent", THEME_COLORS.lime);
  });

  return true;
}
