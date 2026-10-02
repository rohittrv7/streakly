import { Platform } from "react-native";
import { router } from "expo-router";
import { plannerRepo } from "@/features/planner/repo";
import { habitsRepo } from "@/features/habits/repo";
import { todayStr } from "@/core/utils/dates";
import type { NotificationTarget } from "./types";
import { getNotifications } from "./native";

let handledResponseId: string | null = null;
let handlerConfigured = false;

export function parseNotificationTarget(data: unknown): NotificationTarget | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const target = d.target;
  if (!target || typeof target !== "object") return null;
  const t = target as Record<string, unknown>;

  if (t.type === "today") {
    return { type: "today" };
  }
  if (t.type === "focus") {
    return { type: "focus" };
  }
  if (t.type === "task" && typeof t.id === "string" && t.id.trim().length > 0) {
    return { type: "task", id: t.id.trim() };
  }
  if (t.type === "habit" && typeof t.id === "string" && t.id.trim().length > 0) {
    return { type: "habit", id: t.id.trim() };
  }
  return null;
}

export function setupNotificationHandler(): void {
  if (Platform.OS === "web" || handlerConfigured) return;

  const Notifications = getNotifications();
  if (!Notifications) return;

  try {
    Notifications.setNotificationHandler({
      handleNotification: async (notification: any) => {
        const data = notification.request?.content?.data;
        const target = parseNotificationTarget(data);

        // Suppress habit/task reminders if already completed
        if (target?.type === "task") {
          const task = await plannerRepo.getById(target.id);
          if (task?.done) {
            return {
              shouldShowAlert: false,
              shouldPlaySound: false,
              shouldSetBadge: false,
              shouldShowBanner: false,
              shouldShowList: false,
            };
          }
        } else if (target?.type === "habit") {
          const completions = await habitsRepo.getCompletionsForDate(todayStr());
          if (completions.some((c) => c.habitId === target.id)) {
            return {
              shouldShowAlert: false,
              shouldPlaySound: false,
              shouldSetBadge: false,
              shouldShowBanner: false,
              shouldShowList: false,
            };
          }
        }

        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        };
      },
    });
    handlerConfigured = true;
    if (__DEV__) {
      console.log("[notifications/handlers] Foreground notification handler successfully configured");
    }
  } catch (err) {
    console.error("[notifications/handlers] Failed to setup notification handler:", err);
  }
}

export async function handleNotificationTarget(target: NotificationTarget): Promise<void> {
  try {
    switch (target.type) {
      case "today":
      case "habit":
        router.push("/(tabs)");
        break;
      case "task": {
        const exists = await plannerRepo.getById(target.id);
        if (exists) {
          router.push({ pathname: "/task/[id]", params: { id: target.id } });
        } else {
          router.push("/(tabs)");
        }
        break;
      }
      case "focus":
        router.push("/(tabs)/focus");
        break;
    }
  } catch (err) {
    console.error("[notifications/handlers] Navigation error:", err);
  }
}

export function setupNotificationResponseListener(): () => void {
  if (Platform.OS === "web") return () => {};

  const Notifications = getNotifications();
  if (!Notifications) return () => {};

  try {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response: any) => {
        const id = response.notification?.request?.identifier;
        if (id && id === handledResponseId) return;
        handledResponseId = id || null;

        const data = response.notification?.request?.content?.data;
        const target = parseNotificationTarget(data);
        if (target) {
          handleNotificationTarget(target);
        }
      }
    );
    return () => sub.remove();
  } catch {
    return () => {};
  }
}

export async function checkLastNotificationResponse(): Promise<void> {
  if (Platform.OS === "web") return;

  const Notifications = getNotifications();
  if (!Notifications) return;

  try {
    const response = await Notifications.getLastNotificationResponseAsync();
    if (!response) return;

    const id = response.notification?.request?.identifier;
    if (id && id === handledResponseId) return;
    handledResponseId = id || null;

    const data = response.notification?.request?.content?.data;
    const target = parseNotificationTarget(data);
    if (target) {
      handleNotificationTarget(target);
    }
  } catch (err) {
    console.error("[notifications/handlers] Cold start check error:", err);
  }
}
