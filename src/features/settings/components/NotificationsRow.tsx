import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { Bell, CaretRight } from "phosphor-react-native";
import { Card, Text } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { useAccent } from "@/lib/theme/store";
import { useNotificationSettingsStore } from "@/lib/notifications";
import { NotificationSettingsSheet } from "./NotificationSettingsSheet";
import { useT } from "@/core/i18n";
import { Haptics } from "@/core/utils/haptics";

export function NotificationsRow() {
  const { t } = useT();
  const { accent } = useAccent();
  const [sheetOpen, setSheetOpen] = useState(false);
  const settings = useNotificationSettingsStore((s) => s.settings);

  let activeTypesCount = 0;
  if (settings.habitReminders) activeTypesCount++;
  if (settings.taskReminders) activeTypesCount++;
  if (settings.eveningNudge) activeTypesCount++;
  if (settings.morningBriefing) activeTypesCount++;

  const subtitle = settings.enabled
    ? `On, ${activeTypesCount} reminder type${activeTypesCount === 1 ? "" : "s"} active`
    : t("notifications.subtitleOff");

  const handlePress = () => {
    Haptics.selectionAsync();
    setSheetOpen(true);
  };

  return (
    <>
      <Pressable
        onPress={handlePress}
        className="mb-4 min-h-[52px]"
        accessibilityRole="button"
        accessibilityLabel="Notification Settings"
      >
        <Card variant="surface" className="p-4 flex-row items-center justify-between border border-border">
          <View className="flex-row items-center gap-3.5 flex-1 pr-2">
            <View
              style={{ backgroundColor: accent.softBackground }}
              className="w-10 h-10 rounded-full items-center justify-center"
            >
              <Bell size={20} color={accent.hex} weight="fill" />
            </View>
            <View className="flex-1">
              <Text variant="body" className="font-bold text-text-primary">
                {t("settings.notifications")}
              </Text>
              <Text variant="caption">{subtitle}</Text>
            </View>
          </View>
          <CaretRight size={18} color={THEME_COLORS.text.muted} weight="bold" />
        </Card>
      </Pressable>

      <NotificationSettingsSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}
