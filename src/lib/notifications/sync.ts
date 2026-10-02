import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { todayStr } from "@/core/utils/dates";
import { useHabitsStore } from "@/features/habits/store";
import { usePlannerStore } from "@/features/planner/store";
import { useNotificationSettingsStore, recordAppOpen } from "./settings";
import { requestNotificationReconcile, reconcileNotificationsNow } from "./reconcile";
import {
  setupNotificationHandler,
  setupNotificationResponseListener,
  checkLastNotificationResponse,
} from "./handlers";

export function useNotificationSync(): void {
  const currentDateRef = useRef(todayStr());

  // Setup foreground handler & tap listener
  useEffect(() => {
    setupNotificationHandler();
    const removeListener = setupNotificationResponseListener();
    checkLastNotificationResponse();
    recordAppOpen().then(() => {
      if (__DEV__) {
        console.log("[notifications/sync] App started & DB ready. Triggering initial reconcile...");
      }
      reconcileNotificationsNow();
    });

    return () => {
      removeListener();
    };
  }, []);

  // Listen to AppState (active -> check open, check date change, reconcile)
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "active") {
        const today = todayStr();
        if (today !== currentDateRef.current) {
          currentDateRef.current = today;
        }
        recordAppOpen().then(() => {
          requestNotificationReconcile(200);
        });
        checkLastNotificationResponse();
      }
    };

    const sub = AppState.addEventListener("change", handleAppStateChange);
    return () => sub.remove();
  }, []);

  // Subscribe to habit store mutations
  useEffect(() => {
    const unsub = useHabitsStore.subscribe(() => {
      requestNotificationReconcile(800);
    });
    return unsub;
  }, []);

  // Subscribe to planner store mutations
  useEffect(() => {
    const unsub = usePlannerStore.subscribe(() => {
      requestNotificationReconcile(800);
    });
    return unsub;
  }, []);

  // Subscribe to notification settings mutations
  useEffect(() => {
    const unsub = useNotificationSettingsStore.subscribe(() => {
      requestNotificationReconcile(400);
    });
    return unsub;
  }, []);
}
