import React, { useState, useEffect, useMemo } from "react";
import { View, Pressable, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { Plus } from "@/components/icons";
import { parseISO, format } from "date-fns";
import { Haptics } from "@/core/utils/haptics";
import { Screen, Text, EmptyState, Skeleton, Stagger, useTabBarInset } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { todayStr } from "@/core/utils/dates";
import {
  usePlanner,
  useTasksForDate,
  MonthCalendar,
  MonthProgressCard,
  PlannerTaskList,
  RescheduleSheet,
  shiftMonth,
  getTaskDotsByDate,
  getMonthProgress,
  type Task,
} from "@/features/planner";
import { PlannerHeader } from "@/features/planner/components/PlannerHeader";

export default function PlannerScreen() {
  const router = useRouter();
  const tabBarInset = useTabBarInset();
  const currentToday = todayStr();

  const [selectedDate, setSelectedDate] = useState(currentToday);
  const [year, setYear] = useState(() => parseInt(currentToday.slice(0, 4), 10));
  const [month, setMonth] = useState(() => parseInt(currentToday.slice(5, 7), 10));
  const [refreshing, setRefreshing] = useState(false);
  const [rescheduleTaskTarget, setRescheduleTaskTarget] = useState<Task | null>(null);

  const { tasks, loading, loadMonth, toggleTaskDone, rescheduleTask } = usePlanner();
  const dayTasks = useTasksForDate(selectedDate);

  useEffect(() => {
    loadMonth(year, month);
  }, [year, month, loadMonth]);

  const handlePrevMonth = () => {
    const next = shiftMonth(year, month, -1);
    setYear(next.year);
    setMonth(next.month);
  };

  const handleNextMonth = () => {
    const next = shiftMonth(year, month, 1);
    setYear(next.year);
    setMonth(next.month);
  };

  const handleJumpToday = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedDate(currentToday);
    setYear(parseInt(currentToday.slice(0, 4), 10));
    setMonth(parseInt(currentToday.slice(5, 7), 10));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMonth(year, month);
    setRefreshing(false);
  };

  const taskDots = useMemo(() => getTaskDotsByDate(tasks), [tasks]);
  const progress = useMemo(() => {
    const monthTasks = tasks.filter((t) => {
      const tYear = parseInt(t.date.slice(0, 4), 10);
      const tMonth = parseInt(t.date.slice(5, 7), 10);
      return tYear === year && tMonth === month;
    });
    return getMonthProgress(monthTasks, currentToday);
  }, [tasks, year, month, currentToday]);

  const monthLabel = useMemo(() => {
    const d = parseISO(`${year}-${month < 10 ? `0${month}` : month}-01T12:00:00`);
    return format(d, "MMMM yyyy");
  }, [year, month]);

  const dayLabel = useMemo(() => {
    try {
      const d = parseISO(`${selectedDate}T12:00:00`);
      return format(d, "EEEE, MMM d");
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  return (
    <View className="flex-1 bg-background">
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
        <Stagger delay={50}>
          <PlannerHeader
            monthLabel={monthLabel}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            showTodayButton={selectedDate !== currentToday}
            onJumpToday={handleJumpToday}
            onPlanMonth={() => router.push("/plan-month")}
          />

          <MonthCalendar
            year={year}
            month={month}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            taskDots={taskDots}
            today={currentToday}
          />

          <View className="mt-3">
            <MonthProgressCard {...progress} />
          </View>

          <View className="flex-row items-center justify-between mb-3 mt-1">
            <View className="flex-row items-center gap-2">
              <Text variant="label" className="text-text-primary text-sm font-bold tracking-wider">{dayLabel}</Text>
              <View className="bg-elevated px-2 py-0.5 rounded-pill border border-border">
                <Text variant="caption" className="font-bold text-[11px] text-text-secondary">{dayTasks.length}</Text>
              </View>
            </View>
          </View>

          {loading && tasks.length === 0 ? (
            <View className="gap-2.5">
              <Skeleton height={68} borderRadius={16} />
              <Skeleton height={68} borderRadius={16} />
            </View>
          ) : (
            <PlannerTaskList
              tasks={dayTasks}
              today={currentToday}
              selectedDate={selectedDate}
              onToggleTask={toggleTaskDone}
              onReschedule={(t) => setRescheduleTaskTarget(t)}
            />
          )}
        </Stagger>
      </Screen>

      <Pressable
        onPress={() => router.push({ pathname: "/task/new", params: { date: selectedDate } })}
        style={{ bottom: tabBarInset + 12 }}
        className="absolute right-5 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg active:scale-95"
        accessibilityRole="button"
        accessibilityLabel="Add Task"
      >
        <Plus size={26} color={THEME_COLORS.background} weight="bold" />
      </Pressable>

      {rescheduleTaskTarget && (
        <RescheduleSheet
          visible={rescheduleTaskTarget !== null}
          onClose={() => setRescheduleTaskTarget(null)}
          taskTitle={rescheduleTaskTarget.title}
          onReschedule={(newDate) => rescheduleTask(rescheduleTaskTarget.id, newDate)}
        />
      )}
    </View>
  );
}
