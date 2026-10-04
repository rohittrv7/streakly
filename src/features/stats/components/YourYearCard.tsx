import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useAccent, THEME_COLORS } from "@/lib/theme";
import { useT } from "@/core/i18n";
import { useYearData } from "../hooks-year";
import { useSettingsStore } from "@/features/settings/store";
import { YearDots } from "./YearDots";

export function YourYearCard() {
  const router = useRouter();
  const { t } = useT();
  const { accent } = useAccent();
  const currentYear = new Date().getFullYear();
  const { dots, summary, loading } = useYearData(currentYear);
  const yearMode = useSettingsStore((s) => s.yearDotsMode);

  if (loading && dots.length === 0) {
    return (
      <View className="bg-surface border border-white/5 rounded-2xl p-4 animate-pulse">
        <View className="h-4 w-28 bg-elevated rounded mb-3" />
        <View className="h-28 w-full bg-elevated rounded mb-3" />
        <View className="h-4 w-40 bg-elevated rounded" />
      </View>
    );
  }

  const caption = `${t("stats.dayOfYear", { day: summary.dayOfYear })} ${t("stats.ofYearPct", {
    total: summary.totalDays,
    percent: summary.percentPassed,
  })} • ${summary.daysLeft} ${t("stats.daysLeft").toLowerCase()}`;

  return (
    <View className="bg-surface border border-white/5 rounded-2xl p-4 gap-3">
      {/* Header with Title and Open Button */}
      <View className="flex-row items-center justify-between">
        <Text className="text-muted text-xs font-semibold uppercase tracking-wider">
          {t("stats.yourYear")}
        </Text>
        <Pressable
          onPress={() => router.push("/year")}
          hitSlop={8}
          className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-elevated border border-border items-center justify-center active:opacity-70"
          accessibilityRole="button"
          accessibilityLabel={`${t("stats.openYear")} ${t("stats.yourYear")}`}
        >
          <Text className="text-text-primary text-xs font-bold">
            {t("stats.openYear")} →
          </Text>
        </Pressable>
      </View>

      {/* Compact Grid */}
      <View className="py-1">
        <YearDots
          year={currentYear}
          dots={dots}
          summary={summary}
          mode={yearMode}
          layout="grid"
          selectedDate={null}
          onSelectDate={() => router.push("/year")}
        />
      </View>

      {/* Progress Bar */}
      <View className="w-full h-1.5 bg-elevated rounded-full overflow-hidden">
        <View
          style={{
            width: `${Math.min(100, Math.max(0, summary.percentPassed))}%`,
            backgroundColor: accent.hex,
          }}
          className="h-full rounded-full"
        />
      </View>

      {/* Caption */}
      <Text className="text-muted text-xs font-medium">{caption}</Text>
    </View>
  );
}
