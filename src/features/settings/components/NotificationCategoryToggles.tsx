import React from "react";
import { View, Pressable } from "react-native";
import { Text, Toggle } from "@/components/ui";
import { useTranslation } from "@/core/i18n";
import { formatTime } from "@/core/utils/time";
import type { NotificationSettings } from "@/lib/notifications";

interface Props {
  settings: NotificationSettings;
  updateSettings: (updates: Partial<NotificationSettings>) => void;
  onPickEvening: () => void;
  onPickMorning: () => void;
}

export function NotificationCategoryToggles({
  settings,
  updateSettings,
  onPickEvening,
  onPickMorning,
}: Props) {
  const { t } = useTranslation();

  return (
    <>
      {/* Habit Reminders */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text variant="body" className="font-medium">{t("notifications.habitRemindersTitle")}</Text>
          <Text variant="caption">{t("notifications.habitRemindersSubtitle")}</Text>
        </View>
        <Toggle
          value={settings.habitReminders}
          onValueChange={(val) => updateSettings({ habitReminders: val })}
        />
      </View>

      {/* Task Reminders */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text variant="body" className="font-medium">{t("notifications.taskRemindersTitle")}</Text>
          <Text variant="caption">{t("notifications.taskRemindersSubtitle")}</Text>
        </View>
        <Toggle
          value={settings.taskReminders}
          onValueChange={(val) => updateSettings({ taskReminders: val })}
        />
      </View>

      {/* Evening Nudge */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text variant="body" className="font-medium">{t("notifications.eveningNudgeTitle")}</Text>
          <Text variant="caption">{t("notifications.eveningNudgeSubtitle")}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          {settings.eveningNudge && (
            <Pressable
              onPress={onPickEvening}
              className="px-2.5 py-1 rounded-lg bg-surface border border-border"
            >
              <Text variant="caption" className="font-bold text-primary">
                {formatTime(settings.eveningNudgeTime)}
              </Text>
            </Pressable>
          )}
          <Toggle
            value={settings.eveningNudge}
            onValueChange={(val) => updateSettings({ eveningNudge: val })}
          />
        </View>
      </View>

      {/* Morning Briefing */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text variant="body" className="font-medium">{t("notifications.morningBriefingTitle")}</Text>
          <Text variant="caption">{t("notifications.morningBriefingSubtitle")}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          {settings.morningBriefing && (
            <Pressable
              onPress={onPickMorning}
              className="px-2.5 py-1 rounded-lg bg-surface border border-border"
            >
              <Text variant="caption" className="font-bold text-primary">
                {formatTime(settings.morningBriefingTime)}
              </Text>
            </Pressable>
          )}
          <Toggle
            value={settings.morningBriefing}
            onValueChange={(val) => updateSettings({ morningBriefing: val })}
          />
        </View>
      </View>
    </>
  );
}
