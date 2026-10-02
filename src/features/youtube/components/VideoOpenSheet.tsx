import React from "react";
import { View, Linking } from "react-native";
import { Play, ArrowSquareOut } from "phosphor-react-native";
import { Sheet, Button, Text } from "@/components/ui";
import { buildOpenUrl, formatTimestamp } from "../utils";
import type { TaskLink } from "../types";
import { THEME_COLORS } from "@/lib/theme";

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
  if (!link) return null;

  const hasResume = Boolean(link.watchedTillSeconds && link.watchedTillSeconds > 0);
  const resumeLabel = hasResume
    ? `Resume from ${formatTimestamp(link.watchedTillSeconds || 0)}`
    : "Open in YouTube";

  const handleOpenExternal = () => {
    onClose();
    Linking.openURL(buildOpenUrl(link)).catch(() => {});
  };

  const handleWatchInApp = () => {
    onClose();
    onWatchInApp();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Watch Video">
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
            title="Watch in App"
            icon={<Play size={18} color={THEME_COLORS.text.primary} weight="bold" />}
            onPress={handleWatchInApp}
          />
        </View>
      </View>
    </Sheet>
  );
}
