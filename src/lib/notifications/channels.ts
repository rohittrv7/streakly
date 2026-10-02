import { Platform } from "react-native";
import { THEME_COLORS } from "@/lib/theme";
import { getNotifications } from "./native";

export const NOTIFICATION_CHANNELS = {
  habits: "habits-v2",
  tasks: "tasks-v2",
  nudges: "nudges-v2",
  focus: "focus-v2",
} as const;

let ensureChannelsPromise: Promise<void> | null = null;
let configuredChannelCount = 0;

export function getConfiguredChannelCount(): number {
  return configuredChannelCount;
}

export async function ensureNotificationChannels(): Promise<void> {
  if (Platform.OS !== "android") return;

  if (ensureChannelsPromise) {
    return ensureChannelsPromise;
  }

  ensureChannelsPromise = (async () => {
    const Notifications = getNotifications();
    if (!Notifications) return;

    try {
      if (__DEV__) {
        console.log("[notifications/channels] Initializing Android channels...");
      }

      // 1. Delete legacy unversioned channels if they exist
      const legacyIds = ["habits", "tasks", "nudges", "focus"];
      for (const oldId of legacyIds) {
        await Notifications.deleteNotificationChannelAsync(oldId).catch(() => {});
      }

      const visibility = Notifications.AndroidNotificationVisibility.PUBLIC;

      // 2. Create versioned channels
      await Promise.all([
        Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.habits, {
          name: "Habit Reminders",
          importance: Notifications.AndroidImportance.HIGH,
          sound: "default",
          enableVibrate: true,
          vibrationPattern: [0, 250, 250, 250],
          lockscreenVisibility: visibility,
          lightColor: THEME_COLORS.lime,
        }),
        Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.tasks, {
          name: "Task Reminders",
          importance: Notifications.AndroidImportance.HIGH,
          sound: "default",
          enableVibrate: true,
          vibrationPattern: [0, 250, 250, 250],
          lockscreenVisibility: visibility,
          lightColor: THEME_COLORS.sky,
        }),
        Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.nudges, {
          name: "Daily Nudges & Briefings",
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: "default",
          enableVibrate: true,
          vibrationPattern: [0, 250, 250, 250],
          lockscreenVisibility: visibility,
          lightColor: THEME_COLORS.coral,
        }),
        Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.focus, {
          name: "Focus Timer",
          importance: Notifications.AndroidImportance.MAX,
          sound: "default",
          enableVibrate: true,
          vibrationPattern: [0, 250, 250, 250],
          lockscreenVisibility: visibility,
          lightColor: THEME_COLORS.lime,
        }),
      ]);

      configuredChannelCount = 4;
      if (__DEV__) {
        console.log("[notifications/channels] Successfully initialized 4 Android channels");
      }
    } catch (err) {
      console.error("[notifications/channels] Failed to configure Android channels:", err);
      // Reset promise so subsequent attempts can retry
      ensureChannelsPromise = null;
    }
  })();

  return ensureChannelsPromise;
}
