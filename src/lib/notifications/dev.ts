import { Platform } from "react-native";
import { isOurNotification } from "./diff";
import { ensureNotificationChannels, NOTIFICATION_CHANNELS } from "./channels";
import { getNotifications } from "./native";
import { getPermissionStatus, requestNotificationPermission } from "./permissions";

export interface ScheduledNotificationItem {
  id: string;
  kind: string;
  title: string | null;
  body: string | null;
  triggerDescription: string;
  channelId?: string;
}

function resolveNotificationKind(id: string): string {
  if (id.endsWith(":pre")) return "pre";
  if (id.endsWith(":at")) return "at";
  if (id.endsWith(":late")) return "late";
  if (id.startsWith("nudge:")) return "nudge";
  if (id.startsWith("brief:")) return "brief";
  if (id.startsWith("streakbroken:")) return "streakbroken";
  if (id.startsWith("comeback:")) return "comeback";
  if (id.startsWith("test:")) return "test";
  return "other";
}

export async function getScheduledNotifications(): Promise<{
  total: number;
  ourCount: number;
  items: ScheduledNotificationItem[];
}> {
  if (Platform.OS === "web") {
    return { total: 0, ourCount: 0, items: [] };
  }

  const Notifications = getNotifications();
  if (!Notifications) {
    return { total: 0, ourCount: 0, items: [] };
  }

  try {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    const ourNotifications = all.filter((n: any) => isOurNotification(n.identifier));

    const items: ScheduledNotificationItem[] = ourNotifications.map((n: any) => {
      const trigger = n.trigger;
      let triggerDescription = "Unknown";
      if (trigger) {
        if (trigger.type === "date" || trigger.date) {
          const dateVal = trigger.date ? new Date(trigger.date) : new Date(trigger.value);
          triggerDescription = isNaN(dateVal.getTime())
            ? String(trigger.date || trigger.value)
            : dateVal.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
              ` (${dateVal.toISOString().split("T")[0]})`;
        } else if (trigger.seconds) {
          triggerDescription = `in ${trigger.seconds}s`;
        }
      }
      return {
        id: n.identifier,
        kind: resolveNotificationKind(n.identifier),
        title: n.content?.title || null,
        body: n.content?.body || null,
        triggerDescription,
        channelId: n.content?.data?.channelId,
      };
    });

    return {
      total: all.length,
      ourCount: ourNotifications.length,
      items,
    };
  } catch (err) {
    console.error("[notifications/dev] Failed to fetch scheduled notifications:", err);
    return { total: 0, ourCount: 0, items: [] };
  }
}

export async function cancelAllOurNotifications(): Promise<void> {
  if (Platform.OS === "web") return;

  const Notifications = getNotifications();
  if (!Notifications) return;

  try {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of all) {
      if (isOurNotification(n.identifier)) {
        await Notifications.cancelScheduledNotificationAsync(n.identifier).catch(() => {});
      }
    }
  } catch (err) {
    console.error("[notifications/dev] Failed to cancel notifications:", err);
  }
}

export async function scheduleTestNotification(seconds: number = 10): Promise<{
  success: boolean;
  id?: string;
  error?: string;
}> {
  if (Platform.OS === "web") {
    return { success: false, error: "Not supported on web" };
  }

  const Notifications = getNotifications();
  if (!Notifications) {
    return { success: false, error: "expo-notifications not available" };
  }

  try {
    // 1. Ensure permission - request if undetermined
    const perm = await getPermissionStatus();
    let hasPerm = perm.status === "granted";
    if (perm.status === "undetermined") {
      hasPerm = await requestNotificationPermission();
    }
    if (!hasPerm) {
      return { success: false, error: "Notification permission not granted" };
    }

    // 2. Ensure versioned channels
    await ensureNotificationChannels();

    const channelId = NOTIFICATION_CHANNELS.habits;
    const testId = `test:${Date.now()}`;

    const id = await Notifications.scheduleNotificationAsync({
      identifier: testId,
      content: {
        title: "Streakly Test Reminder ⚡",
        body: `Test notification fired successfully after ${seconds} seconds!`,
        sound: "default",
        priority: Notifications.AndroidNotificationPriority?.HIGH ?? 4,
        data: { channelId, target: { type: "today" } },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        channelId,
      },
    });

    if (__DEV__) {
      console.log(`[notifications/dev] Successfully scheduled test notification (id: ${id || testId}) in ${seconds}s`);
    }

    return { success: true, id: id || testId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[notifications/dev] Failed to schedule test notification:", err);
    return { success: false, error: msg };
  }
}
