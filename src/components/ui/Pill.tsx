import React from "react";
import { View, Text, Pressable, type PressableProps } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
} from "react-native-reanimated";
import { Haptics } from "@/core/utils/haptics";
import { cn } from "@/core/utils/cn";
import { useAccent } from "@/lib/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PillProps extends Omit<PressableProps, "children"> {
  label: string;
  selected?: boolean;
  colorDot?: string;
  icon?: React.ReactNode;
  className?: string;
  labelClassName?: string;
}

export function Pill({
  label,
  selected = false,
  colorDot,
  icon,
  className,
  labelClassName,
  onPress,
  ...props
}: PillProps) {
  const scale = useSharedValue(1);
  const shouldReduceMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!shouldReduceMotion) {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 250 });
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const handlePressOut = () => {
    if (!shouldReduceMotion) {
      scale.value = withSpring(1, { damping: 15, stiffness: 250 });
    }
  };

  const accent = useAccent();

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      accessibilityRole="checkbox"
      accessibilityState={{ selected }}
      className={cn(
        "flex-row items-center justify-center px-3.5 py-2 rounded-pill min-h-[36px] gap-1.5 border",
        selected
          ? "bg-primary border-primary"
          : "bg-elevated border-border",
        className
      )}
      {...props}
    >
      {colorDot && (
        <View
          style={{
            backgroundColor: colorDot,
            borderWidth: selected ? 1.5 : 0,
            borderColor: selected ? accent.onAccentHex : "transparent",
          }}
          className="w-2.5 h-2.5 rounded-full"
        />
      )}
      {icon}
      <Text
        className={cn(
          "text-xs font-bold leading-none",
          selected ? "text-background" : "text-text-primary",
          labelClassName
        )}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}
