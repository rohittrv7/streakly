import { addDays } from "@/core/utils/dates";
import type { TaskCategory } from "@/features/planner/types";

export interface SeedTask {
  title: string;
  category: TaskCategory;
  date: string;
  startTime?: string;
  endTime?: string;
  done: boolean;
}

export interface SeedFocusSession {
  category: string;
  startedAt: string;
  durationSeconds: number;
  completed: boolean;
}

export function generatePastTasks(today: string): SeedTask[] {
  const tasks: SeedTask[] = [];
  const categories: TaskCategory[] = ["Study", "Fitness", "Reading", "Work", "Custom"];

  for (let i = 1; i <= 35; i++) {
    const date = addDays(today, -i);
    const cat = categories[i % categories.length];
    // 80% done, 20% missed
    const isDone = i % 5 !== 0;

    tasks.push({
      title: `${cat} - Session ${i}`,
      category: cat,
      date,
      startTime: "14:00",
      endTime: "15:00",
      done: isDone,
    });
  }

  return tasks;
}

export function generatePastFocusSessions(today: string): SeedFocusSession[] {
  const sessions: SeedFocusSession[] = [];
  const categories = ["Study", "Work", "Fitness", "Reading", "Custom"];
  const durations = [1200, 1500, 1800, 2400, 3000]; // 20m, 25m, 30m, 40m, 50m

  for (let i = 1; i <= 30; i++) {
    const date = addDays(today, -i);
    const cat = categories[i % categories.length];
    const baseDuration = durations[i % durations.length];
    const isEarlyStopped = i % 7 === 0;

    const durationSeconds = isEarlyStopped
      ? 180 // 3 minutes, stopped early (>= 60s)
      : baseDuration;

    sessions.push({
      category: cat,
      startedAt: `${date}T${10 + (i % 8)}:30:00.000Z`,
      durationSeconds,
      completed: !isEarlyStopped,
    });
  }

  return sessions;
}

export function generateHistoricalCompletions(
  habitId: string,
  today: string,
  maxConsecutive: number,
  startOffset: number,
  endOffset: number
): string[] {
  const dates: string[] = [];
  let currentRun = 0;

  for (let i = startOffset; i <= endOffset; i++) {
    // If we've reached maxConsecutive - 1, force a gap day
    if (currentRun >= maxConsecutive - 1) {
      currentRun = 0;
      continue;
    }

    // Realistic pattern: complete 2 out of 3 days
    if (i % 3 !== 0) {
      dates.push(addDays(today, -i));
      currentRun++;
    } else {
      currentRun = 0;
    }
  }

  return dates;
}
