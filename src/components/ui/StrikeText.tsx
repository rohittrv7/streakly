import React, { useState, useEffect, useRef } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useReducedMotion,
} from "react-native-reanimated";
import { Text, type TextVariant } from "./Text";
import { cn } from "@/core/utils/cn";
import { useAccent } from "@/lib/theme/store";

export interface StrikeTextProps {
  children: string;
  struck?: boolean;
  lineColor?: string;
  variant?: TextVariant;
  className?: string;
  numberOfLines?: number;
  duration?: number;
}

export function StrikeText({
  children,
  struck = false,
  lineColor,
  variant = "body",
  className,
  numberOfLines = 1,
  duration = 250,
}: StrikeTextProps) {
  const [textWidth, setTextWidth] = useState(0);
  const isReducedMotion = useReducedMotion();
  const isFirstRender = useRef(true);
  const { accent } = useAccent();
  const effectiveLineColor = lineColor || accent.hex;

  const progress = useSharedValue(struck ? 1 : 0);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      progress.value = struck ? 1 : 0;
      return;
    }
    if (isReducedMotion) {
      progress.value = struck ? 1 : 0;
    } else {
      progress.value = withTiming(struck ? 1 : 0, { duration });
    }
  }, [struck, isReducedMotion, duration, progress]);

  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0 && Math.abs(width - textWidth) > 1) {
      setTextWidth(width);
    }
  };

  const lineAnimatedStyle = useAnimatedStyle(() => ({
    width: textWidth * progress.value,
  }));

  return (
    <View className="self-start relative justify-center">
      <Text
        variant={variant}
        numberOfLines={numberOfLines}
        onLayout={onLayout}
        className={cn(
          struck ? "text-text-muted" : "text-text-primary",
          className
        )}
      >
        {children}
      </Text>
      {textWidth > 0 && (
        <Animated.View
          style={[
            {
              position: "absolute",
              left: 0,
              top: "50%",
              height: 2,
              backgroundColor: effectiveLineColor,
              borderRadius: 1,
              marginTop: -1,
            },
            lineAnimatedStyle,
          ]}
          pointerEvents="none"
        />
      )}
    </View>
  );
}
