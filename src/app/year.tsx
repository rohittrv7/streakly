import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedNumber, Button } from "@/components/ui";
import { useT } from "@/core/i18n";
import { useSettingsStore } from "@/features/settings/store";
import { useYearData } from "@/features/stats/hooks-year";
import { YearHeader } from "@/features/stats/components/YearHeader";
import { YearControls } from "@/features/stats/components/YearControls";
import { YearDots } from "@/features/stats/components/YearDots";
import { YearSummaryChips } from "@/features/stats/components/YearSummaryChips";
import { DayDetailSheet } from "@/features/stats/components/DayDetailSheet";
import type { HeatmapCell } from "@/features/stats/types";

export default function YearScreen() {
  const { t } = useT();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);

  const mode = useSettingsStore((s) => s.yearDotsMode);
  const layout = useSettingsStore((s) => s.yearDotsLayout);
  const setMode = useSettingsStore((s) => s.setYearDotsMode);
  const setLayout = useSettingsStore((s) => s.setYearDotsLayout);

  const {
    dots,
    summary,
    loading,
    error,
    retry,
    earliestYear,
    dailyCompletions,
    focusSessions,
  } = useYearData(selectedYear);

  const handleSelectDate = (date: string) => {
    const comp = dailyCompletions.find((d) => d.date === date);
    const dot = dots.find((d) => d.date === date);
    let focusMinutes = 0;
    for (const s of focusSessions) {
      if (s.startedAt.startsWith(date)) {
        focusMinutes += Math.round(s.durationSeconds / 60);
      }
    }

    setSelectedCell({
      date,
      level: dot?.level ?? 0,
      inRange: true,
      scheduled: comp?.scheduled ?? 0,
      done: comp?.done ?? 0,
      focusMinutes,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <View className="flex-1 px-4">
        {/* Header with back button and year switcher */}
        <YearHeader
          year={selectedYear}
          earliestYear={earliestYear}
          currentYear={currentYear}
          onSelectYear={setSelectedYear}
        />

        {error ? (
          <View className="flex-1 items-center justify-center p-6 gap-4">
            <Text className="text-text-secondary text-sm text-center">{error}</Text>
            <Button
              variant="primary"
              title={t("common.retry")}
              onPress={retry}
              className="min-h-[44px]"
            />
          </View>
        ) : loading && dots.length === 0 ? (
          <View className="flex-1 py-6 gap-4 animate-pulse">
            <View className="h-10 w-32 bg-elevated rounded-xl" />
            <View className="h-4 w-48 bg-elevated rounded" />
            <View className="h-12 w-full bg-elevated rounded-2xl" />
            <View className="flex-1 bg-elevated rounded-3xl" />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* Big Animated Number & Subtitle */}
            <View className="py-2">
              <View className="flex-row items-baseline gap-1">
                <Text className="text-text-primary text-3xl font-extrabold">Day </Text>
                <AnimatedNumber
                  value={summary.dayOfYear}
                  className="text-text-primary text-3xl font-extrabold"
                />
              </View>
              <Text className="text-muted text-sm font-medium mt-0.5">
                {t("stats.ofYearPct", {
                  total: summary.totalDays,
                  percent: summary.percentPassed,
                })}
              </Text>
            </View>

            {/* Segmented Controls for Mode and Layout */}
            <View className="my-3">
              <YearControls
                mode={mode}
                layout={layout}
                onChangeMode={setMode}
                onChangeLayout={setLayout}
              />
            </View>

            {/* Friendly line for brand-new users */}
            {summary.activeDays === 0 && (
              <View className="bg-surface/60 border border-white/5 p-3 rounded-2xl mb-3">
                <Text className="text-muted text-xs text-center font-medium">
                  {t("stats.brandNewUserMsg")}
                </Text>
              </View>
            )}

            {/* Full-size Year Dots SVG */}
            <View className="bg-surface border border-white/5 rounded-3xl p-3 my-2">
              <YearDots
                year={selectedYear}
                dots={dots}
                summary={summary}
                mode={mode}
                layout={layout}
                selectedDate={selectedCell?.date ?? null}
                onSelectDate={handleSelectDate}
              />
            </View>

            {/* Legend & Summary Chips */}
            <View className="mt-2">
              <YearSummaryChips summary={summary} mode={mode} />
            </View>
          </ScrollView>
        )}
      </View>

      {/* Date Detail Sheet */}
      <DayDetailSheet
        cell={selectedCell}
        onClose={() => setSelectedCell(null)}
      />
    </SafeAreaView>
  );
}
