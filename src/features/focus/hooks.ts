import { useEffect, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useFocusStore } from "./store";
import {
  getRemainingMs,
  getDurationMs,
  isFinished,
  formatClock,
} from "./timer";
import {
  selectTodayFocusMinutes,
  selectTodayCompletedSessions,
  selectSessionsByCategory,
} from "./selectors";

export function useFocusTimer() {
  const timer = useFocusStore((s) => s.timer);
  const settings = useFocusStore((s) => s.settings);
  const checkBackgroundCompletion = useFocusStore((s) => s.checkBackgroundCompletion);
  const finishSession = useFocusStore((s) => s.finishSession);

  const [remainingMs, setRemainingMs] = useState(() => getRemainingMs(timer));
  const [screenFocused, setScreenFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setScreenFocused(true);
      return () => setScreenFocused(false);
    }, [])
  );

  // AppState listener for background resumption
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        checkBackgroundCompletion();
      }
    };
    const sub = AppState.addEventListener("change", handleAppStateChange);
    return () => sub.remove();
  }, [checkBackgroundCompletion]);

  // Active ticking interval (300ms)
  useEffect(() => {
    setRemainingMs(getRemainingMs(timer));

    if (timer.status !== "running" || !screenFocused) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const rem = getRemainingMs(timer, now);
      setRemainingMs(rem);

      if (isFinished(timer, now)) {
        finishSession();
      }
    }, 300);

    return () => clearInterval(interval);
  }, [timer, screenFocused, finishSession]);

  const durationMs = getDurationMs(timer.mode, settings);
  const progress = durationMs > 0 ? Math.min(1, Math.max(0, 1 - remainingMs / durationMs)) : 0;

  return {
    mode: timer.mode,
    status: timer.status,
    remainingMs,
    durationMs,
    progress,
    completedFocusCount: timer.completedFocusCount,
    clock: formatClock(remainingMs),
  };
}

export function useFocusStats() {
  const sessions = useFocusStore((s) => s.todaySessions);
  const todayMinutes = selectTodayFocusMinutes(sessions);
  const todaySessionCount = selectTodayCompletedSessions(sessions);
  const sessionsByCategory = selectSessionsByCategory(sessions);

  return {
    sessions,
    todayMinutes,
    todaySessionCount,
    sessionsByCategory,
  };
}
