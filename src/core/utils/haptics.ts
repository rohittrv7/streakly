import * as ExpoHaptics from "expo-haptics";

let hapticsEnabled = true;

/**
 * Configure whether haptics are enabled globally.
 * Managed automatically by useSettingsStore.
 */
export function setHapticsEnabled(enabled: boolean): void {
  hapticsEnabled = enabled;
}

export function isHapticsEnabled(): boolean {
  return hapticsEnabled;
}

/**
 * Global haptics wrapper that respects user preferences.
 * All haptic calls across Streakly go through this wrapper.
 */
export const Haptics = {
  selectionAsync: async (): Promise<void> => {
    if (!hapticsEnabled) return;
    try {
      await ExpoHaptics.selectionAsync();
    } catch {
      // Gracefully ignore haptic failures on unsupported devices
    }
  },

  impactAsync: async (
    style: ExpoHaptics.ImpactFeedbackStyle = ExpoHaptics.ImpactFeedbackStyle.Medium
  ): Promise<void> => {
    if (!hapticsEnabled) return;
    try {
      await ExpoHaptics.impactAsync(style);
    } catch {
      // Gracefully ignore
    }
  },

  notificationAsync: async (
    type: ExpoHaptics.NotificationFeedbackType = ExpoHaptics.NotificationFeedbackType.Success
  ): Promise<void> => {
    if (!hapticsEnabled) return;
    try {
      await ExpoHaptics.notificationAsync(type);
    } catch {
      // Gracefully ignore
    }
  },

  ImpactFeedbackStyle: ExpoHaptics.ImpactFeedbackStyle,
  NotificationFeedbackType: ExpoHaptics.NotificationFeedbackType,
};
