import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, Modal, Vibration, Pressable } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { createAudioPlayer } from "expo-audio";
import { Text, Button } from "@/components/ui";
import { Haptics } from "@/core/utils/haptics";
import { useTranslation } from "@/core/i18n";
import { useNotificationSettings } from "@/lib/notifications";
import type { FocusMode } from "../timer";

export interface FocusCompletionOverlayProps {
  visible: boolean;
  withSound: boolean;
  completedMode: FocusMode;
  linkedTaskId?: string | null;
  onClose: () => void;
  onNextPhase: () => void;
  onMarkTaskDone?: (taskId: string) => void;
}

export function FocusCompletionOverlay({
  visible,
  withSound,
  completedMode,
  linkedTaskId,
  onClose,
  onNextPhase,
  onMarkTaskDone,
}: FocusCompletionOverlayProps) {
  const { t } = useTranslation();
  const { settings } = useNotificationSettings();
  const reducedMotion = useReducedMotion();
  const [isPlayingAlarm, setIsPlayingAlarm] = useState(false);
  const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopAlarm = useCallback(() => {
    setIsPlayingAlarm(false);
    Vibration.cancel();
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    if (playerRef.current) {
      try {
        playerRef.current.pause();
        playerRef.current.release();
      } catch {}
      playerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!visible) {
      stopAlarm();
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    if (withSound) {
      setIsPlayingAlarm(true);
      Vibration.vibrate([0, 500, 250, 500], true);

      if (settings.focusEndSound !== "vibrate") {
        try {
          const player = createAudioPlayer(
            require("../../../../assets/sounds/focus_chime.wav")
          );
          player.loop = true;
          player.play();
          playerRef.current = player;
        } catch (err) {
          console.warn("[FocusCompletionOverlay] Audio error:", err);
        }
      }

      autoStopTimerRef.current = setTimeout(() => {
        stopAlarm();
      }, 30000);
    } else {
      setIsPlayingAlarm(false);
    }

    return () => {
      stopAlarm();
    };
  }, [visible, withSound, settings.focusEndSound, stopAlarm]);

  if (!visible) return null;

  const isFocus = completedMode === "focus";
  const title = isFocus ? t("focus.sessionCompleteTitle") : t("focus.breakCompleteTitle");
  const subtitle = isFocus ? t("focus.sessionCompleteSubtitle") : t("focus.breakCompleteSubtitle");
  const nextPhaseLabel = isFocus ? t("focus.startBreakAction") : t("focus.startFocusAction");

  return (
    <Modal visible={visible} transparent animationType={reducedMotion ? "none" : "fade"}>
      <View className="flex-1 bg-black/95 justify-center items-center px-6">
        <View className="w-full max-w-sm bg-surface p-6 rounded-3xl border border-border items-center gap-4">
          {/* Header */}
          <View className="items-center gap-1.5 text-center">
            <Text variant="title" className="text-center font-bold text-xl">
              {title}
            </Text>
            <Text variant="caption" className="text-center text-text-secondary">
              {subtitle}
            </Text>
          </View>

          {/* Big Stop Button (when alarm sound/vibration is playing) */}
          {isPlayingAlarm && (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
                stopAlarm();
              }}
              className="w-full py-4 rounded-2xl bg-coral items-center justify-center active:opacity-90 min-h-[56px]"
            >
              <Text variant="body" className="font-bold text-white text-base tracking-wide">
                {t("focus.stopAlarmAction")}
              </Text>
            </Pressable>
          )}

          {/* Actions */}
          <View className="w-full gap-2.5 pt-2">
            <Button
              variant="primary"
              title={nextPhaseLabel}
              onPress={() => {
                stopAlarm();
                onNextPhase();
              }}
            />

            {linkedTaskId && onMarkTaskDone && (
              <Button
                variant="secondary"
                title={t("focus.markTaskDoneAction")}
                onPress={() => {
                  stopAlarm();
                  onMarkTaskDone(linkedTaskId);
                }}
              />
            )}

            <Button
              variant="ghost"
              title={t("focus.closeAction")}
              onPress={() => {
                stopAlarm();
                onClose();
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
