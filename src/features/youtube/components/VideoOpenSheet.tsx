import React from "react";
import { View, Linking } from "react-native";
import { Play, ArrowSquareOut } from "@/components/icons";
import { Sheet, Button, Text } from "@/components/ui";
import { buildOpenUrl, formatTimestamp } from "../utils";
import type { TaskLink } from "../types";
import { THEME_COLORS } from "@/lib/theme";
import { useT } from "@/core/i18n";
import { isEmbedFailed } from "../failed-embeds";

export interface VideoOpenSheetProps {
  visible: boolean;
  onClose: () => void;
  link: TaskLink | null;
  onWatchInApp: () => void;
}

export function VideoOpenSheet({
  visible,
  onClose,
  link,
  onWatchInApp,
}: VideoOpenSheetProps) {
  const { t } = useT();
  if (!link) return null;

  const embedFailed = isEmbedFailed(link.externalId);
  const hasResume = Boolean(link.watchedTillSeconds && link.watchedTillSeconds > 0);
  const resumeLabel = hasResume
    ? `${t("youtube.watchedTill", { time: formatTimestamp(link.watchedTillSeconds || 0) })}`
    : t("youtube.openInYouTube");

  const handleOpenExternal = () => {
    onClose();
    Linking.openURL(buildOpenUrl(link)).catch(() => {});
  };

  const handleWatchInApp = () => {
    if (embedFailed) return;
    onClose();
    onWatchInApp();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={t("youtube.openVideo")}>
      <View className="gap-3 pb-3">
        <Text variant="body" className="font-bold text-sm text-text-primary" numberOfLines={2}>
          {link.title || "YouTube Video"}
        </Text>

        <View className="gap-2.5 mt-2">
          <Button
            variant="primary"
            title={resumeLabel}
            icon={<ArrowSquareOut size={18} color={THEME_COLORS.background} weight="bold" />}
            onPress={handleOpenExternal}
          />
          <Button
            variant="secondary"
            disabled={embedFailed}
            title={embedFailed ? t("youtube.noWatchInAppReason") : t("youtube.watchInApp")}
            icon={<Play size={18} color={THEME_COLORS.text.primary} weight="bold" />}
            onPress={handleWatchInApp}
          />
        </View>
      </View>
    </Sheet>
  );
}
