import React from "react";
import { View } from "react-native";
import { Text, Toggle, Pill } from "@/components/ui";
import { useTranslation } from "@/core/i18n";
import type {
  NotificationSettings,
  HabitLeadMinutes,
  TaskLeadMinutes,
  OverdueDelayMinutes,
  NotificationTone,
} from "@/lib/notifications";

interface Props {
  settings: NotificationSettings;
  updateSettings: (updates: Partial<NotificationSettings>) => void;
}

export function NotificationTimingSection({ settings, updateSettings }: Props) {
  const { t } = useTranslation();

  const habitLeads: HabitLeadMinutes[] = [0, 2, 5, 10, 15];
  const taskLeads: TaskLeadMinutes[] = [0, 2, 5, 10, 15, 30];
  const overdueDelays: OverdueDelayMinutes[] = __DEV__
    ? [1, 30, 60, 120]
    : [30, 60, 120];

  return (
    <View className="gap-4 pt-2 border-t border-border">
      <Text variant="label">{t("notifications.timingSection")}</Text>

      {/* Habit Lead Time */}
      <View className="gap-2">
        <View>
          <Text variant="body" className="font-medium">{t("notifications.habitLeadTitle")}</Text>
          <Text variant="caption">{t("notifications.habitLeadSubtitle")}</Text>
        </View>
        <View className="flex-row flex-wrap gap-1.5 pt-1">
          {habitLeads.map((m) => (
            <Pill
              key={m}
              label={m === 0 ? t("notifications.leadOff") : `${m}m`}
              selected={settings.habitLeadMinutes === m}
              onPress={() => updateSettings({ habitLeadMinutes: m })}
            />
          ))}
        </View>
      </View>

      {/* Also Notify at Exact Time */}
      <View className="flex-row items-center justify-between py-1">
        <View className="flex-1 pr-3">
          <Text variant="body" className="font-medium">{t("notifications.exactTimeTitle")}</Text>
          <Text variant="caption">{t("notifications.exactTimeSubtitle")}</Text>
        </View>
        <Toggle
          value={settings.alsoNotifyAtExactTime}
          onValueChange={(val) => updateSettings({ alsoNotifyAtExactTime: val })}
        />
      </View>

      {/* Task Lead Time */}
      <View className="gap-2">
        <View>
          <Text variant="body" className="font-medium">{t("notifications.taskLeadTitle")}</Text>
          <Text variant="caption">{t("notifications.taskLeadSubtitle")}</Text>
        </View>
        <View className="flex-row flex-wrap gap-1.5 pt-1">
          {taskLeads.map((m) => (
            <Pill
              key={m}
              label={m === 0 ? t("notifications.leadOff") : `${m}m`}
              selected={settings.taskLeadMinutes === m}
              onPress={() => updateSettings({ taskLeadMinutes: m })}
            />
          ))}
        </View>
      </View>

      {/* Overdue Nudge */}
      <View className="gap-2 pt-1 border-t border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text variant="body" className="font-medium">{t("notifications.overdueTitle")}</Text>
            <Text variant="caption">{t("notifications.overdueSubtitle")}</Text>
          </View>
          <Toggle
            value={settings.overdueNudge}
            onValueChange={(val) => updateSettings({ overdueNudge: val })}
          />
        </View>

        {settings.overdueNudge && (
          <View className="flex-row flex-wrap items-center gap-1.5 pt-1">
            <Text variant="caption" className="mr-1 text-text-muted">
              {t("notifications.delayLabel")}:
            </Text>
            {overdueDelays.map((m) => (
              <Pill
                key={m}
                label={`${m}m`}
                selected={settings.overdueDelayMinutes === m}
                onPress={() => updateSettings({ overdueDelayMinutes: m })}
              />
            ))}
          </View>
        )}
      </View>

      {/* Streak Broken Nudge */}
      <View className="flex-row items-center justify-between py-1 border-t border-border">
        <View className="flex-1 pr-3">
          <Text variant="body" className="font-medium">{t("notifications.streakBrokenTitle")}</Text>
          <Text variant="caption">{t("notifications.streakBrokenSubtitle")}</Text>
        </View>
        <Toggle
          value={settings.streakBrokenMessage}
          onValueChange={(val) => updateSettings({ streakBrokenMessage: val })}
        />
      </View>

      {/* Tone Picker */}
      <View className="gap-2 pt-1 border-t border-border">
        <View>
          <Text variant="body" className="font-medium">{t("notifications.toneTitle")}</Text>
          <Text variant="caption">{t("notifications.toneSubtitle")}</Text>
        </View>
        <View className="flex-row gap-2 pt-1">
          <Pill
            label={t("notifications.toneFriendly")}
            selected={settings.tone === "friendly"}
            onPress={() => updateSettings({ tone: "friendly" })}
          />
          <Pill
            label={t("notifications.toneStrict")}
            selected={settings.tone === "strict"}
            onPress={() => updateSettings({ tone: "strict" })}
          />
        </View>
      </View>
    </View>
  );
}
