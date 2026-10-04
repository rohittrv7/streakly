import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { Play, Pause, ArrowCounterClockwise, SkipForward } from "@/components/icons";
import { Haptics } from "@/core/utils/haptics";
import { Pill, Sheet, Text, Button } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import type { FocusMode } from "../timer";

export interface TimerControlsProps {
  mode: FocusMode;
  status: "idle" | "running" | "paused";
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSkip: () => void;
  onSwitchMode: (mode: FocusMode) => void;
}

export function TimerControls({
  mode,
  status,
  onStart,
  onPause,
  onResume,
  onReset,
  onSkip,
  onSwitchMode,
}: TimerControlsProps) {
  const [pendingMode, setPendingMode] = useState<FocusMode | null>(null);

  const handleModePress = (targetMode: FocusMode) => {
    if (targetMode === mode) return;
    if (status === "idle") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      onSwitchMode(targetMode);
    } else {
      setPendingMode(targetMode);
    }
  };

  const confirmSwitch = () => {
    if (pendingMode) {
      onSwitchMode(pendingMode);
      setPendingMode(null);
    }
  };

  const handlePrimaryPress = () => {
    if (status === "running") onPause();
    else if (status === "paused") onResume();
    else onStart();
  };

  return (
    <View className="items-center gap-5 my-2">
      {/* Mode Switcher Pills */}
      <View className="flex-row items-center justify-center gap-2">
        <Pill
          label="Focus"
          selected={mode === "focus"}
          colorDot={THEME_COLORS.lime}
          onPress={() => handleModePress("focus")}
        />
        <Pill
          label="Short Break"
          selected={mode === "short_break"}
          colorDot={THEME_COLORS.mint}
          onPress={() => handleModePress("short_break")}
        />
        <Pill
          label="Long Break"
          selected={mode === "long_break"}
          colorDot={THEME_COLORS.sky}
          onPress={() => handleModePress("long_break")}
        />
      </View>

      {/* Buttons Row */}
      <View className="flex-row items-center justify-center gap-6">
        {/* Reset */}
        <Pressable
          onPress={onReset}
          hitSlop={8}
          className="w-12 h-12 rounded-full bg-surface border border-border items-center justify-center active:opacity-70 active:scale-95"
          accessibilityRole="button"
          accessibilityLabel="Reset timer"
        >
          <ArrowCounterClockwise size={20} color={THEME_COLORS.text.secondary} weight="bold" />
        </Pressable>

        {/* Primary Play / Pause */}
        <Pressable
          onPress={handlePrimaryPress}
          hitSlop={8}
          className="w-20 h-20 rounded-full bg-primary items-center justify-center shadow-lg active:scale-95"
          accessibilityRole="button"
          accessibilityLabel={status === "running" ? "Pause timer" : "Start timer"}
        >
          {status === "running" ? (
            <Pause size={34} color={THEME_COLORS.background} weight="fill" />
          ) : (
            <View style={{ marginLeft: 3 }}>
              <Play size={34} color={THEME_COLORS.background} weight="fill" />
            </View>
          )}
        </Pressable>

        {/* Skip */}
        <Pressable
          onPress={onSkip}
          hitSlop={8}
          className="w-12 h-12 rounded-full bg-surface border border-border items-center justify-center active:opacity-70 active:scale-95"
          accessibilityRole="button"
          accessibilityLabel="Skip to next session"
        >
          <SkipForward size={20} color={THEME_COLORS.text.secondary} weight="bold" />
        </Pressable>
      </View>

      {/* Mode Switch Confirmation Sheet */}
      <Sheet
        visible={pendingMode !== null}
        onClose={() => setPendingMode(null)}
        title="Switch Mode?"
      >
        <View className="gap-4 pb-2">
          <Text variant="body" className="text-text-secondary">
            A session is currently in progress. Switching modes will cancel the current session.
          </Text>
          <View className="gap-2">
            <Button variant="primary" title="Switch Mode" onPress={confirmSwitch} />
            <Button variant="secondary" title="Keep Going" onPress={() => setPendingMode(null)} />
          </View>
        </View>
      </Sheet>
    </View>
  );
}
