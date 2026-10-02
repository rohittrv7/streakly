import React from "react";
import { View, Text } from "react-native";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { formatDelta } from "../format";

export interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  subtext?: string;
  delta?: number | null;
  className?: string;
}

export function StatCard({
  label,
  value,
  suffix = "",
  subtext,
  delta,
  className,
}: StatCardProps) {
  const deltaInfo = delta !== undefined ? formatDelta(delta) : null;

  return (
    <View
      className={`bg-surface border border-white/5 rounded-2xl p-4 flex-1 justify-between ${
        className || ""
      }`}
    >
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-muted text-xs font-medium uppercase tracking-wider">
          {label}
        </Text>
        {deltaInfo && deltaInfo.text !== "--" && (
          <View
            className={`px-2 py-0.5 rounded-full ${
              deltaInfo.direction === "up"
                ? "bg-lime/10"
                : deltaInfo.direction === "down"
                ? "bg-coral/10"
                : "bg-white/5"
            }`}
          >
            <Text
              className={`text-[10px] font-bold ${
                deltaInfo.direction === "up"
                  ? "text-lime"
                  : deltaInfo.direction === "down"
                  ? "text-coral"
                  : "text-muted"
              }`}
            >
              {deltaInfo.text}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row items-baseline gap-1 mt-1">
        <AnimatedNumber
          value={value}
          className="text-3xl font-extrabold text-text-primary font-sans"
        />
        {suffix ? (
          <Text className="text-muted text-sm font-semibold">{suffix}</Text>
        ) : null}
      </View>

      {subtext ? (
        <Text
          numberOfLines={1}
          className="text-xs text-text-secondary mt-1 font-medium"
        >
          {subtext}
        </Text>
      ) : null}
    </View>
  );
}
