import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  useReducedMotion,
} from "react-native-reanimated";
import { THEME_COLORS } from "@/lib/theme";

export interface HorizontalBarItem {
  id: string;
  label: string;
  value: number; // 0 to maxValue
  formattedValue: string;
  color?: string;
  sublabel?: string;
}

interface HorizontalBarsProps {
  items: HorizontalBarItem[];
  maxValue?: number;
}

function BarRow({
  item,
  ratio,
  color,
}: {
  item: HorizontalBarItem;
  ratio: number;
  color: string;
}) {
  const widthProgress = useSharedValue(0);
  const shouldReduceMotion = useReducedMotion();

  const safeRatio = isNaN(ratio) || !isFinite(ratio) ? 0 : Math.min(1, Math.max(0, ratio));

  useEffect(() => {
    if (shouldReduceMotion) {
      widthProgress.value = safeRatio;
    } else {
      widthProgress.value = withTiming(safeRatio, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [safeRatio, shouldReduceMotion]);

  const barStyle = useAnimatedStyle(() => {
    const pct = Math.min(100, Math.max(0, Math.round(widthProgress.value * 100)));
    return {
      width: `${pct}%`,
    };
  });

  return (
    <View className="mb-3">
      <View className="flex-row justify-between items-center mb-1.5">
        <View className="flex-row items-center gap-2">
          <View
            style={{ backgroundColor: color }}
            className="w-2.5 h-2.5 rounded-full"
          />
          <Text className="text-text-primary text-sm font-medium">
            {item.label}
          </Text>
        </View>
        <Text className="text-muted text-xs font-semibold">
          {item.formattedValue}
        </Text>
      </View>
      <View className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
        <Animated.View
          style={[barStyle, { backgroundColor: color }]}
          className="h-full rounded-full"
        />
      </View>
    </View>
  );
}

export function HorizontalBars({ items, maxValue }: HorizontalBarsProps) {
  if (items.length === 0) return null;

  const max =
    maxValue ||
    Math.max(...items.map((i) => i.value), 1);

  return (
    <View className="w-full">
      {items.map((item) => {
        const ratio = Math.min(1, Math.max(0, item.value / max));
        const color = item.color || THEME_COLORS.lime;
        return <BarRow key={item.id} item={item} ratio={ratio} color={color} />;
      })}
    </View>
  );
}
