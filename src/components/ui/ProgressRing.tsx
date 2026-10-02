import React, { useEffect } from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  useReducedMotion,
} from "react-native-reanimated";
import { useAccent } from "@/lib/theme/store";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
  duration?: number;
}

export function calculateCircumference(radius: number): number {
  return 2 * Math.PI * radius;
}

export function calculateDashOffset(
  progress: number,
  circumference: number
): number {
  const clamped = Math.min(1, Math.max(0, progress));
  return circumference * (1 - clamped);
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 7,
  color,
  backgroundColor = "rgba(255, 255, 255, 0.08)",
  children,
  duration = 600,
}: ProgressRingProps) {
  const { accent } = useAccent();
  const ringColor = color || accent.hex;

  const radius = (size - strokeWidth) / 2;
  const circumference = calculateCircumference(radius);
  const animatedProgress = useSharedValue(calculateDashOffset(progress, circumference));
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const targetOffset = calculateDashOffset(progress, circumference);
    if (shouldReduceMotion) {
      animatedProgress.value = targetOffset;
    } else {
      animatedProgress.value = withTiming(targetOffset, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [progress, circumference, duration, shouldReduceMotion]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: animatedProgress.value,
  }));

  return (
    <View
      style={{ width: size, height: size }}
      className="items-center justify-center relative"
    >
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        {/* Background track circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          fill="transparent"
        />
      </Svg>

      {children && (
        <View className="absolute inset-0 items-center justify-center">
          {children}
        </View>
      )}
    </View>
  );
}
