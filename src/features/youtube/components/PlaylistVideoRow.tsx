import React from "react";
import { View, Image, Pressable } from "react-native";
import { CheckSquare, Square } from "phosphor-react-native";
import { Text } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { Haptics } from "@/core/utils/haptics";
import type { TaskLink } from "../types";
import { formatPlanDuration } from "../plan/format";

export interface PlaylistVideoRowProps {
  video: TaskLink;
  playlistId?: string;
  onToggleWatched: (id: string) => void;
  onOpenVideo: (video: TaskLink) => void;
}

export function PlaylistVideoRow({
  video,
  playlistId,
  onToggleWatched,
  onOpenVideo,
}: PlaylistVideoRowProps) {
  const durationText = video.durationSeconds ? formatPlanDuration(video.durationSeconds) : null;

  return (
    <View className="flex-row items-center justify-between py-2 border-b border-border/40 gap-2 min-h-[52px]">
      {/* Isolated Checkbox */}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          onToggleWatched(video.id);
        }}
        hitSlop={8}
        className="w-10 h-10 items-center justify-center rounded-full active:opacity-60"
        accessibilityRole="checkbox"
        accessibilityState={{ checked: video.watched }}
      >
        {video.watched ? (
          <CheckSquare size={20} color={THEME_COLORS.primary} weight="fill" />
        ) : (
          <Square size={20} color={THEME_COLORS.text.muted} />
        )}
      </Pressable>

      {/* Row tap to open */}
      <Pressable
        onPress={() => onOpenVideo(video)}
        className="flex-row items-center gap-2.5 flex-1 active:opacity-75"
        accessibilityRole="button"
      >
        {video.thumbnailUrl && (
          <Image
            source={{ uri: video.thumbnailUrl }}
            className="w-14 h-9 rounded-[8px] bg-elevated border border-border"
            resizeMode="cover"
          />
        )}
        <View className="flex-1">
          <Text
            variant="body"
            className={`font-semibold text-xs leading-4 ${
              video.watched ? "line-through text-text-muted" : "text-text-primary"
            }`}
            numberOfLines={2}
          >
            {video.position ? `${video.position}. ` : ""}
            {video.title || "Video"}
          </Text>
          {durationText && (
            <Text variant="caption" className="text-[10px] text-text-muted mt-0.5">
              {durationText}
            </Text>
          )}
        </View>
      </Pressable>
    </View>
  );
}
