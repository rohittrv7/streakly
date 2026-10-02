import React, { useEffect } from "react";
import { Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  useReducedMotion,
} from "react-native-reanimated";
import { Haptics } from "@/core/utils/haptics";
import { THEME_COLORS } from "@/lib/theme";

export interface ToggleProps {
  value: boolean;
  onValueChange: (newValue: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export function Toggle({
  value,
  onValueChange,
  disabled = false,
  accessibilityLabel,
}: ToggleProps) {
  const shouldReduceMotion = useReducedMotion();
  const offset = useSharedValue(value ? 20 : 0);

  useEffect(() => {
    if (shouldReduceMotion) {
      offset.value = value ? 20 : 0;
    } else {
      offset.value = withTiming(value ? 20 : 0, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [value, shouldReduceMotion, offset]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  const handlePress = () => {
    if (disabled) return;
    Haptics.selectionAsync();
    onValueChange(!value);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel}
      className={`w-12 h-7 rounded-full p-1 justify-center ${
        value ? "bg-accent" : "bg-elevated border border-white/10"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <Animated.View
        style={[
          thumbStyle,
          {
            backgroundColor: value ? THEME_COLORS.background : THEME_COLORS.text.secondary,
          },
        ]}
        className="w-5 h-5 rounded-full shadow-sm"
      />
    </Pressable>
  );
}
