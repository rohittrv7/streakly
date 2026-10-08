import React from "react";
import { View, Pressable } from "react-native";
import { Text, Toggle } from "@/components/ui";
import { formatTime } from "@/core/utils/time";

interface Props {
  enabled: boolean;
  onToggle: (val: boolean) => void;
  startTime: string;
  endTime: string;
  onPickStart: () => void;
  onPickEnd: () => void;
}

export function NotificationQuietHoursSection({
  enabled,
  onToggle,
  startTime,
  endTime,
  onPickStart,
  onPickEnd,
}: Props) {
  return (
    <View className="gap-2 border-t border-border pt-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text variant="body" className="font-medium">Quiet Hours</Text>
          <Text variant="caption">Suppress non-urgent notifications</Text>
        </View>
        <Toggle value={enabled} onValueChange={onToggle} />
      </View>

      {enabled && (
        <View className="flex-row items-center gap-3 pt-1">
          <Pressable
            onPress={onPickStart}
            className="flex-1 p-2 rounded-lg bg-surface border border-border items-center"
          >
            <Text variant="caption" className="text-xs text-text-muted">Start</Text>
            <Text variant="body" className="font-bold text-text-primary">
              {formatTime(startTime)}
            </Text>
          </Pressable>
          <Text variant="caption" className="text-text-muted">to</Text>
          <Pressable
            onPress={onPickEnd}
            className="flex-1 p-2 rounded-lg bg-surface border border-border items-center"
          >
            <Text variant="caption" className="text-xs text-text-muted">End</Text>
            <Text variant="body" className="font-bold text-text-primary">
              {formatTime(endTime)}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
