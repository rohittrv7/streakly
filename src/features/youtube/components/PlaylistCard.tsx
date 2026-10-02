import React, { useState, useEffect } from "react";
import { View, Pressable, Linking } from "react-native";
import { Queue, DotsThreeVertical, Copy, Trash, Plus, Minus, CaretDown, CaretUp, ArrowClockwise, CalendarPlus } from "phosphor-react-native";
import * as Clipboard from "expo-clipboard";
import { Haptics } from "@/core/utils/haptics";
import { Card, Text, Sheet, Button } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { buildOpenUrl } from "../utils";
import type { TaskLink } from "../types";
import { getYouTubeApiKey } from "../api-key";
import { useYouTubeStore } from "../store";
import { PlaylistVideoRow } from "./PlaylistVideoRow";
import { PlanPlaylistSheet } from "../plan/PlanPlaylistSheet";
import { formatPlanDuration } from "../plan/format";

export interface PlaylistCardProps {
  link: TaskLink;
  childVideos?: TaskLink[];
  mode?: "view" | "edit";
  onUpdateProgress: (done: number, total: number) => void;
  onRemove?: () => void;
  onOpenVideo?: (video: TaskLink) => void;
}

export function PlaylistCard({ link, childVideos = [], mode = "edit", onUpdateProgress, onRemove, onOpenVideo }: PlaylistCardProps) {
  const store = useYouTubeStore();
  const [hasKey, setHasKey] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [importing, setImporting] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [confirmRemoveVisible, setConfirmRemoveVisible] = useState(false);
  const [planSheetVisible, setPlanSheetVisible] = useState(false);

  useEffect(() => { getYouTubeApiKey().then((k) => setHasKey(Boolean(k))).catch(() => {}); }, []);

  const hasChildren = childVideos.length > 0;
  const done = hasChildren ? childVideos.filter((c) => c.watched).length : link.playlistDone || 0;
  const total = hasChildren ? childVideos.length : link.playlistTotal || 10;
  const percentage = total > 0 ? Math.round((done / total) * 100) : 0;
  const nextVideo = hasChildren ? childVideos.find((c) => !c.watched) : null;
  const totalDuration = hasChildren ? childVideos.reduce((a, c) => a + (c.durationSeconds || 0), 0) : 0;
  const displayedVideos = showAll ? childVideos : childVideos.slice(0, 5);

  const handleImport = async () => {
    if (!link.externalId) return;
    setImporting(true);
    try {
      await store.importPlaylist(link.id, link.taskId, link.externalId);
      setExpanded(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (err) {
      console.warn("Import failed:", err);
    } finally {
      setImporting(false);
    }
  };

  const handleResync = async () => {
    setMenuVisible(false);
    if (!link.externalId) return;
    setImporting(true);
    try {
      await store.resyncPlaylist(link.id, link.taskId, link.externalId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } finally {
      setImporting(false);
    }
  };

  const stepDone = (d: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onUpdateProgress(Math.max(0, Math.min(total, done + d)), total);
  };

  return (
    <Card variant="surface" className="p-3 mb-2.5 border border-border">
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={() => hasChildren ? setExpanded(!expanded) : Linking.openURL(buildOpenUrl(link)).catch(() => {})}
          className="flex-row items-center gap-2.5 flex-1 mr-2 active:opacity-75"
        >
          <View className="w-10 h-10 rounded-[12px] bg-elevated border border-border items-center justify-center">
            <Queue size={20} color={THEME_COLORS.primary} weight="bold" />
          </View>
          <View className="flex-1">
            <Text variant="body" className="font-bold text-xs" numberOfLines={1}>{link.title || "YouTube Playlist"}</Text>
            <Text variant="caption" className="text-[10px] text-text-secondary mt-0.5">
              {done}/{total} watched ({percentage}%){totalDuration > 0 ? ` · ${formatPlanDuration(totalDuration)}` : ""}
            </Text>
          </View>
        </Pressable>

        <View className="flex-row items-center gap-1">
          {hasChildren && (
            <Pressable onPress={() => setExpanded(!expanded)} hitSlop={8} className="w-8 h-8 items-center justify-center rounded-full">
              {expanded ? <CaretUp size={16} color={THEME_COLORS.text.muted} /> : <CaretDown size={16} color={THEME_COLORS.text.muted} />}
            </Pressable>
          )}
          <Pressable onPress={() => setMenuVisible(true)} hitSlop={8} className="w-8 h-8 items-center justify-center rounded-full">
            <DotsThreeVertical size={16} color={THEME_COLORS.text.muted} weight="bold" />
          </Pressable>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="w-full h-1.5 bg-elevated rounded-pill overflow-hidden my-2">
        <View style={{ width: `${Math.min(100, Math.max(0, percentage))}%`, backgroundColor: THEME_COLORS.primary }} className="h-full rounded-pill" />
      </View>

      {/* Next video label when collapsed */}
      {!expanded && nextVideo && (
        <Text variant="caption" className="text-[11px] text-text-secondary py-0.5" numberOfLines={1}>
          Next: {nextVideo.position}. {nextVideo.title}
        </Text>
      )}

      {/* Unimported state: Import button or manual fallback */}
      {!hasChildren && (
        <View className="pt-1.5">
          {hasKey ? (
            <Button variant="primary" size="sm" title={importing ? "Importing..." : "Import Videos"} disabled={importing} onPress={handleImport} className="mb-2" />
          ) : (
            <Text variant="caption" className="text-[10px] text-text-muted mb-2">Add a YouTube API key in Settings to import all videos.</Text>
          )}
          <View className="flex-row items-center justify-between pt-1">
            <Text variant="caption" className="text-[11px] text-text-muted">Progress Stepper</Text>
            <View className="flex-row items-center gap-2">
              <Button variant="secondary" size="sm" icon={<Minus size={14} color={THEME_COLORS.text.primary} />} onPress={() => stepDone(-1)} className="w-8 h-8 p-0" />
              <Text className="text-xs font-bold min-w-[28px] text-center">{done}/{total}</Text>
              <Button variant="secondary" size="sm" icon={<Plus size={14} color={THEME_COLORS.text.primary} />} onPress={() => stepDone(1)} className="w-8 h-8 p-0" />
            </View>
          </View>
        </View>
      )}

      {/* Expanded list of videos */}
      {hasChildren && expanded && (
        <View className="pt-2">
          {displayedVideos.map((v) => (
            <PlaylistVideoRow
              key={v.id} video={v} playlistId={link.externalId || undefined}
              onToggleWatched={(id) => store.toggleWatched(id, link.taskId)}
              onOpenVideo={(item) => onOpenVideo ? onOpenVideo(item) : Linking.openURL(buildOpenUrl({ ...item, playlistId: link.externalId, position: item.position })).catch(() => {})}
            />
          ))}
          {childVideos.length > 5 && (
            <Button
              variant="ghost" size="sm"
              title={showAll ? "Show Less" : `Show all ${childVideos.length}`}
              onPress={() => setShowAll(!showAll)} className="mt-1"
            />
          )}
        </View>
      )}

      {/* Options & Confirmation Sheets */}
      <Sheet visible={menuVisible} onClose={() => setMenuVisible(false)} title="Playlist Options">
        <View className="gap-2 pb-2">
          {hasChildren && (
            <>
              <Button variant="secondary" title="Plan this playlist" icon={<CalendarPlus size={16} color={THEME_COLORS.primary} />} onPress={() => { setMenuVisible(false); setPlanSheetVisible(true); }} />
              <Button variant="secondary" title={importing ? "Syncing..." : "Re-sync playlist"} icon={<ArrowClockwise size={16} color={THEME_COLORS.text.primary} />} onPress={handleResync} disabled={importing} />
            </>
          )}
          <Button variant="secondary" title="Open in YouTube" onPress={() => { setMenuVisible(false); Linking.openURL(buildOpenUrl(link)).catch(() => {}); }} />
          <Button variant="secondary" title="Copy Link" icon={<Copy size={16} color={THEME_COLORS.text.primary} />} onPress={async () => { await Clipboard.setStringAsync(link.url); setMenuVisible(false); }} />
          {mode !== "view" && (
            <Button variant="secondary" className="bg-coral/20 border-coral/40" textClassName="text-coral" title="Remove Playlist" icon={<Trash size={16} color={THEME_COLORS.coral} />} onPress={() => { setMenuVisible(false); setConfirmRemoveVisible(true); }} />
          )}
        </View>
      </Sheet>

      <Sheet visible={confirmRemoveVisible} onClose={() => setConfirmRemoveVisible(false)} title="Remove Playlist?">
        <View className="gap-3 pb-2">
          <Text variant="body" className="text-text-secondary">Are you sure you want to remove this playlist and all its videos from the task?</Text>
          <View className="gap-2">
            <Button variant="secondary" className="bg-coral/20 border-coral/40" textClassName="text-coral" title="Remove" onPress={() => { setConfirmRemoveVisible(false); onRemove?.(); }} />
            <Button variant="secondary" title="Cancel" onPress={() => setConfirmRemoveVisible(false)} />
          </View>
        </View>
      </Sheet>

      {hasChildren && (
        <PlanPlaylistSheet
          visible={planSheetVisible} onClose={() => setPlanSheetVisible(false)}
          playlistId={link.externalId || ""} playlistTitle={link.title || "Playlist"}
          videos={childVideos.map((c) => ({
            videoId: c.externalId || "", title: c.title || "", thumbnailUrl: c.thumbnailUrl || "",
            durationSeconds: c.durationSeconds ?? null, position: c.position || 1,
          }))}
        />
      )}
    </Card>
  );
}
