import React from "react";
import { View } from "react-native";
import { Bell } from "phosphor-react-native";
import { Sheet, Text, Button } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { ensureNotificationPermission } from "@/lib/notifications";

export interface PreNotificationPermissionSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function PreNotificationPermissionSheet({
  visible,
  onClose,
}: PreNotificationPermissionSheetProps) {
  const handleEnable = async () => {
    onClose();
    await ensureNotificationPermission();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Stay on Track">
      <View className="gap-4 pb-2 items-center text-center">
        <View className="w-14 h-14 rounded-full bg-primary/20 items-center justify-center my-1 border border-primary/40">
          <Bell size={28} color={THEME_COLORS.primary} weight="bold" />
        </View>

        <Text variant="body" className="text-text-secondary text-center px-2">
          We'll notify you when your session ends, even if the app is closed.
        </Text>

        <View className="w-full gap-2 mt-2">
          <Button variant="primary" title="Enable Notifications" onPress={handleEnable} />
          <Button variant="secondary" title="Not Now" onPress={onClose} />
        </View>
      </View>
    </Sheet>
  );
}
