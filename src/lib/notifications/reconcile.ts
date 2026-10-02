import { Platform } from "react-native";
import { habitsRepo } from "@/features/habits/repo";
import { plannerRepo } from "@/features/planner/repo";
import { settingsRepo } from "@/features/settings/repo";
import { computeStreak } from "@/features/habits/streak";
import { todayStr, addDays } from "@/core/utils/dates";
import type { ScheduledSummary, SupportedLanguage } from "./types";
import { buildNotificationPlan } from "./plan";
import { diffPlan, isOurNotification } from "./diff";
import { loadNotificationSettings, getLastAppOpen } from "./settings";
import { getPermissionStatus } from "./permissions";
import { ensureNotificationChannels, NOTIFICATION_CHANNELS } from "./channels";
import { getNotifications } from "./native";
import { useReconcileStore, type ReconcileResult } from "./reconcile-store";

export { useReconcileStore, type ReconcileResult };
let isReconciling = false;
let reRunQueued = false;
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

export async function reconcileNotificationsNow(): Promise<void> {
  if (Platform.OS === "web") return;
  const Notifications = getNotifications();
  if (!Notifications) return;

  if (isReconciling) {
    reRunQueued = true;
    return;
  }

  isReconciling = true;
  const errors: string[] = [];
  let scheduledCount = 0;
  let cancelledCount = 0;
  let plannedCount = 0;

  try {
    await ensureNotificationChannels();

    const [settings, perm, habits, languageSetting, lastOpenAt] = await Promise.all([
      loadNotificationSettings(),
      getPermissionStatus(),
      habitsRepo.list(false),
      settingsRepo.get("app_language").then(async (val) => val || (await settingsRepo.get("language"))),
      getLastAppOpen(),
    ]);

    const language: SupportedLanguage = languageSetting === "hinglish" ? "hinglish" : "en";
    const permissionGranted = perm.status === "granted";
    const today = todayStr();
    const windowEnd = addDays(today, 6);

    const [rawCompletions, rawFreezes, tasks] = await Promise.all([
      habitsRepo.getCompletionsInRange(addDays(today, -60), windowEnd),
      habitsRepo.getFreezesInRange(addDays(today, -60), windowEnd),
      plannerRepo.getTasksInRange(today, windowEnd),
    ]);

    const completions: Record<string, string[]> = {};
    for (const c of rawCompletions) (completions[c.habitId] ??= []).push(c.date);
    const freezes: Record<string, string[]> = {};
    for (const f of rawFreezes) (freezes[f.habitId] ??= []).push(f.date);

    const todayStreaks: Record<string, number> = {};
    for (const h of habits) {
      todayStreaks[h.id] = computeStreak(h, completions[h.id] || [], today, freezes[h.id] || []);
    }

    const desiredPlan = buildNotificationPlan({
      habits,
      completions,
      freezes,
      tasks,
      settings,
      permissionGranted,
      language,
      lastOpenAt,
      todayStreaks,
    });
    plannedCount = desiredPlan.length;

    const systemScheduled = await Notifications.getAllScheduledNotificationsAsync();
    const existingSummaries: ScheduledSummary[] = systemScheduled
      .filter((s: any) => isOurNotification(s.identifier))
      .map((s: any) => ({
        id: s.identifier,
        fireAt: s.trigger?.date ? new Date(s.trigger.date) : null,
        contentHash: s.content?.data?.contentHash,
      }));

    const { toCancel, toSchedule } = diffPlan(existingSummaries, desiredPlan);

    for (const id of toCancel) {
      try {
        await Notifications.cancelScheduledNotificationAsync(id);
        cancelledCount++;
      } catch (err) {
        errors.push(`Cancel error (${id}): ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    for (const item of toSchedule) {
      try {
        const channelId =
          item.channelId ||
          (item.kind === "habit" || item.id.startsWith("habit:") || item.id.endsWith(":late")
            ? NOTIFICATION_CHANNELS.habits
            : item.kind === "task" || item.id.startsWith("task:")
            ? NOTIFICATION_CHANNELS.tasks
            : NOTIFICATION_CHANNELS.nudges);

        await Notifications.scheduleNotificationAsync({
          identifier: item.id,
          content: {
            title: item.title,
            body: item.body,
            sound: "default",
            priority: Notifications.AndroidNotificationPriority?.HIGH ?? 4,
            data: {
              channelId,
              target: item.target,
              contentHash: item.contentHash,
            },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: item.fireAt,
            channelId,
          },
        });
        scheduledCount++;
      } catch (err) {
        errors.push(`Schedule error (${item.id}): ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  } catch (err) {
    errors.push(`Fatal error: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    isReconciling = false;
    useReconcileStore.getState().setResult({
      at: new Date().toLocaleTimeString(),
      plannedCount,
      scheduledCount,
      cancelledCount,
      errors,
    });
    if (reRunQueued) {
      reRunQueued = false;
      reconcileNotificationsNow();
    }
  }
}

export function requestNotificationReconcile(debounceMs: number = 800): void {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    debounceTimeout = null;
    reconcileNotificationsNow();
  }, debounceMs);
}
