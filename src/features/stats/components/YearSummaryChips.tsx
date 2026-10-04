import React from "react";
import { View, Text } from "react-native";
import { useT } from "@/core/i18n";
import { useAccent, THEME_COLORS } from "@/lib/theme";
import type { YearMode, YearSummary } from "../year";

interface YearSummaryChipsProps {
  summary: YearSummary;
  mode: YearMode;
}

export function YearSummaryChips({ summary, mode }: YearSummaryChipsProps) {
  const { t } = useT();
  const { accent } = useAccent();

  return (
    <View className="gap-4 w-full">
      {/* Legend */}
      <View className="flex-row items-center justify-between px-1">
        {mode === "activity" ? (
          <View className="flex-row items-center gap-1.5">
            <Text className="text-muted text-xs">{t("stats.legendLess")}</Text>
            <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accent.hex, opacity: 0.2 }} />
            <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accent.hex, opacity: 0.5 }} />
            <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accent.hex, opacity: 0.8 }} />
            <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accent.hex, opacity: 1.0 }} />
            <Text className="text-muted text-xs">{t("stats.legendMore")}</Text>
          </View>
        ) : (
          <View className="flex-row items-center gap-2">
            <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accent.hex }} />
            <Text className="text-muted text-xs">{t("stats.modeTime")}</Text>
          </View>
        )}

        {/* Not yet legend */}
        <View className="flex-row items-center gap-1.5">
          <View
            className="w-2.5 h-2.5 rounded-full border"
            style={{ borderColor: THEME_COLORS.border }}
          />
          <Text className="text-muted text-xs">{t("stats.legendNotYet")}</Text>
        </View>
      </View>

      {/* Summary Chips */}
      <View className="flex-row gap-3 w-full">
        {/* Active Days */}
        <View className="flex-1 bg-surface border border-white/5 rounded-2xl p-3 items-center">
          <Text className="text-muted text-[11px] font-semibold uppercase tracking-wider mb-1">
            {t("stats.activeDays")}
          </Text>
          <Text className="text-text-primary text-xl font-bold">
            {summary.activeDays}
          </Text>
        </View>

        {/* Perfect Days */}
        <View className="flex-1 bg-surface border border-white/5 rounded-2xl p-3 items-center">
          <Text className="text-muted text-[11px] font-semibold uppercase tracking-wider mb-1">
            {t("stats.perfectDays")}
          </Text>
          <Text className="text-lime text-xl font-bold">
            {summary.perfectDays}
          </Text>
        </View>

        {/* Days Left */}
        <View className="flex-1 bg-surface border border-white/5 rounded-2xl p-3 items-center">
          <Text className="text-muted text-[11px] font-semibold uppercase tracking-wider mb-1">
            {t("stats.daysLeft")}
          </Text>
          <Text className="text-text-primary text-xl font-bold">
            {summary.daysLeft}
          </Text>
        </View>
      </View>
    </View>
  );
}
