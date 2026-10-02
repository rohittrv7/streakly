import React, { useState } from "react";
import { View } from "react-native";
import { Text, Sheet, Button } from "@/components/ui";
import { useYouTubeStore } from "../store";
import { useTaskLinks, useLinksProgress } from "../hooks";
import { getLinksProgress } from "../utils";
import type { TaskLink } from "../types";
import { YouTubeAddLinkRow } from "./YouTubeAddLinkRow";
import { VideoCard } from "./VideoCard";
import { PlaylistCard } from "./PlaylistCard";
import { VideoOpenSheet } from "./VideoOpenSheet";
import { VideoPlayerSheet } from "./VideoPlayerSheet";
import { WatchedTillSheet } from "./WatchedTillSheet";
import { NoteSheet } from "./NoteSheet";

export interface YouTubeSectionProps {
  taskId?: string;
  mode?: "view" | "edit";
  pendingLinks?: TaskLink[];
  pendingMetadataStatus?: Record<string, "idle" | "loading" | "error" | "success">;
  onAddPendingLink?: (url: string) => Promise<void>;
  onRemovePendingLink?: (id: string) => void;
  onTogglePendingWatched?: (id: string) => void;
  onUpdatePendingProgress?: (id: string, done: number, total: number) => void;
  onSetPendingWatchedTill?: (id: string, seconds: number | null) => void;
  onSetPendingNote?: (id: string, note: string | null) => void;
  onRetryPendingMetadata?: (id: string) => void;
  onMarkTaskDone?: () => void;
}

