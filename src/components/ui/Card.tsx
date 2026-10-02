import React from "react";
import { View, Pressable, type ViewProps, type PressableProps } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
} from "react-native-reanimated";
import { cn } from "@/core/utils/cn";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type CardVariant = "surface" | "elevated";

export interface CardProps extends ViewProps {
  variant?: CardVariant;
  className?: string;
  pressable?: boolean;
  onPress?: PressableProps["onPress"];
  onLongPress?: PressableProps["onLongPress"];
  children?: React.ReactNode;
}

const VARIANT_MAP: Record<CardVariant, string> = {
  surface: "bg-surface border border-border rounded-card p-5",
  elevated: "bg-elevated border border-border rounded-card p-5",
};

export function Card({
  variant = "surface",
  className,
  pressable = false,
  onPress,
  onLongPress,
  children,
  style,
  ...props
}: CardProps) {
  const scale = useSharedValue(1);
  const shouldReduceMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (shouldReduceMotion) return;
    scale.value = withSpring(0.97, { damping: 15, stiffness: 250 });
  };

  const handlePressOut = () => {
    if (shouldReduceMotion) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 250 });
  };

  if (pressable) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[animatedStyle, style]}
        className={cn(VARIANT_MAP[variant], className)}
        accessibilityRole="button"
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View className={cn(VARIANT_MAP[variant], className)} style={style} {...props}>
      {children}
    </View>
  );
}
