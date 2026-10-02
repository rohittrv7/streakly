import React, { useState } from "react";
import { View, Text, Pressable, type LayoutChangeEvent } from "react-native";
import Svg, { Path, Circle, Line } from "react-native-svg";
import { THEME_COLORS } from "@/lib/theme";
import { useAccent } from "@/lib/theme/store";
import type { StatBucket } from "../types";

export interface LineChartProps {
  data: StatBucket[];
  height?: number;
}

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export function LineChart({ data, height = 150 }: LineChartProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { accent } = useAccent();

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  if (data.length === 0) return null;

  const chartHeight = height - 32;
  const paddingX = 16;
  const paddingTop = 12;
  const innerHeight = chartHeight - paddingTop;
  const availableWidth = containerWidth > 0 ? containerWidth - paddingX * 2 : 0;
  const step = data.length > 1 ? availableWidth / (data.length - 1) : 0;

  const points = data.map((item, i) => {
    const x = paddingX + i * step;
    const y = paddingTop + innerHeight * (1 - Math.min(100, Math.max(0, item.value)) / 100);
    return { x, y };
  });

  const linePath = buildSmoothPath(points);
  const areaPath =
    points.length > 1
      ? `${linePath} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`
      : "";

  const activePoint = selectedIndex !== null ? data[selectedIndex] : null;

  return (
    <View onLayout={handleLayout} className="w-full">
      {/* Tooltip / Active Point readout */}
      <View className="flex-row items-center justify-between mb-2 px-1">
        {activePoint ? (
          <View className="flex-row items-center gap-2">
            <Text className="text-text-primary text-xs font-bold">{activePoint.label}</Text>
            <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: accent.softBackground }}>
              <Text className="text-xs font-extrabold" style={{ color: accent.hex }}>
                {Math.round(activePoint.value)}%
              </Text>
            </View>
          </View>
        ) : (
          <Text className="text-muted text-[11px]">Tap points to view completion %</Text>
        )}
      </View>

      {containerWidth > 0 && (
        <View style={{ height, width: containerWidth }}>
          <Svg width={containerWidth} height={chartHeight}>
            {/* Grid line at 100% and 50% */}
            <Line
              x1={paddingX}
              y1={paddingTop}
              x2={containerWidth - paddingX}
              y2={paddingTop}
              stroke={THEME_COLORS.border}
              strokeDasharray="4 4"
            />
            <Line
              x1={paddingX}
              y1={paddingTop + innerHeight * 0.5}
              x2={containerWidth - paddingX}
              y2={paddingTop + innerHeight * 0.5}
              stroke={THEME_COLORS.border}
              strokeDasharray="4 4"
            />

            {/* Flat low-opacity area fill (no gradient) */}
            {areaPath !== "" && (
              <Path
                d={areaPath}
                fill={accent.hex}
                opacity={0.12}
              />
            )}

            {/* Smooth line */}
            <Path
              d={linePath}
              fill="none"
              stroke={accent.hex}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Small dots on each data point */}
            {points.map((p, i) => {
              const isSelected = selectedIndex === i;
              return (
                <Circle
                  key={data[i].dateOrKey}
                  cx={p.x}
                  cy={p.y}
                  r={isSelected ? 5 : 3}
                  fill={isSelected ? THEME_COLORS.text.primary : accent.hex}
                  stroke={isSelected ? accent.hex : "transparent"}
                  strokeWidth={2}
                />
              );
            })}
          </Svg>

          {/* Full column pressable overlays */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: paddingX - (step > 0 ? step / 2 : 12),
              width: availableWidth + (step > 0 ? step : 24),
              height: chartHeight,
              flexDirection: "row",
            }}
          >
            {data.map((item, i) => (
              <Pressable
                key={`touch_${item.dateOrKey}`}
                onPress={() => setSelectedIndex(selectedIndex === i ? null : i)}
                style={{ width: step > 0 ? step : availableWidth, height: chartHeight }}
              />
            ))}
          </View>
        </View>
      )}

      {/* X Axis Labels */}
      <View className="flex-row justify-between mt-2 px-3">
        {data.map((item, i) => {
          // Show every 2nd or 3rd label if too crowded
          const showLabel = data.length <= 8 || i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 5) === 0;
          return (
            <Text
              key={item.dateOrKey}
              className={`text-[10px] ${selectedIndex === i ? "text-text-primary font-bold" : "text-muted"}`}
            >
              {showLabel ? item.label : ""}
            </Text>
          );
        })}
      </View>
    </View>
  );
}
