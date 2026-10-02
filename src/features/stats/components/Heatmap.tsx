import React, { useState } from "react";
import { View, Text, Pressable, type LayoutChangeEvent } from "react-native";
import { parseISO, format } from "date-fns";
import { THEME_COLORS } from "@/lib/theme";
import type { HeatmapCell } from "../types";

export interface HeatmapProps {
  cells: HeatmapCell[];
  onSelectCell: (cell: HeatmapCell) => void;
}

const LEVEL_COLORS = [
  "rgba(255, 255, 255, 0.05)",
  "rgba(212, 255, 63, 0.25)",
  "rgba(212, 255, 63, 0.50)",
  "rgba(212, 255, 63, 0.75)",
  THEME_COLORS.lime,
];

const WEEKDAY_LABELS = ["M", "", "W", "", "F", "", ""];

export function Heatmap({ cells, onSelectCell }: HeatmapProps) {
  const [containerWidth, setContainerWidth] = useState(0);

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  if (cells.length === 0) return null;

  // Split cells into columns of 7 days (Monday to Sunday)
  const columns: HeatmapCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    columns.push(cells.slice(i, i + 7));
  }

  const numCols = columns.length;
  const labelWidth = 16;
  const paddingX = 4;
  const gap = 3;
  const availableWidth =
    containerWidth > 0 ? containerWidth - labelWidth - paddingX * 2 : 0;
  const cellSize =
    numCols > 0
      ? Math.max(10, Math.min(18, (availableWidth - (numCols - 1) * gap) / numCols))
      : 14;

  // Month labels across columns
  let lastMonth = "";
  const monthLabels: { index: number; label: string }[] = [];
  columns.forEach((col, idx) => {
    if (col.length > 0) {
      const m = format(parseISO(`${col[0].date}T12:00:00`), "MMM");
      if (m !== lastMonth) {
        monthLabels.push({ index: idx, label: m });
        lastMonth = m;
      }
    }
  });

  return (
    <View onLayout={handleLayout} className="w-full">
      {/* Month Labels row */}
      <View
        style={{ paddingLeft: labelWidth + paddingX }}
        className="flex-row h-4 mb-1 relative"
      >
        {monthLabels.map((ml) => (
          <Text
            key={`${ml.index}_${ml.label}`}
            style={{
              position: "absolute",
              left: labelWidth + paddingX + ml.index * (cellSize + gap),
            }}
            className="text-[10px] text-muted font-medium"
          >
            {ml.label}
          </Text>
        ))}
      </View>

      {/* Grid: Weekday labels on left, columns of cells */}
      <View className="flex-row items-center">
        {/* Left weekday labels */}
        <View style={{ width: labelWidth }} className="justify-between mr-1">
          {WEEKDAY_LABELS.map((lbl, r) => (
            <View
              key={r}
              style={{ height: cellSize, marginBottom: r < 6 ? gap : 0 }}
              className="items-center justify-center"
            >
              <Text className="text-[9px] text-muted font-bold">{lbl}</Text>
            </View>
          ))}
        </View>

        {/* Columns of cells */}
        <View className="flex-row" style={{ gap }}>
          {columns.map((col, colIdx) => (
            <View key={colIdx} style={{ gap }}>
              {col.map((cell) => {
                const bg = LEVEL_COLORS[cell.level];
                const opacity = cell.inRange ? 1 : 0.4;
                return (
                  <Pressable
                    key={cell.date}
                    onPress={() => onSelectCell(cell)}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: bg,
                      opacity,
                      borderRadius: 3,
                    }}
                    accessibilityLabel={`${cell.date}: level ${cell.level}`}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </View>

      {/* Legend: Less ... More */}
      <View className="flex-row items-center justify-end gap-1.5 mt-3 pt-2 border-t border-white/5">
        <Text className="text-[10px] text-muted">Less</Text>
        {LEVEL_COLORS.map((color, idx) => (
          <View
            key={idx}
            style={{
              width: 10,
              height: 10,
              backgroundColor: color,
              borderRadius: 2,
            }}
          />
        ))}
        <Text className="text-[10px] text-muted">More</Text>
      </View>
    </View>
  );
}
