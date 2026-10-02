import { Platform } from "react-native";
import { isRunningInExpoGo } from "expo";
import { THEME_COLORS } from "@/lib/theme";
import { getNotifications } from "./native";
import type { FocusEndSound } from "./types";

export const NOTIFICATION_CHANNELS = {
  habits: "habits-v2",
  tasks: "tasks-v2",
  nudges: "nudges-v2",
  focusAlarm: "focus-alarm-v3",
  focusNotification: "focus-notification-v3",
  focusVibrate: "focus-vibrate-v3",
  // Legacy alias for backwards compatibility
  focus: "focus-alarm-v3",
} as const;

export function getFocusChannelId(sound: FocusEndSound): string {
  switch (sound) {
    case "notification":
      return NOTIFICATION_CHANNELS.focusNotification;
    case "vibrate":
      return NOTIFICATION_CHANNELS.focusVibrate;
    case "alarm":
    default:
      return NOTIFICATION_CHANNELS.focusAlarm;
  }
}

let ensureChannelsPromise: Promise<void> | null = null;
let configuredChannelCount = 0;

export function getConfiguredChannelCount(): number {
  return configuredChannelCount;
}

export async function ensureNotificationChannels(): Promise<void> {
  if (Platform.OS !== "android") return;
  // Expo Go on Android does not register AndroidXNotificationsChannelsProvider natively,
  // causing ExpoNotificationChannelManager.setNotificationChannelAsync to throw a NullPointerException.
  // Channels are configured natively in development builds and production APKs.
  if (isRunningInExpoGo()) {
    return;
  }
  if (ensureChannelsPromise) return ensureChannelsPromise;

  ensureChannelsPromise = (async () => {
    const Notifications = getNotifications();
    if (!Notifications) return;

    try {
      if (__DEV__) {
        console.log("[notifications/channels] Initializing Android channels...");
      }

      // 1. Delete legacy unversioned and v2 channels
      const legacyIds = ["habits", "tasks", "nudges", "focus", "focus-v2"];
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
        Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.focusAlarm, {
          name: "Focus Alarm",
          importance: Notifications.AndroidImportance.MAX,
          sound: "focus_chime.wav",
          audioAttributes: {
            usage: Notifications.AndroidAudioUsage?.ALARM ?? 4,
            contentType: Notifications.AndroidAudioContentType?.SONIFICATION ?? 4,
          },
          enableVibrate: true,
          vibrationPattern: [0, 500, 250, 500, 250, 500],
          lockscreenVisibility: visibility,
          lightColor: THEME_COLORS.lime,
        }),
        Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.focusNotification, {
          name: "Focus Notification",
          importance: Notifications.AndroidImportance.HIGH,
          sound: "default",
          enableVibrate: true,
          vibrationPattern: [0, 250, 250, 250],
          lockscreenVisibility: visibility,
          lightColor: THEME_COLORS.lime,
        }),
        Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.focusVibrate, {
          name: "Focus Vibrate",
          importance: Notifications.AndroidImportance.HIGH,
          sound: null,
          enableVibrate: true,
          vibrationPattern: [0, 500, 250, 500],
          lockscreenVisibility: visibility,
          lightColor: THEME_COLORS.lime,
        }),
      ]);

      configuredChannelCount = 6;
      if (__DEV__) {
        console.log("[notifications/channels] Successfully initialized 6 Android channels");
      }
    } catch (err) {
      if (__DEV__) {
        console.warn("[notifications/channels] Note: Failed to configure Android channels:", err);
      }
      ensureChannelsPromise = null;
    }
  })();

  return ensureChannelsPromise;
}
