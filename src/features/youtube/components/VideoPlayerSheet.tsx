import React, { useRef, useState, useEffect, useReducer, useCallback } from "react";
import { View, Linking, BackHandler } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Network from "expo-network";
import YoutubePlayer, { type YoutubeIframeRef } from "react-native-youtube-iframe";
import { Sheet, Button, Text } from "@/components/ui";
import { formatTimestamp, buildOpenUrl } from "../utils";
import type { TaskLink } from "../types";
import { markEmbedFailed } from "../failed-embeds";
import { useT } from "@/core/i18n";
import { playerReducer, isAllowedPlayerUrl } from "../player-machine";
import { VideoPlayerLoadingOverlay, VideoPlayerMessageCard } from "./VideoPlayerViews";

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
  const { t } = useT();
  // Root cause: playerRef.current.getCurrentTime() hangs when WebView hasn't loaded.
  // Fix: only call getCurrentTime when state === "ready", track readiness separately.
  const playerRef = useRef<YoutubeIframeRef>(null);
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayerReadyRef = useRef(false);

  const [state, dispatch] = useReducer(playerReducer, "idle");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saveSeconds, setSaveSeconds] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const checkAndOpen = useCallback(async () => {
    isPlayerReadyRef.current = false;
    try {
      const net = await Network.getNetworkStateAsync();
      const connected = Boolean(net.isConnected && net.isInternetReachable !== false);
      dispatch({ type: "OPEN", isConnected: connected });
    } catch {
      dispatch({ type: "OPEN", isConnected: true });
    }
  }, []);

  useEffect(() => {
    if (visible && link?.externalId) {
      setSaveSeconds(null);
      checkAndOpen();
    } else {
      dispatch({ type: "CLOSE" });
    }
  }, [visible, link?.externalId, checkAndOpen]);

  // 10-second load timeout
  useEffect(() => {
    if (state === "loading") {
      timeoutTimerRef.current = setTimeout(() => dispatch({ type: "TIMEOUT" }), 10_000);
    } else {
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
        timeoutTimerRef.current = null;
      }
    }
    return () => {
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    };
  }, [state]);

  // Root cause fix: wrap close so getCurrentTime() is only called when the player is ready.
  const handleClose = useCallback(async () => {
    dispatch({ type: "CLOSE" });
    if (isPlayerReadyRef.current && playerRef.current) {
      try {
        const time = await playerRef.current.getCurrentTime();
        if (time && time > 0) setSaveSeconds(Math.floor(time));
      } catch {
        // ignore - player may have already unloaded
      }
    }
    onClose();
  }, [onClose]);

  // BackHandler: exits fullscreen first, then closes sheet
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isFullscreen) {
        setIsFullscreen(false);
        return true;
      }
      handleClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, isFullscreen, handleClose]);

  if (!link?.externalId) return null;

  const isPlaylist = link.kind === "playlist";
  const isErrorOrOffline = state === "offline" || state === "timeout" || state === "error";
  // Root cause fix: unmount WebView when state is closed/idle/error/offline to prevent freeze
  const shouldMountPlayer = state === "loading" || state === "ready";

  return (
    <Sheet
      visible={visible}
      onClose={handleClose}
      title={link.title || "YouTube Player"}
      size={isErrorOrOffline ? "auto" : "full"}
    >
      <View className="gap-4 pb-3">
        {isErrorOrOffline ? (
          <VideoPlayerMessageCard
            state={state}
            errorDetail={errorDetail}
            copied={copied}
            onRetry={checkAndOpen}
            onOpenExternal={() => Linking.openURL(buildOpenUrl(link)).catch(() => {})}
            onCopyLink={async () => {
              await Clipboard.setStringAsync(buildOpenUrl(link));
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            onClose={handleClose}
          />
        ) : shouldMountPlayer ? (
          <View className="w-full aspect-video rounded-card overflow-hidden bg-black relative">
            {state === "loading" && (
              <VideoPlayerLoadingOverlay thumbnailUrl={link.thumbnailUrl} />
            )}
            <YoutubePlayer
              ref={playerRef}
              height={220}
              play={state === "ready"}
              videoId={isPlaylist ? undefined : link.externalId}
              playList={isPlaylist ? link.externalId : undefined}
              useLocalHTML
              baseUrlOverride="https://www.youtube-nocookie.com"
              forceAndroidAutoplay
              onReady={() => {
                isPlayerReadyRef.current = true;
                dispatch({ type: "READY" });
              }}
              onFullScreenChange={setIsFullscreen}
              webViewProps={{
                androidLayerType: "hardware",
                allowsFullscreenVideo: true,
                mediaPlaybackRequiresUserAction: false,
                originWhitelist: ["*"],
                javaScriptEnabled: true,
                domStorageEnabled: true,
                allowsInlineMediaPlayback: true,
                setSupportMultipleWindows: false,
                onShouldStartLoadWithRequest: (req: { url: string }) => {
                  const check = isAllowedPlayerUrl(req.url);
                  if (!check.allowed && check.openExternal) {
                    Linking.openURL(req.url).catch(() => {});
                  }
                  return check.allowed;
                },
                onError: () => dispatch({ type: "ERROR", error: "WebView load error" }),
                onHttpError: (e: { nativeEvent: { statusCode: number } }) =>
                  dispatch({ type: "ERROR", error: `HTTP ${e.nativeEvent.statusCode}` }),
                onRenderProcessGone: () =>
                  dispatch({ type: "ERROR", error: "Process terminated" }),
              }}
              initialPlayerParams={{
                start: link.watchedTillSeconds ?? 0,
                preventFullScreen: false,
                rel: false,
              }}
              onChangeState={(s: string) => { if (s === "ended" && onMarkWatched) onMarkWatched(); }}
              onError={(err: string) => {
                setErrorDetail(String(err));
                dispatch({ type: "ERROR", error: String(err) });
                markEmbedFailed(link.externalId);
              }}
            />
          </View>
        ) : null}

        {saveSeconds !== null && saveSeconds > 0 && onSavePosition && (
          <View className="flex-row items-center justify-between bg-surface p-3 rounded-card border border-border">
            <Text variant="caption">Paused at {formatTimestamp(saveSeconds)}</Text>
            <Button
              variant="secondary"
              size="sm"
              title={`Save at ${formatTimestamp(saveSeconds)}`}
              onPress={() => { onSavePosition(saveSeconds); setSaveSeconds(null); }}
            />
          </View>
        )}

        {!isErrorOrOffline && (
          <Button
            variant="ghost"
            title={t("youtube.openInYouTube")}
            onPress={() => Linking.openURL(buildOpenUrl(link)).catch(() => {})}
            className="min-h-[44px]"
          />
        )}
      </View>
    </Sheet>
  );
}
