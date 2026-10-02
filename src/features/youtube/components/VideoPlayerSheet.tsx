import React, { useRef, useState } from "react";
import { View, Linking } from "react-native";
import YoutubePlayer, { type YoutubeIframeRef } from "react-native-youtube-iframe";
import { Sheet, Button, Text } from "@/components/ui";
import { formatTimestamp, buildOpenUrl } from "../utils";
import type { TaskLink } from "../types";

export interface VideoPlayerSheetProps {
  visible: boolean;
  onClose: () => void;
  link: TaskLink | null;
  onSavePosition?: (seconds: number) => void;
  onMarkWatched?: () => void;
}

export function VideoPlayerSheet({
  visible,
  onClose,
  link,
  onSavePosition,
  onMarkWatched,
}: VideoPlayerSheetProps) {
  const playerRef = useRef<YoutubeIframeRef>(null);
  const [playing, setPlaying] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState<number | null>(null);

  if (!link || !link.externalId) return null;

  const handleClose = async () => {
    setPlaying(false);
    if (playerRef.current) {
      try {
        const time = await playerRef.current.getCurrentTime();
        if (time && time > 0) {
          setCurrentTime(Math.floor(time));
        }
      } catch {
        // Ignored
      }
    }
    onClose();
  };

  const handleStateChange = (state: string) => {
    if (state === "ended" && onMarkWatched) {
      onMarkWatched();
    }
  };

  const openInBrowser = () => {
    Linking.openURL(buildOpenUrl(link)).catch(() => {});
  };

  return (
    <Sheet visible={visible} onClose={handleClose} title={link.title || "YouTube Player"} size="full">
      <View className="gap-4 pb-3">
        {hasError ? (
          <View className="p-4 bg-surface rounded-card border border-border items-center gap-3">
            <Text variant="body" className="text-center text-text-secondary">
              This video cannot be played inside the app (embedding may be restricted by the owner).
            </Text>
            <Button variant="primary" title="Open in YouTube" onPress={openInBrowser} />
          </View>
        ) : (
          <View className="w-full aspect-video rounded-card overflow-hidden bg-black">
            <YoutubePlayer
              ref={playerRef}
              height={220}
              play={playing}
              videoId={link.externalId}
              initialPlayerParams={{
                startInSeconds: link.watchedTillSeconds || 0,
                preventFullScreen: false,
              }}
              onChangeState={handleStateChange}
              onError={() => setHasError(true)}
            />
          </View>
        )}

        {currentTime !== null && currentTime > 0 && onSavePosition && (
          <View className="flex-row items-center justify-between bg-surface p-3 rounded-card border border-border">
            <Text variant="caption">Paused at {formatTimestamp(currentTime)}</Text>
            <Button
              variant="secondary"
              size="sm"
              title={`Save at ${formatTimestamp(currentTime)}`}
              onPress={() => {
                onSavePosition(currentTime);
                setCurrentTime(null);
              }}
            />
          </View>
        )}

        <Button variant="ghost" title="Open External in YouTube App" onPress={openInBrowser} />
      </View>
    </Sheet>
  );
}