export function YouTubeSection({
  taskId,
  mode = "edit",
  pendingLinks,
  pendingMetadataStatus,
  onAddPendingLink,
  onRemovePendingLink,
  onTogglePendingWatched,
  onUpdatePendingProgress,
  onSetPendingWatchedTill,
  onSetPendingNote,
  onRetryPendingMetadata,
  onMarkTaskDone,
}: YouTubeSectionProps) {
  const store = useYouTubeStore();
  const dbLinks = useTaskLinks(taskId);
  const dbProgress = useLinksProgress(taskId);

  const links = taskId ? dbLinks : pendingLinks || [];
  const progress = taskId ? dbProgress : getLinksProgress(links);

  const [activeLinkForOpen, setActiveLinkForOpen] = useState<TaskLink | null>(null);
  const [activeLinkForPlayer, setActiveLinkForPlayer] = useState<TaskLink | null>(null);
  const [activeLinkForTime, setActiveLinkForTime] = useState<TaskLink | null>(null);
  const [activeLinkForNote, setActiveLinkForNote] = useState<TaskLink | null>(null);
  const [allWatchedSheetVisible, setAllWatchedSheetVisible] = useState(false);

  const handleToggle = async (id: string) => {
    if (taskId) {
      const next = await store.toggleWatched(id, taskId);
      if (next && onMarkTaskDone) {
        const nextLinks = links.map((l) => (l.id === id ? { ...l, watched: true } : l));
        const p = getLinksProgress(nextLinks);
        if (p.total > 0 && p.watched === p.total) setAllWatchedSheetVisible(true);
      }
    } else if (onTogglePendingWatched) {
      onTogglePendingWatched(id);
    }
  };

  const topLevelLinks = links.filter((l) => !l.parentLinkId);

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text variant="label">VIDEOS ({topLevelLinks.length})</Text>
        {progress.total > 0 && (
          <View className="bg-primary/20 px-2 py-0.5 rounded-pill border border-primary/40">
            <Text className="text-[10px] font-extrabold text-primary">
              {progress.watched}/{progress.total} watched
            </Text>
          </View>
        )}
      </View>

      {mode !== "view" && (
        <YouTubeAddLinkRow
          onAdd={async (url) => {
            if (taskId) await store.addLink(taskId, url);
            else if (onAddPendingLink) await onAddPendingLink(url);
          }}
        />
      )}

      {topLevelLinks.length === 0 ? (
        <Text variant="caption" className="text-text-muted text-xs py-1">
          {mode === "view" ? "No companion videos added." : "No companion videos added. Paste a YouTube link to follow along."}
        </Text>
      ) : (
        <View className="gap-2 mt-1">
          {topLevelLinks.map((link) =>
            link.kind === "playlist" ? (
              <PlaylistCard
                key={link.id}
                link={link}
                childVideos={links.filter((l) => l.parentLinkId === link.id).sort((a, b) => (a.position ?? 0) - (b.position ?? 0))}
                mode={mode}
                onUpdateProgress={(done, total) => {
                  if (taskId) store.setPlaylistProgress(link.id, taskId, done, total);
                  else if (onUpdatePendingProgress) onUpdatePendingProgress(link.id, done, total);
                }}
                onRemove={() => {
                  if (taskId) store.removeLink(link.id, taskId);
                  else if (onRemovePendingLink) onRemovePendingLink(link.id);
                }}
                onOpenVideo={(v) => setActiveLinkForOpen(v)}
              />
            ) : (
              <VideoCard
                key={link.id}
                link={link}
                mode={mode}
                metadataStatus={taskId ? store.metadataStatus[link.id] : pendingMetadataStatus?.[link.id]}
                onToggleWatched={() => handleToggle(link.id)}
                onPressCard={() => setActiveLinkForOpen(link)}
                onOpenWatchedTill={() => setActiveLinkForTime(link)}
                onOpenNote={() => setActiveLinkForNote(link)}
                onRemove={() => {
                  if (taskId) store.removeLink(link.id, taskId);
                  else if (onRemovePendingLink) onRemovePendingLink(link.id);
                }}
                onRetryMetadata={() => {
                  if (taskId) store.retryMetadata(link.id, taskId);
                  else if (onRetryPendingMetadata) onRetryPendingMetadata(link.id);
                }}
              />
            )
          )}
        </View>
      )}

      <VideoOpenSheet
        visible={activeLinkForOpen !== null}
        onClose={() => setActiveLinkForOpen(null)}
        link={activeLinkForOpen}
        onWatchInApp={() => {
          setActiveLinkForPlayer(activeLinkForOpen);
          setActiveLinkForOpen(null);
        }}
      />
      <VideoPlayerSheet
        visible={activeLinkForPlayer !== null} onClose={() => setActiveLinkForPlayer(null)} link={activeLinkForPlayer}
        onSavePosition={(sec) => {
          if (activeLinkForPlayer && taskId) store.setWatchedTill(activeLinkForPlayer.id, taskId, sec);
          else if (activeLinkForPlayer && onSetPendingWatchedTill) onSetPendingWatchedTill(activeLinkForPlayer.id, sec);
        }}
        onMarkWatched={() => {
          if (activeLinkForPlayer && taskId) store.toggleWatched(activeLinkForPlayer.id, taskId);
          else if (activeLinkForPlayer && onTogglePendingWatched) onTogglePendingWatched(activeLinkForPlayer.id);
        }}
      />
      <WatchedTillSheet
        visible={activeLinkForTime !== null} onClose={() => setActiveLinkForTime(null)}
        currentSeconds={activeLinkForTime?.watchedTillSeconds}
        onSave={(sec) => {
          if (activeLinkForTime && taskId) store.setWatchedTill(activeLinkForTime.id, taskId, sec);
          else if (activeLinkForTime && onSetPendingWatchedTill) onSetPendingWatchedTill(activeLinkForTime.id, sec);
        }}
      />
      <NoteSheet
        visible={activeLinkForNote !== null} onClose={() => setActiveLinkForNote(null)}
        currentNote={activeLinkForNote?.note}
        onSave={(note) => {
          if (activeLinkForNote && taskId) store.setNote(activeLinkForNote.id, taskId, note);
          else if (activeLinkForNote && onSetPendingNote) onSetPendingNote(activeLinkForNote.id, note);
        }}
      />
      <Sheet visible={allWatchedSheetVisible} onClose={() => setAllWatchedSheetVisible(false)} title="All Videos Watched">
        <View className="gap-4 pb-2">
          <Text variant="body" className="text-text-secondary">
            You finished all companion videos for this task! Mark the entire task as done?
          </Text>
          <View className="gap-2">
            <Button
              variant="primary"
              title="Yes, Mark Task Done"
              onPress={() => {
                setAllWatchedSheetVisible(false);
                if (onMarkTaskDone) onMarkTaskDone();
              }}
            />
            <Button variant="secondary" title="Not Now" onPress={() => setAllWatchedSheetVisible(false)} />
          </View>
        </View>
      </Sheet>
    </View>
  );
}
