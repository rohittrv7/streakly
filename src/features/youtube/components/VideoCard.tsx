import React, { useState } from "react";
import { View, Image, Pressable } from "react-native";
import { DotsThreeVertical, Clock, Note, ArrowClockwise, Copy, Trash } from "@/components/icons";
import * as Clipboard from "expo-clipboard";
import { Haptics } from "@/core/utils/haptics";
import { Card, Text, StrikeText, Checkbox, Sheet, Button } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { formatTimestamp } from "../utils";
import type { TaskLink } from "../types";

export interface VideoCardProps {
  link: TaskLink;
  mode?: "view" | "edit";
  metadataStatus?: "idle" | "loading" | "error" | "success";
  onToggleWatched: () => void;
  onPressCard: () => void;
  onOpenWatchedTill: () => void;
  onOpenNote: () => void;
  onRemove?: () => void;
  onRetryMetadata?: () => void;
}

export function VideoCard({
  link,
  mode = "edit",
  metadataStatus,
  onToggleWatched,
  onPressCard,
  onOpenWatchedTill,
  onOpenNote,
  onRemove,
  onRetryMetadata,
}: VideoCardProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [confirmRemoveVisible, setConfirmRemoveVisible] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(link.url);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setMenuVisible(false);
  };

  return (
    <Card variant="surface" className="p-3 mb-2.5 border border-border">
      <View className="flex-row gap-3">
        {/* Thumbnail & Body tap area */}
        <Pressable
          onPress={onPressCard}
          className="flex-row gap-3 flex-1 active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel={`Play ${link.title}`}
        >
          {link.thumbnailUrl ? (
            <Image
              source={{ uri: link.thumbnailUrl }}
              className="w-24 h-16 rounded-[14px] bg-elevated border border-border"
              resizeMode="cover"
            />
          ) : (
            <View className="w-24 h-16 rounded-[14px] bg-elevated border border-border items-center justify-center">
              <Text variant="caption" className="text-[10px] text-text-muted">No Preview</Text>
            </View>
          )}

          <View className="flex-1 justify-between py-0.5">
            <StrikeText
              struck={link.watched}
              variant="body"
              className="font-bold text-xs"
              numberOfLines={2}
            >
              {link.title || "YouTube Video"}
            </StrikeText>

            {metadataStatus === "error" && onRetryMetadata && (
              <Pressable
                onPress={onRetryMetadata}
                className="flex-row items-center gap-1 mt-0.5 active:opacity-60"
              >
                <ArrowClockwise size={12} color={THEME_COLORS.coral} />
                <Text className="text-[10px] text-coral font-bold">Retry title fetch</Text>
              </Pressable>
            )}

            {/* Chips row */}
            <View className="flex-row items-center gap-2 mt-1">
              {link.watchedTillSeconds && link.watchedTillSeconds > 0 ? (
                <Pressable
                  onPress={onOpenWatchedTill}
                  className="flex-row items-center gap-1 bg-elevated px-1.5 py-0.5 rounded-pill border border-border"
                >
                  <Clock size={10} color={THEME_COLORS.primary} />
                  <Text variant="caption" className="text-[10px] text-primary font-bold">
                    {formatTimestamp(link.watchedTillSeconds)}
                  </Text>
                </Pressable>
              ) : null}

              {link.note ? (
                <Pressable
                  onPress={onOpenNote}
                  className="flex-row items-center gap-1 bg-elevated px-1.5 py-0.5 rounded-pill border border-border"
                >
                  <Note size={10} color={THEME_COLORS.text.muted} />
                  <Text variant="caption" className="text-[10px] text-text-secondary" numberOfLines={1}>
                    Note
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        </Pressable>

        {/* Actions Column */}
        <View className="items-center justify-between">
          {mode !== "view" ? (
            <Pressable
              onPress={() => setMenuVisible(true)}
              hitSlop={8}
              className="w-8 h-8 items-center justify-center rounded-full active:opacity-60"
              accessibilityLabel="Video options"
            >
              <DotsThreeVertical size={16} color={THEME_COLORS.text.muted} weight="bold" />
            </Pressable>
          ) : (
            <View className="w-8 h-8" />
          )}

          <Checkbox
            checked={link.watched}
            onCheckedChange={onToggleWatched}
            color="lime"
            accessibilityLabel={`Mark ${link.title} watched`}
          />
        </View>
      </View>

      {/* Options Menu & Confirm Remove (Edit mode only) */}
      {mode !== "view" && (
        <>
          <Sheet visible={menuVisible} onClose={() => setMenuVisible(false)} title="Link Options">
            <View className="gap-2.5 pb-2">
              <Button
                variant="secondary"
                title="Set Watched Till"
                icon={<Clock size={16} color={THEME_COLORS.text.primary} />}
                onPress={() => { setMenuVisible(false); onOpenWatchedTill(); }}
              />
              <Button
                variant="secondary"
                title={link.note ? "Edit Note" : "Add Note"}
                icon={<Note size={16} color={THEME_COLORS.text.primary} />}
                onPress={() => { setMenuVisible(false); onOpenNote(); }}
              />
              <Button
                variant="secondary"
                title="Copy Video Link"
                icon={<Copy size={16} color={THEME_COLORS.text.primary} />}
                onPress={handleCopy}
              />
              <Button
                variant="secondary"
                className="bg-coral/20 border-coral/40"
                textClassName="text-coral"
                title="Remove Video"
                icon={<Trash size={16} color={THEME_COLORS.coral} />}
                onPress={() => { setMenuVisible(false); setConfirmRemoveVisible(true); }}
              />
            </View>
          </Sheet>

          <Sheet visible={confirmRemoveVisible} onClose={() => setConfirmRemoveVisible(false)} title="Remove Video?">
            <View className="gap-4 pb-2">
              <Text variant="body" className="text-text-secondary">
                Are you sure you want to remove this video from the task?
              </Text>
              <View className="gap-2">
                <Button
                  variant="secondary"
                  className="bg-coral/20 border-coral/40"
                  textClassName="text-coral"
                  title="Remove"
                  onPress={() => { setConfirmRemoveVisible(false); onRemove?.(); }}
                />
                <Button variant="secondary" title="Cancel" onPress={() => setConfirmRemoveVisible(false)} />
              </View>
            </View>
          </Sheet>
        </>
      )}
    </Card>
  );
}
