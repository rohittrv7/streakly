import React, { useState, useEffect, useRef } from "react";
import { View, Pressable, Switch } from "react-native";
import { createAudioPlayer } from "expo-audio";
import { Text, Button } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { Haptics } from "@/core/utils/haptics";
import { useTranslation } from "@/core/i18n";
import {
  useNotificationSettings,
  getFocusChannelId,
  getNotifications,
  type FocusEndSound,
} from "@/lib/notifications";

export function FocusAlarmSettingsSection() {
  const { t } = useTranslation();
  const { settings, updateSettings } = useNotificationSettings();
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.pause();
          playerRef.current.release();
        } catch {}
      }
    };
  }, []);

  const soundModes = [
    {
      id: "alarm" as FocusEndSound,
      titleKey: "focus.soundAlarmTitle" as const,
      descKey: "focus.soundAlarmDesc" as const,
    },
    {
      id: "notification" as FocusEndSound,
      titleKey: "focus.soundNotifTitle" as const,
      descKey: "focus.soundNotifDesc" as const,
    },
    {
      id: "vibrate" as FocusEndSound,
      titleKey: "focus.soundVibrateTitle" as const,
      descKey: "focus.soundVibrateDesc" as const,
    },
  ];

  const handleTestAlarm = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setTestStatus(t("focus.testingAlarm"));

    // 1. Play in-app chime if not in vibrate mode
    if (settings.focusEndSound !== "vibrate") {
      try {
        if (!playerRef.current) {
          playerRef.current = createAudioPlayer(
            require("../../../../assets/sounds/focus_chime.wav")
          );
        }
        playerRef.current.play();
      } catch (err) {
        console.warn("[FocusAlarmSettingsSection] In-app audio error:", err);
      }
    }

    // 2. Schedule 5-second test notification on the selected channel
    const Notifications = getNotifications();
    if (!Notifications) {
      setTestStatus(t("focus.testAlarmAudioOnly"));
      return;
    }

    try {
      const channelId = getFocusChannelId(settings.focusEndSound);
      const fireDate = new Date(Date.now() + 5000);
      const sound =
        settings.focusEndSound === "alarm"
          ? "focus_chime.wav"
          : settings.focusEndSound === "notification"
          ? "default"
          : undefined;

      await Notifications.scheduleNotificationAsync({
        identifier: `test:focus:${Date.now()}`,
        content: {
          title: "Test Focus Alarm",
          body: "5-second test on selected focus channel.",
          sound,
          data: { channelId, target: { type: "focus" } },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fireDate,
          channelId,
        },
      });
      setTestStatus(t("focus.testAlarmSuccess"));
    } catch (err) {
      setTestStatus(
        `${t("focus.testAlarmError")}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  };

  return (
    <View className="gap-3 pt-3 border-t border-border">
      <Text variant="label">{t("focus.alarmSectionHeader")}</Text>

      {/* 3 Sound Mode Options */}
      <View className="gap-2">
        {soundModes.map((mode) => {
          const isSelected = settings.focusEndSound === mode.id;
          return (
            <Pressable
              key={mode.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                updateSettings({ focusEndSound: mode.id });
              }}
              className={`p-3 rounded-2xl border min-h-[44px] justify-center ${
                isSelected
                  ? "bg-surface border-primary"
                  : "bg-surface/60 border-border"
              }`}
            >
              <View className="flex-row items-center justify-between">
                <Text
                  variant="body"
                  className={`font-bold ${isSelected ? "text-primary" : "text-text-primary"}`}
                >
                  {t(mode.titleKey)}
                </Text>
                <View
                  className={`w-4 h-4 rounded-full border items-center justify-center ${
                    isSelected ? "border-primary bg-primary" : "border-border"
                  }`}
                >
                  {isSelected && <View className="w-2 h-2 rounded-full bg-background" />}
                </View>
              </View>
              <Text variant="caption" className="text-text-muted mt-0.5">
                {t(mode.descKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Repeat Reminders Toggle */}
      <View className="flex-row items-center justify-between p-3.5 bg-surface rounded-2xl border border-border">
        <View className="flex-1 mr-3">
          <Text variant="body" className="font-bold text-sm">
            {t("focus.repeatRemindersTitle")}
          </Text>
          <Text variant="caption" className="text-text-muted text-xs mt-0.5">
            {t("focus.repeatRemindersDesc")}
          </Text>
        </View>
        <Switch
          value={settings.focusRepeatReminders}
          onValueChange={(val) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            updateSettings({ focusRepeatReminders: val });
          }}
          trackColor={{ false: THEME_COLORS.elevated, true: THEME_COLORS.primary }}
          thumbColor={THEME_COLORS.background}
        />
      </View>

      {/* Test Button */}
      <View className="gap-2 pt-1">
        <Button
          variant="secondary"
          title={t("focus.testAlarmButton")}
          onPress={handleTestAlarm}
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
