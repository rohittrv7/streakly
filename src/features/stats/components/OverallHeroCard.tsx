import React from "react";
import { View, Text } from "react-native";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { THEME_COLORS } from "@/lib/theme";
import { formatDelta } from "../format";
import type { OverallCompletion, StatsRange } from "../types";

interface OverallHeroCardProps {
  overall: OverallCompletion;
  delta: number | null;
  range: StatsRange;
}

export function OverallHeroCard({
  overall,
  delta,
  range,
}: OverallHeroCardProps) {
  const deltaInfo = formatDelta(delta);
  const rangeLabel = range === "7d" ? "last 7 days" : range === "30d" ? "last 30 days" : "last 90 days";

  return (
    <View className="bg-surface border border-white/5 rounded-3xl p-5 flex-row items-center justify-between">
      {/* Left Details */}
      <View className="flex-1 mr-4">
        <Text className="text-muted text-xs font-semibold uppercase tracking-wider mb-1">
          Overall Completion
        </Text>

        <View className="flex-row items-baseline gap-1 my-1">
          <AnimatedNumber
            value={overall.percent}
            className="text-4xl font-extrabold text-text-primary font-sans"
          />
          <Text className="text-accent text-2xl font-bold">%</Text>
        </View>

        <Text className="text-text-secondary text-sm font-medium mb-2">
          {overall.done} of {overall.scheduled} completed
        </Text>

        {deltaInfo.text !== "--" ? (
          <View className="flex-row items-center gap-1.5">
            <View
              className={`px-2 py-0.5 rounded-full ${
                deltaInfo.direction === "up"
                  ? "bg-accent/10"
                  : deltaInfo.direction === "down"
                  ? "bg-coral/10"
                  : "bg-white/5"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  deltaInfo.direction === "up"
                    ? "text-accent"
                    : deltaInfo.direction === "down"
                    ? "text-coral"
                    : "text-muted"
                }`}
              >
                {deltaInfo.text}
              </Text>
            </View>
            <Text className="text-muted text-xs">vs {rangeLabel}</Text>
          </View>
        ) : (
          <Text className="text-muted text-xs">First period tracked</Text>
        )}
      </View>

      {/* Right Progress Ring */}
      <View className="items-center justify-center">
        <ProgressRing
          progress={overall.percent / 100}
          size={88}
          strokeWidth={8}
          color={THEME_COLORS.lime}
        >
          <Text className="text-text-primary text-base font-extrabold">
            {overall.percent}%
          </Text>
        </ProgressRing>
      </View>
    </View>
  );
}
