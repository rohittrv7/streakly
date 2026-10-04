import React from "react";
import { View, Text, Pressable } from "react-native";
import { useT } from "@/core/i18n";
import { useAccent, THEME_COLORS } from "@/lib/theme";
import type { YearMode, YearLayout } from "../year";

interface YearControlsProps {
  mode: YearMode;
  layout: YearLayout;
  onChangeMode: (mode: YearMode) => void;
  onChangeLayout: (layout: YearLayout) => void;
}

export function YearControls({
  mode,
  layout,
  onChangeMode,
  onChangeLayout,
}: YearControlsProps) {
  const { t } = useT();
  const { accent } = useAccent();

  return (
    <View className="flex-row gap-3 w-full">
      {/* Mode Segmented Control: Time | Activity */}
      <View className="flex-1 flex-row bg-surface p-1 rounded-2xl border border-white/5">
        <Pressable
          onPress={() => onChangeMode("time")}
          className="flex-1 min-h-[44px] items-center justify-center rounded-xl transition-all"
          style={{
            backgroundColor: mode === "time" ? accent.hex : "transparent",
          }}
          accessibilityRole="button"
          accessibilityState={{ selected: mode === "time" }}
        >
          <Text
            className="text-xs font-bold"
            style={{
              color: mode === "time" ? THEME_COLORS.background : THEME_COLORS.muted,
            }}
          >
            {t("stats.modeTime")}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onChangeMode("activity")}
          className="flex-1 min-h-[44px] items-center justify-center rounded-xl transition-all"
          style={{
            backgroundColor: mode === "activity" ? accent.hex : "transparent",
          }}
          accessibilityRole="button"
          accessibilityState={{ selected: mode === "activity" }}
        >
          <Text
            className="text-xs font-bold"
            style={{
              color: mode === "activity" ? THEME_COLORS.background : THEME_COLORS.muted,
            }}
          >
            {t("stats.modeActivity")}
          </Text>
        </Pressable>
      </View>

      {/* Layout Segmented Control: Grid | Months */}
      <View className="flex-1 flex-row bg-surface p-1 rounded-2xl border border-white/5">
        <Pressable
          onPress={() => onChangeLayout("grid")}
          className="flex-1 min-h-[44px] items-center justify-center rounded-xl transition-all"
          style={{
            backgroundColor: layout === "grid" ? accent.hex : "transparent",
          }}
          accessibilityRole="button"
          accessibilityState={{ selected: layout === "grid" }}
        >
          <Text
            className="text-xs font-bold"
            style={{
              color: layout === "grid" ? THEME_COLORS.background : THEME_COLORS.muted,
            }}
          >
            {t("stats.layoutGrid")}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onChangeLayout("months")}
          className="flex-1 min-h-[44px] items-center justify-center rounded-xl transition-all"
          style={{
            backgroundColor: layout === "months" ? accent.hex : "transparent",
          }}
          accessibilityRole="button"
          accessibilityState={{ selected: layout === "months" }}
        >
          <Text
            className="text-xs font-bold"
            style={{
              color: layout === "months" ? THEME_COLORS.background : THEME_COLORS.muted,
            }}
          >
            {t("stats.layoutMonths")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
