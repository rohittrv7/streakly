import React, { useMemo } from "react";
import { Circle, G, Text as SvgText } from "react-native-svg";
import { THEME_COLORS } from "@/lib/theme";
import { getMonthGrid } from "@/features/planner/calendar";
import type { YearDot, YearMode } from "../year";
import type { MonthBlockLayout } from "../year-layout";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

interface YearDotsMonthsSvgProps {
  year: number;
  dots: YearDot[];
  blocks: MonthBlockLayout[];
  mode: YearMode;
  accentColor: string;
  selectedDate: string | null;
  todayPulseScale?: number;
  todayPulseOpacity?: number;
}

export function YearDotsMonthsSvg({
  year,
  dots,
  blocks,
  mode,
  accentColor,
  selectedDate,
  todayPulseScale = 1,
  todayPulseOpacity = 0.8,
}: YearDotsMonthsSvgProps) {
  const dotMap = useMemo(() => {
    const map = new Map<string, YearDot>();
    for (const d of dots) {
      map.set(d.date, d);
    }
    return map;
  }, [dots]);

  const monthGrids = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => getMonthGrid(year, i + 1));
  }, [year]);

  return (
    <G>
      {blocks.map((block) => {
        const m = block.month;
        const grid = monthGrids[m - 1];
        const monthLabel = MONTH_NAMES[m - 1];

        return (
          <G key={`month-${m}`}>
            {/* Month header label */}
            <SvgText
              x={block.x + 2}
              y={block.y + 12}
              fill={THEME_COLORS.muted}
              fontSize={10}
              fontWeight="600"
            >
              {monthLabel}
            </SvgText>

            {/* 6x7 days grid */}
            {grid.map((cell, idx) => {
              if (!cell.inMonth) return null;
              const col = idx % 7;
              const row = Math.floor(idx / 7);
              const cx = block.x + col * block.cellWidth + block.cellWidth / 2;
              const cy = block.y + 18 + row * block.cellHeight + block.cellHeight / 2;

              const dot = dotMap.get(cell.date);
              if (!dot) return null;

              const isToday = dot.state === "today";
              const isSelected = selectedDate === dot.date;

              let fill = "none";
              let stroke = "none";
              let strokeWidth = 0;
              let opacity = 1;

              if (dot.state === "future") {
                stroke = THEME_COLORS.border;
                strokeWidth = 1;
                fill = "none";
              } else if (dot.state === "past" || isToday) {
                if (mode === "time") {
                  fill = accentColor;
                  opacity = isToday ? 1 : 0.9;
                } else {
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
                <G key={cell.date}>
                  <Circle
                    cx={cx}
                    cy={cy}
                    r={block.dotRadius}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    opacity={opacity}
                  />

                  {isToday && (
                    <Circle
                      cx={cx}
                      cy={cy}
                      r={block.dotRadius * 1.5 * todayPulseScale}
                      fill="none"
                      stroke={accentColor}
                      strokeWidth={1.2}
                      opacity={todayPulseOpacity}
                    />
                  )}

                  {isSelected && (
                    <Circle
                      cx={cx}
                      cy={cy}
                      r={block.dotRadius + 2}
                      fill="none"
                      stroke={THEME_COLORS.text.primary}
                      strokeWidth={1.5}
                    />
                  )}
                </G>
              );
            })}
          </G>
        );
      })}
    </G>
  );
}
