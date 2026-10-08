import React from "react";
import { View, ActivityIndicator, Image } from "react-native";
import { Button, Text } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { useT } from "@/core/i18n";
import type { PlayerState } from "../player-machine";

interface VideoPlayerStateProps {
  state: PlayerState;
  thumbnailUrl?: string | null;
  errorDetail?: string | null;
  copied: boolean;
  onRetry: () => void;
  onOpenExternal: () => void;
  onCopyLink: () => void;
  onClose: () => void;
}

export function VideoPlayerLoadingOverlay({
  thumbnailUrl,
}: {
  thumbnailUrl?: string | null;
}) {
  return (
    <View className="absolute inset-0 bg-background items-center justify-center z-10">
      {thumbnailUrl ? (
        <Image
          source={{ uri: thumbnailUrl }}
          className="absolute inset-0 opacity-40"
          resizeMode="cover"
        />
      ) : null}
      <ActivityIndicator size="large" color={THEME_COLORS.primary} />
    </View>
  );
}

export function VideoPlayerMessageCard({
  state,
  errorDetail,
  copied,
  onRetry,
  onOpenExternal,
  onCopyLink,
  onClose,
}: VideoPlayerStateProps) {
  const { t } = useT();

  if (state === "offline") {
    return (
      <View className="p-4 bg-surface rounded-card border border-border items-center gap-3">
        <Text variant="title" className="text-center">
          {t("common.somethingWentWrong")}
        </Text>
        <Text variant="body" className="text-center text-text-secondary text-xs">
          {t("youtube.errorOffline")}
        </Text>
        <View className="w-full gap-2 mt-2">
          <Button variant="primary" title={t("common.retry")} onPress={onRetry} />
          <Button variant="secondary" title={t("common.close")} onPress={onClose} />
        </View>
      </View>
    );
  }

  const isTimeout = state === "timeout";
  const mainMsg = isTimeout
    ? t("youtube.errorTimeout")
    : t("youtube.embeddingRestricted");

  return (
    <View className="p-4 bg-surface rounded-card border border-border items-center gap-3">
      <Text variant="body" className="text-center text-text-secondary">
        {mainMsg}
      </Text>
      {errorDetail && (
        <Text variant="caption" className="text-muted text-[11px]">
          {t("youtube.embedDetails") || "Details"}: {errorDetail}
        </Text>
      )}
      <View className="w-full gap-2 mt-1">
        {isTimeout && (
          <Button variant="secondary" title={t("common.retry") || "Try Again"} onPress={onRetry} />
        )}
        <Button
          variant="primary"
          title={t("youtube.openInYouTube") || "Open in YouTube"}
          onPress={onOpenExternal}
          className="min-h-[44px]"
        />
        <Button
          variant="ghost"
          title={copied ? t("youtube.linkCopied") || "Copied!" : t("youtube.copyLink") || "Copy Link"}
          onPress={onCopyLink}
          className="min-h-[44px]"
        />
      </View>
    </View>
  );
}
