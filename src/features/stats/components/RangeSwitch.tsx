import React, { useEffect } from "react";
import { View, Text, Pressable, type LayoutChangeEvent } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  useReducedMotion,
} from "react-native-reanimated";
import type { StatsRange } from "../types";

import { useT, type TranslationKey } from "@/core/i18n";

interface RangeSwitchProps {
  value: StatsRange;
  onChange: (range: StatsRange) => void;
}

const RANGES: { key: StatsRange; labelKey: TranslationKey }[] = [
  { key: "7d", labelKey: "stats.range7d" },
  { key: "30d", labelKey: "stats.range30d" },
  { key: "90d", labelKey: "stats.rangeAll" },
];

export function RangeSwitch({ value, onChange }: RangeSwitchProps) {
  const { t } = useT();
  const [containerWidth, setContainerWidth] = React.useState(0);
  const selectedIndex = RANGES.findIndex((r) => r.key === value);
  const tabWidth = containerWidth > 0 ? (containerWidth - 8) / RANGES.length : 0;

  const translateX = useSharedValue(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (tabWidth <= 0) return;
    const targetX = selectedIndex * tabWidth;
    if (shouldReduceMotion) {
      translateX.value = targetX;
    } else {
      translateX.value = withTiming(targetX, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [selectedIndex, tabWidth, shouldReduceMotion]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: tabWidth,
  }));

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  return (
    <View
      onLayout={handleLayout}
      className="flex-row bg-surface p-1 rounded-full border border-white/5 relative h-10 items-center"
    >
      {tabWidth > 0 && (
        <Animated.View
          style={[animatedIndicatorStyle]}
          className="absolute left-1 top-1 bottom-1 bg-lime rounded-full"
        />
      )}

      {RANGES.map((range) => {
        const isSelected = range.key === value;
        return (
          <Pressable
            key={range.key}
            onPress={() => onChange(range.key)}
            className="flex-1 h-full items-center justify-center z-10 rounded-full"
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
          >
            <Text
              className={`text-xs font-semibold ${
                isSelected ? "text-background font-bold" : "text-muted"
              }`}
            >
              {t(range.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
