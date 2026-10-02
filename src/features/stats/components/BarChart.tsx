import React, { useState } from "react";
import { View, Text, Pressable, type LayoutChangeEvent } from "react-native";
import Svg, { Rect, Line } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  useReducedMotion,
} from "react-native-reanimated";
import { THEME_COLORS, useAccent } from "@/lib/theme";
import type { StatBucket } from "../types";

export interface BarChartProps {
  data: StatBucket[];
  height?: number;
  highlightDate?: string;
  barColor?: string;
  unit?: string;
}

export function BarChart({
  data,
  height = 140,
  highlightDate,
  barColor,
  unit = "m",
}: BarChartProps) {
  const accent = useAccent();
  const effectiveBarColor = barColor ?? accent.hex;
  const [containerWidth, setContainerWidth] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const animProgress = useSharedValue(0);
  const shouldReduceMotion = useReducedMotion();

  React.useEffect(() => {
    if (shouldReduceMotion) {
      animProgress.value = 1;
    } else {
      animProgress.value = 0;
      animProgress.value = withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [data, shouldReduceMotion]);

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const chartHeight = height - 28; // space for x labels
  const barCount = data.length;
  const paddingX = 8;
  const availableWidth = containerWidth > 0 ? containerWidth - paddingX * 2 : 0;
  const barWidth = Math.max(
    3,
    Math.min(24, (availableWidth / barCount) * 0.65)
  );
  const step = availableWidth / barCount;

  const selectedItem = data.find((d) => d.dateOrKey === selectedKey);

  return (
    <View onLayout={handleLayout} className="w-full">
      {/* Tooltip / selected value banner */}
      <View className="h-6 items-center justify-center mb-1">
        {selectedItem ? (
          <View className="bg-elevated px-2.5 py-0.5 rounded-full border border-white/10 flex-row items-center gap-1">
            <Text className="text-text-primary text-xs font-bold">
              {selectedItem.value}
              {unit}
            </Text>
            {selectedItem.label ? (
              <Text className="text-muted text-[10px]">
                • {selectedItem.label}
              </Text>
            ) : null}
          </View>
        ) : (
          <Text className="text-muted text-[11px]">Tap a bar to see value</Text>
        )}
      </View>

      {containerWidth > 0 && (
        <View style={{ height, width: containerWidth }}>
          <Svg width={containerWidth} height={chartHeight}>
            {/* Grid line at 50% and 100% */}
            <Line
              x1={paddingX}
              y1={chartHeight * 0.5}
              x2={containerWidth - paddingX}
              y2={chartHeight * 0.5}
              stroke={THEME_COLORS.border}
              strokeDasharray="4 4"
            />

            {data.map((item, i) => {
              const x = paddingX + i * step + (step - barWidth) / 2;
              const barH = Math.max(3, (item.value / maxValue) * (chartHeight - 10));
              const y = chartHeight - barH;
              const isHighlight =
                highlightDate && item.dateOrKey.includes(highlightDate);
              const isSelected = item.dateOrKey === selectedKey;
              const fill = isSelected
                ? THEME_COLORS.text.primary
                : isHighlight
                ? THEME_COLORS.coral
                : effectiveBarColor;

              return (
                <Rect
                  key={item.dateOrKey}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx={barWidth / 3}
                  ry={barWidth / 3}
                  fill={fill}
                  opacity={item.value === 0 ? 0.2 : isSelected ? 1 : 0.85}
                />
              );
            })}
          </Svg>

          {/* Full column pressable overlays */}
          <View style={{ position: "absolute", top: 0, left: paddingX, width: availableWidth, height: chartHeight, flexDirection: "row" }}>
            {data.map((item) => (
              <Pressable
                key={`touch_${item.dateOrKey}`}
                onPress={() =>
                  setSelectedKey(selectedKey === item.dateOrKey ? null : item.dateOrKey)
                }
                style={{ width: step, height: chartHeight }}
              />
            ))}
          </View>

          {/* X Axis Labels */}
          <View
            style={{ width: containerWidth }}
            className="flex-row justify-between px-2 pt-1.5"
          >
            {data.map((item, i) => {
              const show = item.label !== "";
              return (
                <Pressable
                  key={item.dateOrKey}
                  onPress={() =>
                    setSelectedKey(
                      selectedKey === item.dateOrKey ? null : item.dateOrKey
                    )
                  }
                  style={{ width: step }}
                  className="items-center"
                >
                  <Text
                    numberOfLines={1}
                    className={`text-[10px] ${
                      item.dateOrKey === selectedKey
                        ? "text-accent font-bold"
                        : "text-muted"
                    }`}
                  >
                    {show ? item.label : ""}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}
