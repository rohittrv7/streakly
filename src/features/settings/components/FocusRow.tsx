import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { Timer, CaretRight } from "phosphor-react-native";
import { Card, Text } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { useAccent } from "@/lib/theme/store";
import { useFocusStore } from "@/features/focus/store";
import { FocusSettingsSheet } from "@/features/focus/components/FocusSettingsSheet";
import { useT } from "@/core/i18n";
import { Haptics } from "@/core/utils/haptics";

export function FocusRow() {
  const { t } = useT();
  const { accent } = useAccent();
  const [sheetOpen, setSheetOpen] = useState(false);
  const settings = useFocusStore((s) => s.settings);
  const updateSettings = useFocusStore((s) => s.updateSettings);

  const subtitle = `${settings.focusMinutes}m focus, ${settings.shortBreakMinutes}m break, ${settings.longBreakMinutes}m long break`;

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
        accessibilityLabel="Focus Timer Settings"
      >
        <Card variant="surface" className="p-4 flex-row items-center justify-between border border-border">
          <View className="flex-row items-center gap-3.5 flex-1 pr-2">
            <View
              style={{ backgroundColor: accent.softBackground }}
              className="w-10 h-10 rounded-full items-center justify-center"
            >
              <Timer size={20} color={accent.hex} weight="fill" />
            </View>
            <View className="flex-1">
              <Text variant="body" className="font-bold text-text-primary">
                {t("settings.focus")}
              </Text>
              <Text variant="caption">{subtitle}</Text>
            </View>
          </View>
          <CaretRight size={18} color={THEME_COLORS.text.muted} weight="bold" />
        </Card>
      </Pressable>

      <FocusSettingsSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
      />
    </>
  );
}
