import React from "react";
import { View, Pressable } from "react-native";
import { Text, Toggle, Pill } from "@/components/ui";
import type { NotificationSettings, TaskLeadMinutes } from "@/lib/notifications";

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
  const leadOptions: TaskLeadMinutes[] = [0, 5, 10, 30];

  return (
    <>
      {/* Habit Reminders */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text variant="body" className="font-medium">Habit Reminders</Text>
          <Text variant="caption">Remind at each habit's scheduled time</Text>
        </View>
        <Toggle
          value={settings.habitReminders}
          onValueChange={(val) => updateSettings({ habitReminders: val })}
        />
      </View>

      {/* Task Reminders */}
      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text variant="body" className="font-medium">Task Reminders</Text>
            <Text variant="caption">Remind before scheduled tasks</Text>
          </View>
          <Toggle
            value={settings.taskReminders}
            onValueChange={(val) => updateSettings({ taskReminders: val })}
          />
        </View>

        {settings.taskReminders && (
          <View className="flex-row items-center gap-2 pt-1">
            <Text variant="caption" className="text-xs mr-1 text-text-muted">
              Alert:
            </Text>
            {leadOptions.map((mins) => (
              <Pill
                key={mins}
                label={mins === 0 ? "At start" : `${mins}m before`}
                selected={settings.taskLeadMinutes === mins}
                onPress={() => updateSettings({ taskLeadMinutes: mins })}
              />
            ))}
          </View>
        )}
      </View>

      {/* Evening Nudge */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text variant="body" className="font-medium">Evening Nudge</Text>
          <Text variant="caption">Summary of uncompleted habits & tasks</Text>
        </View>
        <View className="flex-row items-center gap-2">
          {settings.eveningNudge && (
            <Pressable
              onPress={onPickEvening}
              className="px-2.5 py-1 rounded-lg bg-surface border border-border"
            >
              <Text variant="caption" className="font-bold text-primary">
                {settings.eveningNudgeTime}
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
          <Text variant="body" className="font-medium">Morning Briefing</Text>
          <Text variant="caption">Overview of today's plan</Text>
        </View>
        <View className="flex-row items-center gap-2">
          {settings.morningBriefing && (
            <Pressable
              onPress={onPickMorning}
              className="px-2.5 py-1 rounded-lg bg-surface border border-border"
            >
              <Text variant="caption" className="font-bold text-primary">
                {settings.morningBriefingTime}
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
