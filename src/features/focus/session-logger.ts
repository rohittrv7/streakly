import { focusRepo } from "./repo";
import { shouldLogSession } from "./timer";
import type { FocusSession } from "./types";

export async function logCompletedFocusSession(
  durationSeconds: number,
  startedAtMs?: number | null,
  taskId?: string | null,
  category: string = "Study"
): Promise<FocusSession | null> {
  const roundedSec = Math.round(durationSeconds);
  if (!shouldLogSession(roundedSec)) {
    return null;
  }

  const startMs = startedAtMs || (Date.now() - roundedSec * 1000);
  try {
    return await focusRepo.logSession({
      taskId: taskId ?? null,
      category: category || "Study",
      startedAt: new Date(startMs).toISOString(),
      durationSeconds,
      completed: true,
    });
  } catch (err) {
    console.warn("Failed to log completed focus session:", err);
    return null;
  }
}

export async function logEarlyStoppedFocusSession(
  elapsedSeconds: number,
  startedAtMs?: number | null,
  taskId?: string | null,
  category: string = "Study"
): Promise<FocusSession | null> {
  if (!shouldLogSession(elapsedSeconds)) return null;
  const startMs = startedAtMs || (Date.now() - elapsedSeconds * 1000);
  try {
    return await focusRepo.logSession({
      taskId: taskId ?? null,
      category: category || "Study",
      startedAt: new Date(startMs).toISOString(),
      durationSeconds: elapsedSeconds,
      completed: false,
    });
  } catch (err) {
    console.warn("Failed to log early stopped focus session:", err);
    return null;
  }
}
