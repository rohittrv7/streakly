import React from "react";
import { View } from "react-native";
import { Sheet, Text, Button } from "@/components/ui";
import { Bell } from "phosphor-react-native";
import { THEME_COLORS } from "@/lib/theme";
import {
  requestNotificationPermission,
  recordNotNow,
} from "@/lib/notifications";

interface Props {
  visible: boolean;
  onClose: () => void;
  onGranted?: () => void;
}

export function PrePermissionSheet({ visible, onClose, onGranted }: Props) {
  const handleEnable = async () => {
    onClose();
    const granted = await requestNotificationPermission();
    if (granted && onGranted) {
      onGranted();
    }
  };

  const handleNotNow = async () => {
    await recordNotNow();
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={handleNotNow} title="Stay on Track">
      <View className="items-center py-2 gap-4">
        <View className="w-14 h-14 rounded-full bg-primary/20 items-center justify-center">
          <Bell size={28} color={THEME_COLORS.primary} weight="fill" />
        </View>

        <View className="items-center px-4">
          <Text variant="body" className="text-center font-medium mb-1">
            Streaks stay alive when you're reminded
          </Text>
          <Text variant="caption" className="text-center text-text-secondary">
            Streakly sends smart, quiet reminders for your scheduled habits and focus sessions. No spam, ever.
          </Text>
        </View>

        <View className="w-full gap-2 pt-2">
          <Button
            variant="primary"
            title="Enable Reminders"
            onPress={handleEnable}
          />
          <Button
            variant="ghost"
            title="Not Now"
            onPress={handleNotNow}
          />
        </View>
      </View>
    </Sheet>
  );
}
