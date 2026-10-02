import { Platform } from "react-native";
import type { FocusMode } from "@/features/focus/timer";
import { ensureNotificationChannels, getFocusChannelId } from "./channels";
import { getNotifications } from "./native";
import { getPermissionStatus, requestNotificationPermission } from "./permissions";
import { loadNotificationSettings } from "./settings";
import type { FocusEndSound } from "./types";

export interface PlanFocusEndInput {
  endAtMs: number;
  mode: FocusMode;
  focusEndSound?: FocusEndSound;
  focusRepeatReminders?: boolean;
}

export interface PlannedFocusNotification {
  id: string;
  triggerSeconds: number;
  channelId: string;
  sound: string | null;
  title: string;
  body: string;
}

export const FOCUS_NOTIFICATION_IDS = {
  end: "focus:end",
  repeat1: "focus:repeat:1",
  repeat3: "focus:repeat:3",
} as const;

export function planFocusEndNotifications(
  input: PlanFocusEndInput,
  nowMs: number = Date.now()
): PlannedFocusNotification[] {
  const {
    endAtMs,
    mode,
    focusEndSound = "alarm",
    focusRepeatReminders = true,
  } = input;

  const seconds = Math.max(1, Math.round((endAtMs - nowMs) / 1000));
  const channelId = getFocusChannelId(focusEndSound);
  const sound =
    focusEndSound === "alarm"
      ? "focus_chime.wav"
      : focusEndSound === "notification"
      ? "default"
      : null;

  const isFocus = mode === "focus";
  const mainTitle = isFocus ? "Focus session complete" : "Break over. Ready to focus?";
  const mainBody = isFocus ? "Focus done. Take a quick break." : "Break finished. Ready to get back into focus?";

  const list: PlannedFocusNotification[] = [
    {
      id: FOCUS_NOTIFICATION_IDS.end,
      triggerSeconds: seconds,
      channelId,
      sound,
      title: mainTitle,
      body: mainBody,
    },
  ];

  if (focusRepeatReminders) {
    list.push({
      id: FOCUS_NOTIFICATION_IDS.repeat1,
      triggerSeconds: seconds + 60,
      channelId,
      sound,
      title: mainTitle,
      body: isFocus ? "Your session finished 1 minute ago" : "Your break finished 1 minute ago",
    });
    list.push({
      id: FOCUS_NOTIFICATION_IDS.repeat3,
      triggerSeconds: seconds + 180,
      channelId,
      sound,
      title: mainTitle,
      body: isFocus ? "Your session finished 3 minutes ago" : "Your break finished 3 minutes ago",
    });
  }

  return list;
}

export async function scheduleSessionEnd(
  endAtMs: number,
  mode: FocusMode,
  soundOverride?: FocusEndSound,
  repeatOverride?: boolean
): Promise<string[] | null> {
  if (Platform.OS === "web") return null;
  const Notifications = getNotifications();
  if (!Notifications) return null;

  try {
    await cancelSessionEnd();

    const perm = await getPermissionStatus();
    let hasPerm = perm.status === "granted";
    if (perm.status === "undetermined") {
      hasPerm = await requestNotificationPermission();
    }
    if (!hasPerm) return null;

    await ensureNotificationChannels();

    const settings = await loadNotificationSettings();
    const planned = planFocusEndNotifications({
      endAtMs,
      mode,
      focusEndSound: soundOverride ?? settings.focusEndSound,
      focusRepeatReminders: repeatOverride ?? settings.focusRepeatReminders,
    });

    const scheduledIds: string[] = [];
    for (const item of planned) {
      const id = await Notifications.scheduleNotificationAsync({
        identifier: item.id,
        content: {
          title: item.title,
          body: item.body,
          sound: item.sound ?? undefined,
          priority: Notifications.AndroidNotificationPriority?.MAX ?? 5,
          data: { channelId: item.channelId, target: { type: "focus" } },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: item.triggerSeconds,
          channelId: item.channelId,
        },
      });
      scheduledIds.push(id || item.id);
    }

    return scheduledIds;
  } catch (err) {
    console.error("[notifications/focus] Failed to schedule focus notifications:", err);
    return null;
  }
}

export async function cancelSessionEnd(): Promise<void> {
  if (Platform.OS === "web") return;
  const Notifications = getNotifications();
  if (!Notifications) return;

  try {
    const ids = [FOCUS_NOTIFICATION_IDS.end, FOCUS_NOTIFICATION_IDS.repeat1, FOCUS_NOTIFICATION_IDS.repeat3];
    await Promise.all(
      ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {}))
    );
  } catch (err) {
    console.error("[notifications/focus] Failed to cancel focus notifications:", err);
  }
}
