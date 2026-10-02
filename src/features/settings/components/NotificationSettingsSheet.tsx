import React, { useState } from "react";
import { View, ScrollView, Linking } from "react-native";
import { Sheet, Text, Button, Toggle } from "@/components/ui";
import {
  useNotificationSettings,
  useNotificationPermission,
} from "@/lib/notifications";
import { TimePickerSheet } from "@/features/planner/components/TimePickerSheet";
import { NotificationQuietHoursSection } from "./NotificationQuietHoursSection";
import { NotificationCategoryToggles } from "./NotificationCategoryToggles";
import { PrePermissionSheet } from "./PrePermissionSheet";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function NotificationSettingsSheet({ visible, onClose }: Props) {
  const { settings, updateSettings } = useNotificationSettings();
  const { status, request, refresh } = useNotificationPermission();
  const [showPrePerm, setShowPrePerm] = useState(false);

  const [activeTimePicker, setActiveTimePicker] = useState<
    "evening" | "morning" | "quietStart" | "quietEnd" | null
  >(null);

  const isDenied = status === "denied";
  const isGranted = status === "granted";
  const isNotAsked = status === "undetermined";

  const handleMasterToggle = async (val: boolean) => {
    if (val && !isGranted) {
      setShowPrePerm(true);
      return;
    }
    updateSettings({ enabled: val });
  };

  const handleEnablePermission = () => {
    setShowPrePerm(true);
  };

  return (
    <>
      <Sheet visible={visible} onClose={onClose} title="Notification Settings">
        <ScrollView className="max-h-[500px]" showsVerticalScrollIndicator={false}>
          <View className="gap-5 pb-6">
            {/* Permission Status Row */}
            <View className="p-3.5 rounded-xl bg-surface border border-border">
              <View className="flex-row items-center justify-between mb-1">
                <Text variant="label">SYSTEM PERMISSION</Text>
                <View className="flex-row items-center gap-1.5">
                  <View
                    className={`w-2 h-2 rounded-full ${
                      isGranted ? "bg-primary" : isDenied ? "bg-coral" : "bg-text-muted"
                    }`}
                  />
                  <Text
                    variant="caption"
                    className={`font-bold ${
                      isGranted ? "text-primary" : isDenied ? "text-coral" : "text-text-secondary"
                    }`}
                  >
                    {isGranted ? "Granted" : isDenied ? "Blocked" : "Not Enabled"}
                  </Text>
                </View>
              </View>

              {isNotAsked && (
                <View className="mt-2 pt-2 border-t border-border flex-row items-center justify-between">
                  <Text variant="caption" className="text-text-secondary flex-1 mr-2">
                    Permission required for local alerts.
                  </Text>
                  <Button
                    size="sm"
                    variant="primary"
                    title="Enable"
                    onPress={handleEnablePermission}
                  />
                </View>
              )}

              {isDenied && (
                <View className="mt-2 pt-2 border-t border-border flex-row items-center justify-between">
                  <Text variant="caption" className="text-coral flex-1 mr-2">
                    Notifications blocked in Android settings.
                  </Text>
                  <Button
                    size="sm"
                    variant="secondary"
                    title="Open Settings"
                    onPress={() => Linking.openSettings()}
                  />
                </View>
              )}
            </View>

            {/* Master Toggle */}
            <View className="flex-row items-center justify-between py-2 border-b border-border">
              <View className="flex-1 pr-3">
                <Text variant="body" className="font-bold">Allow Notifications</Text>
                <Text variant="caption">Master switch for all Streakly reminders</Text>
              </View>
              <Toggle value={settings.enabled} onValueChange={handleMasterToggle} />
            </View>

            {settings.enabled && (
              <>
                <NotificationCategoryToggles
                  settings={settings}
                  updateSettings={updateSettings}
                  onPickEvening={() => setActiveTimePicker("evening")}
                  onPickMorning={() => setActiveTimePicker("morning")}
                />

                <NotificationQuietHoursSection
                  enabled={settings.quietHoursEnabled}
                  onToggle={(val) => updateSettings({ quietHoursEnabled: val })}
                  startTime={settings.quietHoursStart}
                  endTime={settings.quietHoursEnd}
                  onPickStart={() => setActiveTimePicker("quietStart")}
                  onPickEnd={() => setActiveTimePicker("quietEnd")}
                />
              </>
            )}
          </View>
        </ScrollView>
      </Sheet>

      <TimePickerSheet
        visible={activeTimePicker !== null}
        onClose={() => setActiveTimePicker(null)}
        initialTime={
          activeTimePicker === "evening"
            ? settings.eveningNudgeTime
            : activeTimePicker === "morning"
            ? settings.morningBriefingTime
            : activeTimePicker === "quietStart"
            ? settings.quietHoursStart
            : settings.quietHoursEnd
        }
        onSelectTime={(time) => {
          if (!time) return;
          if (activeTimePicker === "evening") updateSettings({ eveningNudgeTime: time });
          else if (activeTimePicker === "morning") updateSettings({ morningBriefingTime: time });
          else if (activeTimePicker === "quietStart") updateSettings({ quietHoursStart: time });
          else if (activeTimePicker === "quietEnd") updateSettings({ quietHoursEnd: time });
          setActiveTimePicker(null);
        }}
      />

      <PrePermissionSheet
        visible={showPrePerm}
        onClose={() => setShowPrePerm(false)}
        onGranted={async () => {
          setShowPrePerm(false);
          await request();
          await refresh();
        }}
      />
    </>
  );
}
