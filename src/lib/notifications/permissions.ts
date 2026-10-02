import { useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import { settingsRepo } from "@/features/settings/repo";
import type { PermissionState } from "./types";
import { ensureNotificationChannels } from "./channels";
import { getNotifications } from "./native";

const NOT_NOW_COUNT_KEY = "notif_not_now_count";
const NOT_NOW_TIMESTAMP_KEY = "notif_not_now_timestamp";
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export async function getPermissionStatus(): Promise<PermissionState> {
  if (Platform.OS === "web") {
    return { status: "denied", canAskAgain: false };
  }

  const Notifications = getNotifications();
  if (!Notifications) {
    return { status: "denied", canAskAgain: false };
  }

  try {
    const settings = await Notifications.getPermissionsAsync();
    const isGranted =
      settings.granted ||
      settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

    if (__DEV__) {
      console.log("[notifications/permissions] Current permission status:", settings.status, "granted:", isGranted);
    }

    if (isGranted) {
      return { status: "granted", canAskAgain: false };
    }
    return {
      status: settings.status === "undetermined" ? "undetermined" : "denied",
      canAskAgain: settings.canAskAgain !== false,
    };
  } catch (err) {
    console.error("[notifications/permissions] Failed to get permission status:", err);
    return { status: "denied", canAskAgain: false };
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  const Notifications = getNotifications();
  if (!Notifications) return false;

  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) {
      await ensureNotificationChannels();
      return true;
    }

    if (__DEV__) {
      console.log("[notifications/permissions] Requesting notification permission from OS...");
    }

    const res = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
      android: {},
    });

    if (__DEV__) {
      console.log("[notifications/permissions] Permission request result:", res.status, "granted:", res.granted);
    }

    if (res.granted) {
      await ensureNotificationChannels();
    }
    return res.granted;
  } catch (err) {
    console.error("[notifications/permissions] Failed to request permissions:", err);
    return false;
  }
}

export async function recordNotNow(): Promise<void> {
  const countStr = await settingsRepo.get(NOT_NOW_COUNT_KEY);
  const count = (parseInt(countStr || "0", 10) || 0) + 1;
  await settingsRepo.set(NOT_NOW_COUNT_KEY, String(count));
  await settingsRepo.set(NOT_NOW_TIMESTAMP_KEY, new Date().toISOString());
}

export async function canShowPrePermissionSheet(): Promise<boolean> {
  const perm = await getPermissionStatus();
  if (perm.status !== "undetermined") return false;

  const countStr = await settingsRepo.get(NOT_NOW_COUNT_KEY);
  const count = parseInt(countStr || "0", 10) || 0;
  if (count >= 2) return false;

  const lastTimestamp = await settingsRepo.get(NOT_NOW_TIMESTAMP_KEY);
  if (lastTimestamp) {
    const elapsed = Date.now() - new Date(lastTimestamp).getTime();
    if (elapsed < THREE_DAYS_MS) return false;
  }

  return true;
}

export function useNotificationPermission() {
  const [state, setState] = useState<PermissionState>({
    status: "undetermined",
    canAskAgain: true,
  });

  const refresh = useCallback(async () => {
    const s = await getPermissionStatus();
    setState(s);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const request = useCallback(async () => {
    const ok = await requestNotificationPermission();
    await refresh();
    return ok;
  }, [refresh]);

  return {
    status: state.status,
    canAskAgain: state.canAskAgain,
    refresh,
    request,
    recordNotNow,
  };
}
