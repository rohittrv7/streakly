import React, { useState } from "react";
import { View, Pressable, Linking } from "react-native";
import { Queue, DotsThreeVertical, Copy, Trash, Plus, Minus } from "phosphor-react-native";
import * as Clipboard from "expo-clipboard";
import { Haptics } from "@/core/utils/haptics";
import { Card, Text, Sheet, Button } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { buildOpenUrl } from "../utils";
import type { TaskLink } from "../types";

export interface PlaylistCardProps {
  link: TaskLink;
  mode?: "view" | "edit";
  onUpdateProgress: (done: number, total: number) => void;
  onRemove?: () => void;
}

export function PlaylistCard({
  link,
  mode = "edit",
  onUpdateProgress,
  onRemove,
}: PlaylistCardProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [confirmRemoveVisible, setConfirmRemoveVisible] = useState(false);

  const done = link.playlistDone || 0;
  const total = link.playlistTotal || 10;
  const ratio = total > 0 ? done / total : 0;
  const percentage = Math.round(ratio * 100);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(link.url);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setMenuVisible(false);
  };

  const handleOpen = () => {
    Linking.openURL(buildOpenUrl(link)).catch(() => {});
  };

  const stepDone = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const nextDone = Math.max(0, Math.min(total, done + delta));
    onUpdateProgress(nextDone, total);
  };

  return (
    <Card variant="surface" className="p-3 mb-2.5 border border-border">
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={handleOpen}
          className="flex-row items-center gap-2.5 flex-1 mr-2 active:opacity-75"
          accessibilityRole="button"
          accessibilityLabel={`Open playlist ${link.title}`}
        >
          <View className="w-10 h-10 rounded-[12px] bg-elevated border border-border items-center justify-center">
            <Queue size={20} color={THEME_COLORS.primary} weight="bold" />
          </View>
          <View className="flex-1">
            <Text variant="body" className="font-bold text-xs" numberOfLines={1}>
              {link.title || "YouTube Playlist"}
            </Text>
            <Text variant="caption" className="text-[10px] text-text-secondary mt-0.5">
              Watched {done} of {total} ({percentage}%)
            </Text>
          </View>
        </Pressable>

        {/* Options */}
        <Pressable
          onPress={() => setMenuVisible(true)}
          hitSlop={8}
          className="w-8 h-8 items-center justify-center rounded-full active:opacity-60"
        >
          <DotsThreeVertical size={16} color={THEME_COLORS.text.muted} weight="bold" />
        </Pressable>
      </View>

      {/* Progress Bar */}
      <View className="w-full h-1.5 bg-elevated rounded-pill overflow-hidden my-2.5">
        <View
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%`, backgroundColor: THEME_COLORS.primary }}
          className="h-full rounded-pill"
        />
      </View>

      {/* Stepper Buttons */}
      <View className="flex-row items-center justify-between pt-1">
        <Text variant="caption" className="text-[11px] text-text-muted">Progress Stepper</Text>
        <View className="flex-row items-center gap-2">
          <Button variant="secondary" size="sm" icon={<Minus size={14} color={THEME_COLORS.text.primary} />} onPress={() => stepDone(-1)} className="w-8 h-8 p-0" />
          <Text className="text-xs font-bold min-w-[28px] text-center">{done}/{total}</Text>
          <Button variant="secondary" size="sm" icon={<Plus size={14} color={THEME_COLORS.text.primary} />} onPress={() => stepDone(1)} className="w-8 h-8 p-0" />
        </View>
      </View>

      {/* Sheet Menus */}
      <Sheet visible={menuVisible} onClose={() => setMenuVisible(false)} title="Playlist Options">
        <View className="gap-2.5 pb-2">
          <Button variant="secondary" title="Open in YouTube" onPress={() => { setMenuVisible(false); handleOpen(); }} />
          <Button variant="secondary" title="Copy Link" icon={<Copy size={16} color={THEME_COLORS.text.primary} />} onPress={handleCopy} />
          {mode !== "view" && (
            <Button
              variant="secondary"
              className="bg-coral/20 border-coral/40"
              textClassName="text-coral"
              title="Remove Playlist"
              icon={<Trash size={16} color={THEME_COLORS.coral} />}
              onPress={() => { setMenuVisible(false); setConfirmRemoveVisible(true); }}
            />
          )}
        </View>
      </Sheet>

      {mode !== "view" && (
        <Sheet visible={confirmRemoveVisible} onClose={() => setConfirmRemoveVisible(false)} title="Remove Playlist?">
          <View className="gap-4 pb-2">
            <Text variant="body" className="text-text-secondary">Are you sure you want to remove this playlist from the task?</Text>
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
      )}
    </Card>
  );
}
