import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useReducedMotion,
  cancelAnimation,
} from "react-native-reanimated";
import { Text } from "@/components/ui";
import { useAccent } from "@/lib/theme";
import { useT } from "@/core/i18n";
import type { FocusMode } from "../timer";

export interface SessionCycleIndicatorProps {
  mode: FocusMode;
  completedCount: number;
  total: number;
  isRunning: boolean;
}

export function SessionCycleIndicator({
  mode,
  completedCount,
  total,
  isRunning,
}: SessionCycleIndicatorProps) {
  const { t } = useT();
  const { accent } = useAccent();
  const shouldReduceMotion = useReducedMotion();
  const pulseOpacity = useSharedValue(1);

  // Normalize completed within current cycle (0 to total - 1)
  const currentCycleCompleted = total > 0 ? completedCount % total : 0;
  const currentSessionNumber = Math.min(total, currentCycleCompleted + 1);

  useEffect(() => {
    if (isRunning && mode === "focus" && !shouldReduceMotion) {
      pulseOpacity.value = withRepeat(
        withTiming(0.4, { duration: 900 }),
        -1,
        true
      );
    } else {
      cancelAnimation(pulseOpacity);
      pulseOpacity.value = 1;
    }
    return () => {
      cancelAnimation(pulseOpacity);
    };
  }, [isRunning, mode, shouldReduceMotion]);

  const animatedCurrentStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  // Caption text
  let caption = "";
  if (mode === "focus") {
    caption = t("focus.sessionCycle", {
      current: currentSessionNumber,
      total,
    });
  } else if (mode === "short_break") {
    caption = t("focus.shortBreakNext", {
      next: currentSessionNumber,
      total,
    });
  } else {
    caption = t("focus.longBreakComplete");
  }

  return (
    <View
      className="items-center justify-center my-2 gap-1.5"
      accessibilityRole="text"
      accessibilityLabel={caption}
    >
      <Text
        variant="caption"
        className="text-xs font-semibold text-text-secondary tracking-tight"
      >
        {caption}
      </Text>

      {/* Segments Row */}
      <View className="flex-row items-center gap-1.5">
        {Array.from({ length: total }).map((_, idx) => {
          const isCompleted =
            mode === "long_break" || idx < currentCycleCompleted;
          const isCurrent =
            mode === "focus" && idx === currentCycleCompleted;

          if (isCompleted) {
            return (
              <View
                key={idx}
                style={{ backgroundColor: accent.hex }}
                className="w-7 h-1.5 rounded-full"
              />
            );
          }

          if (isCurrent) {
            return (
              <Animated.View
                key={idx}
                style={[
                  {
                    borderColor: accent.hex,
                    borderWidth: 1.5,
                    backgroundColor: accent.softBackground,
                  },
                  animatedCurrentStyle,
                ]}
                className="w-7 h-1.5 rounded-full"
              />
            );
          }

          // Upcoming segment
          return (
            <View
              key={idx}
              className="w-7 h-1.5 rounded-full bg-surface border border-white/5"
            />
          );
        })}
      </View>
    </View>
  );
}
