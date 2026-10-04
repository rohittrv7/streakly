import React from "react";
import { Circle, G } from "react-native-svg";
import { THEME_COLORS } from "@/lib/theme";
import type { YearDot, YearMode } from "../year";
import type { GridLayout } from "../year-layout";

interface YearDotsGridSvgProps {
  dots: YearDot[];
  layout: GridLayout;
  mode: YearMode;
  accentColor: string;
  selectedDate: string | null;
  todayPulseScale?: number;
  todayPulseOpacity?: number;
}

export function YearDotsGridSvg({
  dots,
  layout,
  mode,
  accentColor,
  selectedDate,
  todayPulseScale = 1,
  todayPulseOpacity = 0.8,
}: YearDotsGridSvgProps) {
  const { columns, cellSize, dotRadius } = layout;

  return (
    <G>
      {dots.map((dot, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        const cx = col * cellSize + cellSize / 2;
        const cy = row * cellSize + cellSize / 2;
        const isToday = dot.state === "today";
        const isSelected = selectedDate === dot.date;

        let fill = "none";
        let stroke = "none";
        let strokeWidth = 0;
        let opacity = 1;

        if (dot.state === "future") {
          stroke = THEME_COLORS.border;
          strokeWidth = 1.2;
          fill = "none";
        } else if (dot.state === "past" || isToday) {
          if (mode === "time") {
            fill = accentColor;
            opacity = isToday ? 1 : 0.9;
          } else {
            // Activity mode
            if (dot.level === null) {
              fill = THEME_COLORS.elevated;
              opacity = 0.7;
            } else if (dot.level === 0) {
              fill = accentColor;
              opacity = 0.15;
            } else if (dot.level === 1) {
              fill = accentColor;
              opacity = 0.35;
            } else if (dot.level === 2) {
              fill = accentColor;
              opacity = 0.6;
            } else if (dot.level === 3) {
              fill = accentColor;
              opacity = 0.85;
            } else {
              fill = accentColor;
              opacity = 1.0;
            }
          }
        }

        return (
          <G key={dot.date}>
            <Circle
              cx={cx}
              cy={cy}
              r={dotRadius}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />

            {/* Today accent ring */}
            {isToday && (
              <Circle
                cx={cx}
                cy={cy}
                r={dotRadius * 1.5 * todayPulseScale}
                fill="none"
                stroke={accentColor}
                strokeWidth={1.5}
                opacity={todayPulseOpacity}
              />
            )}

            {/* Selected ring */}
            {isSelected && (
              <Circle
                cx={cx}
                cy={cy}
                r={dotRadius + 2.5}
                fill="none"
                stroke={THEME_COLORS.text.primary}
                strokeWidth={1.8}
              />
            )}
          </G>
        );
      })}
    </G>
  );
}
