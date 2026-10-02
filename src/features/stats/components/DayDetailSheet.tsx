import React from "react";
import { View, Text } from "react-native";
import { parseISO, format } from "date-fns";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { formatMinutes } from "../format";
import type { HeatmapCell } from "../types";

interface DayDetailSheetProps {
  cell: HeatmapCell | null;
  onClose: () => void;
}

export function DayDetailSheet({ cell, onClose }: DayDetailSheetProps) {
  if (!cell) return null;

  const dateObj = parseISO(`${cell.date}T12:00:00`);
  const formattedDate = format(dateObj, "EEEE, d MMMM yyyy");
  const pct =
    cell.scheduled > 0
      ? Math.round((cell.done / cell.scheduled) * 100)
      : null;

  return (
    <Sheet visible={Boolean(cell)} onClose={onClose} size="auto" title="Day Details">
      <View className="py-2">
        <Text className="text-text-primary text-base font-semibold mb-4">
          {formattedDate}
        </Text>

        <View className="flex-row gap-3 mb-4">
          {/* Habits & Tasks Summary */}
          <View className="flex-1 bg-elevated p-3 rounded-2xl border border-white/5">
            <Text className="text-muted text-xs font-medium uppercase mb-1">
              Activities
            </Text>
            <Text className="text-text-primary text-xl font-bold">
              {cell.done} / {cell.scheduled}
            </Text>
            <Text className="text-muted text-xs mt-0.5">
              {pct !== null ? `${pct}% completed` : "None scheduled"}
            </Text>
          </View>

          {/* Focus Time */}
          <View className="flex-1 bg-elevated p-3 rounded-2xl border border-white/5">
            <Text className="text-muted text-xs font-medium uppercase mb-1">
              Focus Time
            </Text>
            <Text className="text-lime text-xl font-bold">
              {formatMinutes(cell.focusMinutes)}
            </Text>
            <Text className="text-muted text-xs mt-0.5">
              {cell.focusMinutes > 0 ? "Deep work logged" : "No sessions"}
            </Text>
          </View>
        </View>

        <Button variant="secondary" className="w-full" onPress={onClose} title="Close" />
      </View>
    </Sheet>
  );
}
