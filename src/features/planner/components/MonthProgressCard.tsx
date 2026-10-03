import React from "react";
import { View } from "react-native";
import { Card, Text, AnimatedNumber } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { useT } from "@/core/i18n";

export interface MonthProgressCardProps {
  done: number;
  total: number;
  missed: number;
  ratio: number;
}

export function MonthProgressCard({
  done,
  total,
  missed,
  ratio,
}: MonthProgressCardProps) {
  const { t } = useT();
  const percentage = Math.round(ratio * 100);

  return (
    <Card variant="surface" className="p-4 mb-4 border border-border">
      <View className="flex-row items-center justify-between mb-2">
        <Text variant="label" className="text-text-secondary">
          {t("planner.monthlyTarget").toUpperCase()}
        </Text>
        <Text variant="caption" className="font-extrabold text-text-primary">
          {percentage}%
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="w-full h-2.5 bg-elevated rounded-pill overflow-hidden border border-border mb-3">
        <View
          style={{
            width: `${Math.min(100, Math.max(0, percentage))}%`,
            backgroundColor: THEME_COLORS.primary,
          }}
          className="h-full rounded-pill"
        />
      </View>

      {/* Stats summary row */}
      <View className="flex-row items-center justify-between pt-1">
        <View className="flex-row items-baseline gap-1.5">
          <AnimatedNumber value={done} className="text-lg font-extrabold text-text-primary" />
          <Text variant="caption" className="text-text-secondary">
            / {total} {t("planner.done").toLowerCase()}
          </Text>
        </View>

        {missed > 0 && (
          <View className="flex-row items-center gap-1 bg-coral/15 px-2 py-0.5 rounded-pill border border-coral/30">
            <Text className="text-[11px] font-bold text-coral">
              {missed} {t("planner.missed").toLowerCase()}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}
