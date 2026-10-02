import React, { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  useReducedMotion,
} from "react-native-reanimated";
import { Haptics } from "@/core/utils/haptics";
import { Check } from "phosphor-react-native";
import { cn } from "@/core/utils/cn";

import { THEME_COLORS } from "@/lib/theme";

export type CheckboxColor = "lime" | "coral" | "sky" | "mint";

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  color?: CheckboxColor;
  disabled?: boolean;
  size?: number;
  accessibilityLabel?: string;
  className?: string;
}

export const CHECKBOX_COLORS: Record<CheckboxColor, string> = {
  lime: THEME_COLORS.lime,
  coral: THEME_COLORS.coral,
  sky: THEME_COLORS.sky,
  mint: THEME_COLORS.mint,
};

export function Checkbox({
  checked,
  onCheckedChange,
  color = "lime",
  disabled = false,
  size = 24,
  accessibilityLabel = "Checkbox",
  className,
}: CheckboxProps) {
  const progress = useSharedValue(checked ? 1 : 0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      progress.value = checked ? 1 : 0;
    } else {
      progress.value = withSpring(checked ? 1 : 0, {
        damping: 14,
        stiffness: 220,
      });
    }
  }, [checked, shouldReduceMotion]);

  const animatedCircleStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 0.5, 1], [1, 0.85, 1]);
    return {
      transform: [{ scale }],
    };
  });

  const animatedCheckStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [{ scale: progress.value }],
    };
  });

  const handlePress = () => {
    if (disabled) return;
    const next = !checked;
    if (next) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onCheckedChange?.(next);
  };

  const activeColor = CHECKBOX_COLORS[color];

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      hitSlop={10}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={accessibilityLabel}
      className={cn("items-center justify-center p-1 min-w-[44px] min-h-[44px]", className)}
    >
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: checked ? activeColor : THEME_COLORS.elevated,
            borderColor: checked ? activeColor : THEME_COLORS.border,
            borderWidth: 1.5,
          },
          animatedCircleStyle,
        ]}
        className="items-center justify-center"
      >
        <Animated.View style={animatedCheckStyle}>
          <Check
            size={Math.round(size * 0.65)}
            color={THEME_COLORS.background}
            weight="bold"
          />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
