import React, { useState } from "react";
import { View, Platform, Linking, Pressable } from "react-native";
import * as IntentLauncher from "expo-intent-launcher";
import { Text, Button } from "@/components/ui";
import { useTranslation } from "@/core/i18n";
import { getNotifications, NOTIFICATION_CHANNELS } from "@/lib/notifications";

export function NotificationOnTimeSection() {
  const { t } = useTranslation();
  const [testStatus, setTestStatus] = useState<string | null>(null);

  const isAndroid12Plus =
    Platform.OS === "android" &&
    (typeof Platform.Version === "number"
      ? Platform.Version >= 31
      : parseInt(String(Platform.Version), 10) >= 31);

  const openExactAlarms = async () => {
    try {
      await IntentLauncher.startActivityAsync(
        "android.settings.REQUEST_SCHEDULE_EXACT_ALARM",
        { data: "package:com.yourname.streakly" }
      );
    } catch {
      await Linking.openSettings().catch(() => {});
    }
  };

  const openBatterySettings = async () => {
    try {
      await IntentLauncher.startActivityAsync(
        "android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS"
      );
    } catch {
      await Linking.openSettings().catch(() => {});
    }
  };

  const sendTestReminder = async () => {
    setTestStatus(t("notifications.schedulingTest"));
    const Notifications = getNotifications();
    if (!Notifications) {
      setTestStatus(t("notifications.testFailedUnavailable"));
      return;
    }

    try {
      const fireDate = new Date(Date.now() + 10000);
      const id = await Notifications.scheduleNotificationAsync({
        identifier: `test:reminder:${Date.now()}`,
        content: {
          title: "Streakly Test Reminder",
          body: "10-second test arrived on the habits channel.",
          sound: "default",
          data: { channelId: NOTIFICATION_CHANNELS.habits },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fireDate,
          channelId: NOTIFICATION_CHANNELS.habits,
        },
      });
      setTestStatus(`${t("notifications.testScheduledSuccess")} (${id})`);
    } catch (err) {
      setTestStatus(`${t("notifications.testFailed")}: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <View className="gap-3 pt-3 border-t border-border">
      {isAndroid12Plus && (
        <>
          <Text variant="label">{t("notifications.onTimeHeader")}</Text>

          {/* Row (a): Allow exact alarms */}
          <Pressable
            onPress={openExactAlarms}
            className="min-h-[44px] justify-center p-3 rounded-xl bg-surface border border-border active:opacity-80"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-2">
                <Text variant="body" className="font-bold">{t("notifications.exactAlarmTitle")}</Text>
                <Text variant="caption">{t("notifications.exactAlarmSubtitle")}</Text>
              </View>
              <Text variant="caption" className="font-bold text-primary">{t("notifications.openSettings")}</Text>
            </View>
          </Pressable>

          {/* Row (b): Battery optimization */}
          <Pressable
            onPress={openBatterySettings}
            className="min-h-[44px] justify-center p-3 rounded-xl bg-surface border border-border active:opacity-80"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-2">
                <Text variant="body" className="font-bold">{t("notifications.batteryOptTitle")}</Text>
                <Text variant="caption">{t("notifications.batteryOptSubtitle")}</Text>
              </View>
              <Text variant="caption" className="font-bold text-primary">{t("notifications.openSettings")}</Text>
            </View>
          </Pressable>
        </>
      )}

      {/* User-visible release test reminder button */}
      <View className="gap-2 pt-1">
        <Button
          variant="secondary"
          title={t("notifications.sendTestReminder")}
          onPress={sendTestReminder}
        />
        {testStatus && (
          <Text variant="caption" className="text-center text-primary font-medium">
            {testStatus}
          </Text>
        )}
      </View>
    </View>
  );
}
