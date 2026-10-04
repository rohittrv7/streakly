import React, { useState, useMemo, useRef, useEffect } from "react";
import { View, type LayoutChangeEvent, type GestureResponderEvent } from "react-native";
import Svg from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  useReducedMotion,
} from "react-native-reanimated";
import { useAccent } from "@/lib/theme";
import type { YearDot, YearMode, YearLayout, YearSummary } from "../year";
import {
  calculateGridDimensions,
  calculateMonthsLayout,
  pointToDotIndex,
  pointToMonthBlockDot,
} from "../year-layout";
import { getMonthGrid } from "@/features/planner/calendar";
import { YearDotsGridSvg } from "./YearDotsGridSvg";
import { YearDotsMonthsSvg } from "./YearDotsMonthsSvg";

interface YearDotsProps {
  year: number;
  dots: YearDot[];
  summary: YearSummary;
  mode: YearMode;
  layout: YearLayout;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

export function YearDots({
  year,
  dots,
  summary,
  mode,
  layout,
  selectedDate,
  onSelectDate,
}: YearDotsProps) {
  const [containerWidth, setContainerWidth] = useState(360);
  const { accent } = useAccent();
  const shouldReduceMotion = useReducedMotion();

  const entrance = useSharedValue(shouldReduceMotion ? 1 : 0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (shouldReduceMotion) {
      entrance.value = 1;
    } else {
      entrance.value = 0;
      entrance.value = withTiming(1, {
        duration: 900,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [year, shouldReduceMotion, entrance]);

  useEffect(() => {
    if (shouldReduceMotion) {
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1000 }),
        withTiming(1.0, { duration: 1000 })
      ),
      -1,
      true
    );
  }, [shouldReduceMotion, pulse]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: entrance.value,
      transform: [{ scale: 0.95 + 0.05 * entrance.value }],
    };
  });

  const gridLayout = useMemo(() => {
    return calculateGridDimensions(containerWidth, dots.length);
  }, [containerWidth, dots.length]);

  const monthsLayout = useMemo(() => {
    return calculateMonthsLayout(containerWidth);
  }, [containerWidth]);

  const monthGrids = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => getMonthGrid(year, i + 1));
  }, [year]);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: GestureResponderEvent) => {
    touchStartRef.current = {
      x: e.nativeEvent.locationX,
      y: e.nativeEvent.locationY,
    };
  };

  const onTouchEnd = (e: GestureResponderEvent) => {
    if (!touchStartRef.current) return;
    const dx = Math.abs(e.nativeEvent.locationX - touchStartRef.current.x);
    const dy = Math.abs(e.nativeEvent.locationY - touchStartRef.current.y);

    // Scroll-safe tolerance: ignore moves > 8px
    if (dx < 8 && dy < 8) {
      const { locationX, locationY } = e.nativeEvent;
      if (layout === "grid") {
        const dotIdx = pointToDotIndex({
          x: locationX,
          y: locationY,
          containerWidth,
          totalDots: dots.length,
          columns: gridLayout.columns,
        });
        if (dotIdx >= 0 && dotIdx < dots.length) {
          onSelectDate(dots[dotIdx].date);
        }
      } else {
        const date = pointToMonthBlockDot(
          locationX,
          locationY,
          monthsLayout.blocks,
          monthGrids
        );
        if (date) {
          onSelectDate(date);
        }
      }
    }
    touchStartRef.current = null;
  };

  const svgHeight = layout === "grid" ? gridLayout.height : monthsLayout.totalHeight;

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0) setContainerWidth(w);
      }}
      className="w-full"
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Day ${summary.dayOfYear} of ${summary.totalDays}, ${summary.percentPassed} percent of the year passed`}
    >
      <Animated.View
        style={animatedStyle}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <Svg width={containerWidth} height={svgHeight}>
          {layout === "grid" ? (
            <YearDotsGridSvg
              dots={dots}
              layout={gridLayout}
              mode={mode}
              accentColor={accent.hex}
              selectedDate={selectedDate}
            />
          ) : (
            <YearDotsMonthsSvg
              year={year}
              dots={dots}
              blocks={monthsLayout.blocks}
              mode={mode}
              accentColor={accent.hex}
              selectedDate={selectedDate}
            />
          )}
        </Svg>
      </Animated.View>
    </View>
  );
}
