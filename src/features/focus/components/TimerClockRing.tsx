import React from "react";
import { View, useWindowDimensions } from "react-native";
import { ProgressRing, Text } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { useAccent } from "@/lib/theme/store";
import type { FocusMode } from "../timer";

export interface TimerClockRingProps {
  mode: FocusMode;
  clock: string;
  progress: number;
  cycleCount: number;
  cycleTotal: number;
}

const MODE_LABELS: Record<FocusMode, string> = {
  focus: "FOCUS",
  short_break: "SHORT BREAK",
  long_break: "LONG BREAK",
};

export function TimerClockRing({
  mode,
  clock,
  progress,
  cycleCount,
  cycleTotal,
}: TimerClockRingProps) {
  const { width } = useWindowDimensions();
  const { accent } = useAccent();
  const ringSize = Math.min(260, Math.max(210, width - 80));

  const color =
    mode === "focus"
      ? accent.hex
      : mode === "short_break"
      ? THEME_COLORS.mint
      : THEME_COLORS.sky;

  return (
    <View className="items-center justify-center my-3">
      <ProgressRing
        size={ringSize}
        strokeWidth={10}
        progress={progress}
        color={color}
        backgroundColor="rgba(255, 255, 255, 0.06)"
      >
        <View className="items-center justify-center">
          <Text
            variant="display"
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-text-primary text-center font-sans"
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {clock}
          </Text>
          <Text
            variant="label"
            className="text-[11px] tracking-widest mt-1 text-center font-bold"
            style={{ color }}
          >
            {MODE_LABELS[mode]}
          </Text>
        </View>
      </ProgressRing>
    </View>
  );
}
