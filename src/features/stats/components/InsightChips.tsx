import React from "react";
import { View, Text } from "react-native";
import { Trophy, Lightning, Target } from "phosphor-react-native";
import { THEME_COLORS } from "@/lib/theme";
import type { StatInsight } from "../types";

interface InsightChipsProps {
  insights: StatInsight[];
}

export function InsightChips({ insights }: InsightChipsProps) {
  if (insights.length === 0) return null;

  return (
    <View className="w-full">
      <Text className="text-muted text-xs font-semibold uppercase tracking-wider mb-3">
        Insights & Patterns
      </Text>
      <View className="gap-2.5">
        {insights.map((item, idx) => {
          let Icon = Lightning;
          let iconColor: string = THEME_COLORS.lime;
          if (item.type === "best_weekday") {
            Icon = Trophy;
            iconColor = THEME_COLORS.coral;
          } else if (item.type === "top_focus_category") {
            Icon = Target;
            iconColor = THEME_COLORS.sky;
          }

          return (
            <View
              key={`${item.type}_${idx}`}
              className="bg-surface border border-white/5 rounded-2xl p-3.5 flex-row items-center gap-3.5"
            >
              <View
                style={{ backgroundColor: `${iconColor}15` }}
                className="w-10 h-10 rounded-xl items-center justify-center shrink-0"
              >
                <Icon size={20} color={iconColor} weight="fill" />
              </View>
              <View className="flex-1">
                <Text className="text-text-primary text-sm font-semibold mb-0.5">
                  {item.title}
                </Text>
                <Text className="text-muted text-xs leading-4">
                  {item.description}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
