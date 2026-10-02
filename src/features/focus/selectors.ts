import type { FocusSession } from "./types";

export const selectTodayFocusMinutes = (sessions: FocusSession[]): number =>
  sessions.reduce((acc, s) => acc + Math.round(s.durationSeconds / 60), 0);

export const selectTodayCompletedSessions = (sessions: FocusSession[]): number =>
  sessions.filter((s) => s.completed).length;

export const selectSessionsByCategory = (sessions: FocusSession[]): Record<string, FocusSession[]> => {
  const grouped: Record<string, FocusSession[]> = {};
  for (const s of sessions) {
    if (!grouped[s.category]) grouped[s.category] = [];
    grouped[s.category].push(s);
  }
  return grouped;
};
