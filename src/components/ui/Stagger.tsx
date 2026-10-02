import React, { useEffect } from "react";
import type { ViewProps } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
  useReducedMotion,
} from "react-native-reanimated";

export interface StaggerItemProps extends ViewProps {
  index: number;
  delayPerItem?: number;
  initialY?: number;
  duration?: number;
  children: React.ReactNode;
}

export function StaggerItem({
  index,
  delayPerItem = 60,
  initialY = 16,
  duration = 350,
  children,
  style,
  ...props
}: StaggerItemProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(initialY);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }

    const delay = index * delayPerItem;
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration, easing: Easing.out(Easing.cubic) })
    );
  }, [index, delayPerItem, initialY, duration, shouldReduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
}

export interface FadeInListProps extends ViewProps {
  children: React.ReactNode;
  staggerDelay?: number;
  delay?: number;
}

export function FadeInList({
  children,
  staggerDelay = 60,
  delay,
  ...props
}: FadeInListProps) {
  const stepDelay = delay ?? staggerDelay;
  const childArray = React.Children.toArray(children);

  return (
    <Animated.View {...props}>
      {childArray.map((child, idx) => (
        <StaggerItem key={idx} index={idx} delayPerItem={stepDelay}>
          {child}
        </StaggerItem>
      ))}
    </Animated.View>
  );
}

export const Stagger = FadeInList;
export type StaggerProps = FadeInListProps;
