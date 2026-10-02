import React, { useEffect } from "react";
import type { ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useReducedMotion,
} from "react-native-reanimated";
import { cn } from "@/core/utils/cn";

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
  style?: ViewStyle;
}

export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = 12,
  className,
  style,
}: SkeletonProps) {
  const opacity = useSharedValue(0.4);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      opacity.value = 0.5;
    } else {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 750 }),
          withTiming(0.35, { duration: 750 })
        ),
        -1,
        true
      );
    }
  }, [shouldReduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const customStyle: ViewStyle = {
    width: width as any,
    height: height as any,
    borderRadius,
    ...style,
  };

  return (
    <Animated.View
      style={[customStyle, animatedStyle]}
      className={cn("bg-elevated", className)}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading content"
    />
  );
}
