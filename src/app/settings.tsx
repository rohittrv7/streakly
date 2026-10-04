import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { CaretLeft, Gear } from "@/components/icons";
import { Screen, Text, Button, Stagger } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { useAccent } from "@/lib/theme/store";
import { useT } from "@/core/i18n";
import {
  AppearanceSection,
  NotificationsRow,
  FocusRow,
  DataSection,
  AboutSection,
  DevSection,
} from "@/features/settings";

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useT();
  const { accent } = useAccent();

  return (
    <Screen scroll keyboard>
      <Stagger delay={50}>
        {/* Header with Back Button */}
        <View className="flex-row items-center gap-3 pt-2 pb-5 border-b border-border mb-6 min-h-[48px]">
          <Button
            variant="icon-only"
            size="sm"
            icon={<CaretLeft size={20} color={THEME_COLORS.text.primary} weight="bold" />}
            onPress={() => router.back()}
            accessibilityLabel="Back"
          />
          <View className="flex-1 min-w-0">
            <View className="flex-row items-center gap-1.5 mb-0.5">
              <Gear size={13} color={accent.hex} weight="fill" />
              <Text variant="label">{t("settings.preferences")}</Text>
            </View>
            <Text variant="title" numberOfLines={1}>{t("settings.title")}</Text>
          </View>
        </View>

        {/* 1. Appearance Section: Accent, Language, Haptics */}
        <AppearanceSection />

        {/* 2. Notifications Row */}
        <NotificationsRow />

        {/* 3. Focus Timer Row */}
        <FocusRow />

        {/* 4. Data Management: Export, Import, Delete */}
        <DataSection />

        {/* 5. About: App Version, How Streaks Work, Privacy Note */}
        <AboutSection />

        {/* 6. Developer Tools (Only in __DEV__) */}
        {__DEV__ && <DevSection />}
      </Stagger>
    </Screen>
  );
}
