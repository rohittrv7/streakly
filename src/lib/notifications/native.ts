import { Platform } from "react-native";
import { isRunningInExpoGo } from "expo";

export type NotificationsModule = typeof import("expo-notifications");

let cachedNotifications: NotificationsModule | null | undefined = undefined;

function loadLocalSubmodules(): NotificationsModule | null {
  try {
    const handler = require("expo-notifications/build/NotificationsHandler");
    const emitter = require("expo-notifications/build/NotificationsEmitter");
    const schedule = require("expo-notifications/build/scheduleNotificationAsync");
    const cancel = require("expo-notifications/build/cancelScheduledNotificationAsync");
    const cancelAll = require("expo-notifications/build/cancelAllScheduledNotificationsAsync");
    const getAll = require("expo-notifications/build/getAllScheduledNotificationsAsync");
    const setChannel = require("expo-notifications/build/setNotificationChannelAsync");
    const deleteChannel = require("expo-notifications/build/deleteNotificationChannelAsync");
    const getChannel = require("expo-notifications/build/getNotificationChannelAsync");
    const getChannels = require("expo-notifications/build/getNotificationChannelsAsync");
    const permissions = require("expo-notifications/build/NotificationPermissions");
    const channelTypes = require("expo-notifications/build/NotificationChannelManager.types");
    const notifTypes = require("expo-notifications/build/Notifications.types");
    const permTypes = require("expo-notifications/build/NotificationPermissions.types");

    return {
      ...handler,
      ...emitter,
      ...schedule,
      ...cancel,
      ...cancelAll,
      ...getAll,
      ...setChannel,
      ...deleteChannel,
      ...getChannel,
      ...getChannels,
      ...permissions,
      ...channelTypes,
      ...notifTypes,
      ...permTypes,
    } as unknown as NotificationsModule;
  } catch {
    return null;
  }
}

/**
 * Memoized lazy loader for expo-notifications.
 *
 * In Expo SDK 53+, remote push notification tokens were removed from Expo Go on Android.
 * Importing the root 'expo-notifications' package executes DevicePushTokenAutoRegistration.fx
 * as a side-effect, throwing a fatal Uncaught Error in Expo Go on Android even when only local
 * notifications are used.
 *
 * To prevent this crash:
 * 1. In Expo Go on Android, we load the safe local notification submodules directly.
 * 2. In dev builds, iOS, and Jest tests, we use the standard root module.
 * 3. Never use console.error in catch blocks to prevent React Native LogBox red screens.
 */
export function getNotifications(): NotificationsModule | null {
  if (Platform.OS === "web") return null;

  if (cachedNotifications !== undefined) {
    return cachedNotifications;
  }

  // 1. Android inside Expo Go: bypass DevicePushTokenAutoRegistration.fx
  if (Platform.OS === "android" && isRunningInExpoGo()) {
    const localMod = loadLocalSubmodules();
    if (localMod) {
      cachedNotifications = localMod;
      return localMod;
    }
  }

  // 2. Standard loader (dev builds / iOS / Jest)
  try {
    const mod: NotificationsModule = require("expo-notifications");
    cachedNotifications = mod;
    return mod;
  } catch (err) {
    // 3. Fallback to submodules if root package failed
    const fallbackMod = loadLocalSubmodules();
    if (fallbackMod) {
      cachedNotifications = fallbackMod;
      return fallbackMod;
    }
    // Use console.warn so React Native LogBox does not trigger an uncaught Red Box modal
    console.warn("[notifications] Notifications unavailable in current runtime:", err);
    cachedNotifications = null;
    return null;
  }
}
