import React, { useEffect, useState } from "react";
import { View, Pressable } from "react-native";
import { Timer, GearSix } from "phosphor-react-native";
import { Screen, Text, Stagger, Skeleton } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { plannerRepo } from "@/features/planner/repo";
import {
  useFocusStore,
  useFocusTimer,
  useFocusStats,
  TimerClockRing,
  TimerControls,
  SessionCycleIndicator,
  FocusTaskCard,
  TodayFocusSessionsCard,
  FocusSettingsSheet,
  PreNotificationPermissionSheet,
  FinishedWhileAwaySheet,
  FocusCompletionOverlay,
} from "@/features/focus";

export default function FocusScreen() {
  const [settingsVisible, setSettingsVisible] = useState(false);

  const init = useFocusStore((s) => s.init);
  const loading = useFocusStore((s) => s.loading);
  const settings = useFocusStore((s) => s.settings);
  const selectedTaskId = useFocusStore((s) => s.selectedTaskId);
  const selectedCategory = useFocusStore((s) => s.selectedCategory);
  const finishedWhileAway = useFocusStore((s) => s.finishedWhileAway);
  const showPrePermissionSheet = useFocusStore((s) => s.showPrePermissionSheet);

  const start = useFocusStore((s) => s.start);
  const pause = useFocusStore((s) => s.pause);
  const resume = useFocusStore((s) => s.resume);
  const reset = useFocusStore((s) => s.reset);
  const skip = useFocusStore((s) => s.skip);
  const setMode = useFocusStore((s) => s.setMode);
  const updateSettings = useFocusStore((s) => s.updateSettings);
  const deleteSession = useFocusStore((s) => s.deleteSession);
  const selectTask = useFocusStore((s) => s.selectTask);
  const selectCategory = useFocusStore((s) => s.selectCategory);
  const dismissFinishedWhileAway = useFocusStore((s) => s.dismissFinishedWhileAway);
  const setShowPrePermissionSheet = useFocusStore((s) => s.setShowPrePermissionSheet);
  const completionOverlay = useFocusStore((s) => s.completionOverlay);
  const hideCompletionOverlay = useFocusStore((s) => s.hideCompletionOverlay);

  const { mode, status, progress, completedFocusCount, clock } = useFocusTimer();
  const { sessions, todayMinutes, todaySessionCount } = useFocusStats();

  useEffect(() => {
    init();
  }, [init]);

  if (loading) {
    return (
      <Screen scroll withTabBarInset>
        <View className="pt-4 pb-6 gap-3">
          <Skeleton width="40%" height={24} />
          <Skeleton width="60%" height={36} />
        </View>
        <View className="items-center my-6">
          <Skeleton width={240} height={240} borderRadius={120} />
        </View>
        <View className="gap-3 mt-4">
          <Skeleton width="100%" height={56} borderRadius={16} />
          <Skeleton width="100%" height={120} borderRadius={16} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll withTabBarInset>
      <Stagger delay={60}>
        {/* Header with Title & Settings Button */}
        <View className="flex-row items-center justify-between pt-4 pb-2">
          <View>
            <View className="flex-row items-center gap-1.5 mb-1">
              <Timer size={14} color={THEME_COLORS.primary} weight="fill" />
              <Text variant="label">FOCUS</Text>
            </View>
            <Text variant="display">Deep Work</Text>
          </View>

          <Pressable
            onPress={() => setSettingsVisible(true)}
            hitSlop={8}
            className="w-11 h-11 rounded-full bg-elevated border border-border items-center justify-center active:opacity-70"
            accessibilityRole="button"
            accessibilityLabel="Timer settings"
          >
            <GearSix size={20} color={THEME_COLORS.text.secondary} weight="bold" />
          </Pressable>
        </View>

        {/* Large Progress Ring & Clock */}
        <TimerClockRing
          mode={mode}
          clock={clock}
          progress={progress}
          cycleCount={completedFocusCount}
          cycleTotal={settings.sessionsBeforeLongBreak}
        />

        {/* Session Cycle Indicator */}
        <SessionCycleIndicator
          mode={mode}
          completedCount={completedFocusCount}
          total={settings.sessionsBeforeLongBreak}
          isRunning={status === "running"}
        />

        {/* Controls */}
        <TimerControls
          mode={mode}
          status={status}
          onStart={start}
          onPause={pause}
          onResume={resume}
          onReset={reset}
          onSkip={skip}
          onSwitchMode={setMode}
        />

        {/* Task linking card */}
        <View className="my-3">
          <FocusTaskCard
            selectedTaskId={selectedTaskId}
            selectedCategory={selectedCategory}
            onSelectTask={selectTask}
            onSelectCategory={selectCategory}
          />
        </View>

        {/* Today's Focus Log */}
        <TodayFocusSessionsCard
          sessions={sessions}
          todayMinutes={todayMinutes}
          todaySessionCount={todaySessionCount}
          onDeleteSession={deleteSession}
        />
      </Stagger>

      {/* Sheets */}
      <FocusSettingsSheet
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
      />

      <PreNotificationPermissionSheet
        visible={showPrePermissionSheet}
        onClose={() => setShowPrePermissionSheet(false)}
      />

      <FinishedWhileAwaySheet
        visible={finishedWhileAway && !completionOverlay?.visible}
        onClose={dismissFinishedWhileAway}
      />

      {completionOverlay && (
        <FocusCompletionOverlay
          visible={completionOverlay.visible}
          withSound={completionOverlay.withSound}
          completedMode={completionOverlay.completedMode}
          linkedTaskId={completionOverlay.linkedTaskId}
          onClose={hideCompletionOverlay}
          onNextPhase={() => {
            hideCompletionOverlay();
            start();
          }}
          onMarkTaskDone={async (taskId) => {
            await plannerRepo.toggleDone(taskId);
            hideCompletionOverlay();
          }}
        />
      )}
    </Screen>
  );
}
