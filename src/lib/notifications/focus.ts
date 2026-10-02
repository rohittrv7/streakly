import { Platform } from "react-native";
import type { FocusMode } from "@/features/focus/timer";
import { ensureNotificationChannels, NOTIFICATION_CHANNELS } from "./channels";
import { getNotifications } from "./native";
import { getPermissionStatus, requestNotificationPermission } from "./permissions";

let activeFocusNotificationId: string | null = null;

export async function scheduleSessionEnd(
  endAtMs: number,
  mode: FocusMode
): Promise<string | null> {
  if (Platform.OS === "web") return null;

  const Notifications = getNotifications();
  if (!Notifications) return null;

  try {
    await cancelSessionEnd();

    // Ensure permission - request if undetermined
    const perm = await getPermissionStatus();
    let hasPerm = perm.status === "granted";
    if (perm.status === "undetermined") {
      hasPerm = await requestNotificationPermission();
    }
    if (!hasPerm) {
      if (__DEV__) {
        console.log("[notifications/focus] Permission not granted, skipping focus notification");
      }
      return null;
    }

    // Await channel creation
    await ensureNotificationChannels();

    const seconds = Math.max(1, Math.round((endAtMs - Date.now()) / 1000));
    const isFocus = mode === "focus";
    const title = isFocus ? "Focus session complete" : "Break finished";
    const body = isFocus ? "Focus done. Take 5." : "Break over. Back to it.";
    const notifId = `focus:${Date.now()}`;
    const channelId = NOTIFICATION_CHANNELS.focus;

    if (__DEV__) {
      console.log(`[notifications/focus] Scheduling focus notification in ${seconds}s with channel ${channelId}`);
    }

    const id = await Notifications.scheduleNotificationAsync({
      identifier: notifId,
      content: {
        title,
        body,
        sound: "default",
        priority: Notifications.AndroidNotificationPriority?.MAX ?? 5,
        data: { channelId, target: { type: "focus" } },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        channelId,
      },
    });

    activeFocusNotificationId = id || notifId;
    if (__DEV__) {
      console.log(`[notifications/focus] Successfully scheduled focus notification id: ${activeFocusNotificationId}`);
    }
    return activeFocusNotificationId;
  } catch (err) {
    console.error("[notifications/focus] Failed to schedule focus notification:", err);
    return null;
  }
}

export async function cancelSessionEnd(notificationId?: string | null): Promise<void> {
  if (Platform.OS === "web") return;

  const Notifications = getNotifications();
  if (!Notifications) return;

  try {
    const idToCancel = notificationId || activeFocusNotificationId;
    if (idToCancel) {
      await Notifications.cancelScheduledNotificationAsync(idToCancel).catch(() => {});
      if (idToCancel === activeFocusNotificationId) {
        activeFocusNotificationId = null;
      }
    }
  } catch (err) {
    console.error("[notifications/focus] Failed to cancel focus notification:", err);
  }
}
