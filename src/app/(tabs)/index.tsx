import React, { useState } from "react";
import { View, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { Screen, EmptyState, Skeleton, Stagger } from "@/components/ui";
import {
  useTodayData,
  TodayHeader,
  TodayWeekStrip,
  TodayBentoGrid,
  TodayTimeline,
} from "@/features/today";
import { THEME_COLORS } from "@/lib/theme";
import { useT } from "@/core/i18n";

export default function TodayScreen() {
  const router = useRouter();
  const { t } = useT();
  const [refreshing, setRefreshing] = useState(false);

  const {
    selectedDate,
    setSelectedDate,
    currentToday,
    isFutureDate,
    greeting,
    dateLabel,
    timelineSections,
    allTimelineItems,
    dayProgress,
    topStreakInfo,
    habitsDoneCount,
    habitsTotalCount,
    tasksDoneCount,
    tasksTotalCount,
    focusMinutes,
    loading,
    reloadAll,
    toggleHabit,
    toggleTask,
  } = useTodayData();

  const handleRefresh = async () => {
    setRefreshing(true);
    await reloadAll();
    setRefreshing(false);
  };

  const isAllDone = allTimelineItems.length > 0 && dayProgress.ratio === 1;

  return (
    <Screen
      scroll
      withTabBarInset
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={THEME_COLORS.primary}
          colors={[THEME_COLORS.primary]}
        />
      }
    >
      <TodayHeader greeting={greeting} dateLabel={dateLabel} />

      <TodayWeekStrip
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        today={currentToday}
      />

      {loading && allTimelineItems.length === 0 ? (
        <View className="gap-3 mt-2">
          <Skeleton height={120} borderRadius={24} />
          <Skeleton height={60} borderRadius={16} />
          <Skeleton height={80} borderRadius={20} />
          <Skeleton height={80} borderRadius={20} />
        </View>
      ) : (
        <Stagger delay={50}>
          <TodayBentoGrid
            topStreakHabit={topStreakInfo.habit}
            topStreak={topStreakInfo.streak}
            dayDone={dayProgress.done}
            dayTotal={dayProgress.total}
            dayRatio={dayProgress.ratio}
            habitsDone={habitsDoneCount}
            habitsTotal={habitsTotalCount}
            tasksDone={tasksDoneCount}
            tasksTotal={tasksTotalCount}
            focusMinutes={focusMinutes}
          />

          {allTimelineItems.length === 0 ? (
            <EmptyState
              illustration="empty-planner"
              title={t("today.nothingScheduled")}
              description={t("today.nothingScheduledDesc")}
              actionLabel={t("today.createHabitAction")}
              onAction={() => router.push("/habit/new")}
              className="mt-2"
            />
          ) : (
            <View>
              {isAllDone && (
                <EmptyState
                  illustration="all-done"
                  title={t("today.allDoneTitle")}
                  description={t("today.allDoneDesc")}
                  actionLabel={t("today.viewAllHabits")}
                  onAction={() => router.push("/(tabs)/habits")}
                  className="mb-4"
                />
              )}
              <TodayTimeline
                sections={timelineSections}
                canToggle={!isFutureDate}
                onToggleHabit={(id) => toggleHabit(id, selectedDate)}
                onToggleTask={(id) => toggleTask(id)}
              />
            </View>
          )}
        </Stagger>
      )}
    </Screen>
  );
}
