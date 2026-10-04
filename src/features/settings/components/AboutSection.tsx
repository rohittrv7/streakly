import React, { useState } from "react";
import { View, Pressable } from "react-native";
import Constants from "expo-constants";
import { Info, Flame, ShieldCheck, CaretRight } from "@/components/icons";
import { Card, Text, Sheet, Button } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { useAccent } from "@/lib/theme/store";
import { useT } from "@/core/i18n";
import { Haptics } from "@/core/utils/haptics";

export function AboutSection() {
  const { t } = useT();
  const { accent } = useAccent();
  const [streaksSheetOpen, setStreaksSheetOpen] = useState(false);
  const [privacySheetOpen, setPrivacySheetOpen] = useState(false);

  const version = Constants.expoConfig?.version || "1.0.0";

  return (
    <>
      <Card variant="surface" className="p-4 mb-4 border border-border">
        {/* Section Header */}
        <View className="flex-row items-center gap-2 mb-3">
          <Info size={18} color={accent.hex} weight="fill" />
          <Text variant="body" className="font-bold text-text-primary">
            {t("settings.about")}
          </Text>
        </View>

        {/* Version & App Info */}
        <View className="py-2 mb-2">
          <Text variant="body" className="font-bold text-text-primary">
            Streakly v{version}
          </Text>
          <Text variant="caption">
            Personal habit tracker, task planner, and deep focus companion.
          </Text>
        </View>

        {/* How Streaks Work Row */}
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            setStreaksSheetOpen(true);
          }}
          className="py-3 border-t border-border flex-row items-center justify-between min-h-[48px]"
          accessibilityRole="button"
          accessibilityLabel="How streaks work"
        >
          <View className="flex-row items-center gap-3 flex-1 pr-2">
            <Flame size={18} color={THEME_COLORS.coral} weight="bold" />
            <View className="flex-1">
              <Text variant="body" className="font-medium text-text-primary">
                {t("about.howStreaksWork")}
              </Text>
              <Text variant="caption">{t("about.howStreaksWorkSummary")}</Text>
            </View>
          </View>
          <CaretRight size={18} color={THEME_COLORS.text.muted} weight="bold" />
        </Pressable>

        {/* Privacy Note Row */}
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            setPrivacySheetOpen(true);
          }}
          className="pt-3 border-t border-border flex-row items-center justify-between min-h-[48px]"
          accessibilityRole="button"
          accessibilityLabel="Privacy note"
        >
          <View className="flex-row items-center gap-3 flex-1 pr-2">
            <ShieldCheck size={18} color={THEME_COLORS.mint} weight="bold" />
            <View className="flex-1">
              <Text variant="body" className="font-medium text-text-primary">
                {t("about.privacyNote")}
              </Text>
              <Text variant="caption">{t("about.privacyNoteSummary")}</Text>
            </View>
          </View>
          <CaretRight size={18} color={THEME_COLORS.text.muted} weight="bold" />
        </Pressable>
      </Card>

      {/* How Streaks Work Sheet */}
      <Sheet
        visible={streaksSheetOpen}
        onClose={() => setStreaksSheetOpen(false)}
        title={t("about.streaksModalTitle")}
        size="tall"
      >
        <View className="gap-4 pb-4">
          <Text variant="body" className="text-text-secondary leading-relaxed">
            {t("about.streaksExplanation")}
          </Text>
          <View className="p-3.5 rounded-card-sm bg-surface border border-border gap-2">
            <Text variant="caption" className="font-bold text-text-primary">
              1. Scheduled Days Only
            </Text>
            <Text variant="caption">
              Streaks only count days you scheduled a habit for. Off-days never break your streak.
            </Text>
            <Text variant="caption" className="font-bold text-text-primary mt-1">
              2. Automatic Streak Freeze
            </Text>
            <Text variant="caption">
              Missed a scheduled day? If you have a freeze available, it automatically steps in to keep your streak intact.
            </Text>
            <Text variant="caption" className="font-bold text-text-primary mt-1">
              3. Weekly Goals
            </Text>
            <Text variant="caption">
              Weekly habits measure completions Monday through Sunday. Complete your target anytime during the week!
            </Text>
          </View>
          <Button
            variant="secondary"
            title="Got it"
            onPress={() => setStreaksSheetOpen(false)}
          />
        </View>
      </Sheet>

      {/* Privacy Note Sheet */}
      <Sheet
        visible={privacySheetOpen}
        onClose={() => setPrivacySheetOpen(false)}
        title={t("about.privacyModalTitle")}
        size="tall"
      >
        <View className="gap-4 pb-4">
          <Text variant="body" className="text-text-secondary leading-relaxed">
            {t("about.privacyExplanation")}
          </Text>
          <View className="p-3.5 rounded-card-sm bg-surface border border-border gap-2">
            <Text variant="caption" className="font-bold text-mint">
              ✓ Local SQLite Database
            </Text>
            <Text variant="caption">
              All records exist only on this physical device.
            </Text>
            <Text variant="caption" className="font-bold text-mint mt-1">
              ✓ No Account or Sign-in Required
            </Text>
            <Text variant="caption">
              No passwords, emails, or personal data collected.
            </Text>
            <Text variant="caption" className="font-bold text-mint mt-1">
              ✓ Portable Backups
            </Text>
            <Text variant="caption">
              Export and import your data anytime as standard JSON.
            </Text>
          </View>
          <Button
            variant="secondary"
            title="Got it"
            onPress={() => setPrivacySheetOpen(false)}
          />
        </View>
      </Sheet>
    </>
  );
}
