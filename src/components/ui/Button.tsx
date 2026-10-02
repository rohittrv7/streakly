import React from "react";
import {
  Pressable,
  Text,
  ActivityIndicator,
  type PressableProps,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
} from "react-native-reanimated";
import { Haptics } from "@/core/utils/haptics";
import { cn } from "@/core/utils/cn";
import { THEME_COLORS } from "@/lib/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonVariant = "primary" | "secondary" | "ghost" | "icon-only";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  title?: string;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  textClassName?: string;
  haptics?: boolean;
}

const VARIANT_CONTAINER: Record<ButtonVariant, string> = {
  primary: "bg-primary rounded-pill flex-row items-center justify-center",
  secondary:
    "bg-elevated border border-border rounded-pill flex-row items-center justify-center",
  ghost:
    "bg-transparent rounded-pill flex-row items-center justify-center",
  "icon-only":
    "bg-elevated border border-border rounded-full items-center justify-center",
};

const SIZE_CONTAINER: Record<ButtonSize, string> = {
  sm: "min-h-[44px] h-[44px] px-3.5 gap-1.5",
  md: "min-h-[48px] h-[48px] px-5 gap-2",
  lg: "min-h-[56px] h-[56px] px-7 gap-2.5",
};

const ICON_ONLY_SIZE: Record<ButtonSize, string> = {
  sm: "w-[44px] h-[44px] p-2",
  md: "w-[48px] h-[48px] p-3",
  lg: "w-[56px] h-[56px] p-3.5",
};

const VARIANT_TEXT: Record<ButtonVariant, string> = {
  primary: "text-background font-bold text-sm",
  secondary: "text-text-primary font-bold text-sm",
  ghost: "text-text-secondary font-semibold text-sm",
  "icon-only": "text-text-primary font-bold text-xs",
};

const SIZE_TEXT: Record<ButtonSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base font-bold",
};

export function Button({
  variant = "primary",
  size = "md",
  title,
  loading = false,
  disabled = false,
  icon,
  children,
  className,
  textClassName,
  haptics = true,
  onPress,
  ...props
}: ButtonProps) {
  const scale = useSharedValue(1);
  const shouldReduceMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (disabled || loading) return;
    if (haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (!shouldReduceMotion) {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 250 });
    }
  };

  const handlePressOut = () => {
    if (disabled || loading || shouldReduceMotion) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 250 });
  };

  const isIconOnly = variant === "icon-only";
  const sizeClasses = isIconOnly ? ICON_ONLY_SIZE[size] : SIZE_CONTAINER[size];

  const spinnerColor =
    variant === "primary" ? THEME_COLORS.background : THEME_COLORS.primary;

  return (
    <AnimatedPressable
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={animatedStyle}
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled || loading) }}
      className={cn(
        VARIANT_CONTAINER[variant],
        sizeClasses,
        (disabled || loading) && "opacity-50",
        className
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <>
          {icon}
          {title ? (
            <Text
              className={cn(
                VARIANT_TEXT[variant],
                SIZE_TEXT[size],
                textClassName
              )}
            >
              {title}
            </Text>
          ) : (
            children
          )}
        </>
      )}
    </AnimatedPressable>
  );
}
