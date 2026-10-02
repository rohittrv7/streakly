import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import {
  Code,
  PaintBrush,
  ArrowCounterClockwise,
  CaretRight,
} from "phosphor-react-native";
import { Card, Text, Sheet, Button } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { resetAndReseedDatabase } from "@/lib/db/seed";
import { runStressSeed } from "@/lib/db/seed-stress";
import { useHabitsStore } from "@/features/habits/store";
import { NotificationDevSection } from "./NotificationDevSection";
import { useT } from "@/core/i18n";
import { Haptics } from "@/core/utils/haptics";

export function DevSection() {
  const router = useRouter();
  const { t } = useT();
  const [reseedSheetOpen, setReseedSheetOpen] = useState(false);
  const [reseeding, setReseeding] = useState(false);
  const [stressSeeding, setStressSeeding] = useState(false);

  const handleStressSeed = async () => {
    try {
      setStressSeeding(true);
      await runStressSeed();
      await useHabitsStore.getState().load();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setStressSeeding(false);
    }
  };

  const handleReseed = async () => {
    try {
      setReseeding(true);
      await resetAndReseedDatabase();
      await useHabitsStore.getState().load();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setReseedSheetOpen(false);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setReseeding(false);
    }
  };

  return (
    <>
      <Card variant="surface" className="p-4 mb-4 border border-border">
        {/* Section Header */}
        <View className="flex-row items-center gap-2 mb-3">
          <Code size={18} color={THEME_COLORS.sky} weight="bold" />
          <Text variant="body" className="font-bold text-sky">
            {t("settings.developer")}
          </Text>
        </View>

        {/* UI Gallery Row */}
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            router.push("/ui-gallery");
          }}
          className="py-3 flex-row items-center justify-between min-h-[48px]"
          accessibilityRole="button"
          accessibilityLabel="Open UI Gallery"
        >
          <View className="flex-row items-center gap-3 flex-1 pr-2">
            <PaintBrush size={18} color={THEME_COLORS.text.secondary} />
            <View className="flex-1">
              <Text variant="body" className="font-medium text-text-primary">
                {t("settings.uiGallery")}
              </Text>
              <Text variant="caption">13 design system primitives</Text>
            </View>
          </View>
          <CaretRight size={18} color={THEME_COLORS.text.muted} weight="bold" />
        </Pressable>

        {/* Reset and Reseed Demo Data Row */}
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            setReseedSheetOpen(true);
          }}
          className="pt-3 border-t border-border flex-row items-center justify-between min-h-[48px]"
          accessibilityRole="button"
          accessibilityLabel="Reset and reseed demo data"
        >
          <View className="flex-row items-center gap-3 flex-1 pr-2">
            <ArrowCounterClockwise size={18} color={THEME_COLORS.coral} weight="bold" />
            <View className="flex-1">
              <Text variant="body" className="font-bold text-coral">
                {t("settings.reseed")}
              </Text>
              <Text variant="caption">Wipe DB & re-populate demo habits</Text>
            </View>
          </View>
          <CaretRight size={18} color={THEME_COLORS.text.muted} weight="bold" />
        </Pressable>

        {/* Stress Seed Row */}
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            handleStressSeed();
          }}
          disabled={stressSeeding}
          className="pt-3 border-t border-border flex-row items-center justify-between min-h-[48px]"
          accessibilityRole="button"
          accessibilityLabel="Run Stress Seed"
        >
          <View className="flex-row items-center gap-3 flex-1 pr-2">
            <Code size={18} color={THEME_COLORS.amber} weight="bold" />
            <View className="flex-1">
              <Text variant="body" className="font-bold text-amber">
                {stressSeeding ? "Seeding 40 habits / 3000 completions..." : "Run Stress Seed"}
              </Text>
              <Text variant="caption">40 habits, 3000 completions, 1500 tasks, 600 sessions</Text>
            </View>
          </View>
          <CaretRight size={18} color={THEME_COLORS.text.muted} weight="bold" />
        </Pressable>
      </Card>

      {/* Notification Debug Panel */}
      <NotificationDevSection />

      {/* Reseed Confirmation Sheet */}
      <Sheet
        visible={reseedSheetOpen}
        onClose={() => setReseedSheetOpen(false)}
        title="Reset & Reseed Demo Data?"
      >
        <View className="gap-4 pb-2">
          <Text variant="body" className="text-text-secondary">
            This will wipe current records, re-seed the SQLite database with rich demo habits, completions, and tasks, and reload the habit store.
          </Text>
          <Button
            variant="secondary"
            title="Reset and Reseed"
            loading={reseeding}
            className="border-coral"
            textClassName="text-coral"
            onPress={handleReseed}
          />
          <Button
            variant="ghost"
            title="Cancel"
            onPress={() => setReseedSheetOpen(false)}
          />
        </View>
      </Sheet>
    </>
  );
}
