import React, { useState, useMemo } from "react";
import { View, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Calendar, Clock, Minus, Plus, Sparkle } from "phosphor-react-native";
import { Sheet, Text, Button } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { Haptics } from "@/core/utils/haptics";
import { todayStr } from "@/core/utils/dates";
import { DatePickerSheet } from "@/features/planner/components/DatePickerSheet";
import { TimePickerSheet } from "@/features/planner/components/TimePickerSheet";
import type { TaskCategory } from "@/features/planner/types";
import type { YouTubePlaylistItem } from "../api-types";
import { splitPlaylistIntoDays } from "./split";
import { savePlaylistPlan } from "./save-plan";
import { PlanPreviewList } from "./PlanPreviewList";
import { formatPlanDuration, formatFinishDate } from "./format";
import type { PlanMode } from "./types";

export interface PlanPlaylistSheetProps {
  visible: boolean;
  onClose: () => void;
  playlistId: string;
  playlistTitle: string;
  videos: YouTubePlaylistItem[];
  defaultCategory?: TaskCategory;
}

const WEEKDAYS = [
  { label: "M", day: 1 }, { label: "T", day: 2 }, { label: "W", day: 3 },
  { label: "T", day: 4 }, { label: "F", day: 5 }, { label: "S", day: 6 }, { label: "S", day: 0 },
];

export function PlanPlaylistSheet({
  visible, onClose, playlistId, playlistTitle, videos, defaultCategory = "Study",
}: PlanPlaylistSheetProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState(todayStr());
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [mode, setMode] = useState<PlanMode>("videos_per_day");
  const [videosPerDay, setVideosPerDay] = useState(2);
  const [minutesPerDay, setMinutesPerDay] = useState(60);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [category] = useState<TaskCategory>(defaultCategory);
  const [skippedDates, setSkippedDates] = useState<Set<string>>(new Set());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const plan = useMemo(
    () => splitPlaylistIntoDays(videos, { mode, videosPerDay, minutesPerDay }, startDate, selectedWeekdays, skippedDates),
    [videos, mode, videosPerDay, minutesPerDay, startDate, selectedWeekdays, skippedDates]
  );

  const toggleWeekday = (day: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedWeekdays((p) => p.includes(day) ? (p.length > 1 ? p.filter((d) => d !== day) : p) : [...p, day]);
  };

  const toggleSkipDate = (date: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSkippedDates((p) => { const n = new Set(p); if (n.has(date)) n.delete(date); else n.add(date); return n; });
  };

  const handleCreateTasks = async () => {
    if (plan.days.length === 0 || saving) return;
    setSaving(true);
    try {
      await savePlaylistPlan({ days: plan.days, playlistTitle, playlistId, category, startTime });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      onClose();
      router.push({ pathname: "/(tabs)/planner", params: { date: plan.days[0].date } });
    } catch (err) {
      console.error("Failed to plan playlist:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Sheet visible={visible} onClose={onClose} title="Plan Across Days">
        <ScrollView className="gap-3 pb-2" showsVerticalScrollIndicator={false}>
          {/* Start Date & Time */}
          <View className="flex-row gap-2">
            <Pressable onPress={() => setDatePickerVisible(true)} className="flex-1 p-2.5 rounded-[12px] bg-elevated border border-border flex-row items-center gap-2 min-h-[44px]">
              <Calendar size={18} color={THEME_COLORS.primary} />
              <View><Text variant="caption" className="text-[10px] text-text-muted">Start Date</Text><Text variant="body" className="font-bold text-xs">{startDate}</Text></View>
            </Pressable>
            <Pressable onPress={() => setTimePickerVisible(true)} className="flex-1 p-2.5 rounded-[12px] bg-elevated border border-border flex-row items-center gap-2 min-h-[44px]">
              <Clock size={18} color={THEME_COLORS.primary} />
              <View><Text variant="caption" className="text-[10px] text-text-muted">Time Slot</Text><Text variant="body" className="font-bold text-xs">{startTime || "Anytime"}</Text></View>
            </Pressable>
          </View>

          {/* Weekday Selector */}
          <View className="flex-row justify-between items-center py-1">
            {WEEKDAYS.map((w, i) => {
              const active = selectedWeekdays.includes(w.day);
              return (
                <Pressable
                  key={i}
                  onPress={() => toggleWeekday(w.day)}
                  className={`w-10 h-10 rounded-full items-center justify-center border ${
                    active ? "bg-primary border-primary" : "bg-elevated border-border"
                  }`}
                >
                  <Text className={`font-bold text-xs ${active ? "text-background" : "text-text-secondary"}`}>
                    {w.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Mode Selector */}
          <View className="flex-row bg-elevated rounded-[12px] p-1 border border-border">
            <Pressable
              onPress={() => setMode("videos_per_day")}
              className={`flex-1 py-1.5 rounded-[10px] items-center min-h-[38px] justify-center ${
                mode === "videos_per_day" ? "bg-card border border-border shadow-sm" : ""
              }`}
            >
              <Text className={`font-bold text-xs ${mode === "videos_per_day" ? "text-primary" : "text-text-muted"}`}>
                Videos / Day
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode("minutes_per_day")}
              className={`flex-1 py-1.5 rounded-[10px] items-center min-h-[38px] justify-center ${
                mode === "minutes_per_day" ? "bg-card border border-border shadow-sm" : ""
              }`}
            >
              <Text className={`font-bold text-xs ${mode === "minutes_per_day" ? "text-primary" : "text-text-muted"}`}>
                Minutes / Day
              </Text>
            </Pressable>
          </View>

          {/* Stepper */}
          <View className="flex-row items-center justify-between p-2 bg-card rounded-[12px] border border-border">
            <Text variant="body" className="font-bold text-xs">
              {mode === "videos_per_day" ? "Videos Per Day" : "Minutes Per Day"}
            </Text>
            <View className="flex-row items-center gap-2">
              <Button
                variant="secondary" size="sm" icon={<Minus size={14} color={THEME_COLORS.text.primary} />}
                onPress={() => mode === "videos_per_day" ? setVideosPerDay((v) => Math.max(1, v - 1)) : setMinutesPerDay((m) => Math.max(15, m - 15))}
                className="w-8 h-8 p-0"
              />
              <Text className="font-bold text-xs min-w-[36px] text-center">
                {mode === "videos_per_day" ? videosPerDay : `${minutesPerDay}m`}
              </Text>
              <Button
                variant="secondary" size="sm" icon={<Plus size={14} color={THEME_COLORS.text.primary} />}
                onPress={() => mode === "videos_per_day" ? setVideosPerDay((v) => Math.min(5, v + 1)) : setMinutesPerDay((m) => Math.min(480, m + 15))}
                className="w-8 h-8 p-0"
              />
            </View>
          </View>

          {/* Live Preview Summary Banner */}
          <View className="p-3 rounded-[12px] bg-primary/10 border border-primary/30">
            <View className="flex-row items-center gap-1.5 mb-1">
              <Sparkle size={14} color={THEME_COLORS.primary} weight="fill" />
              <Text className="font-extrabold text-xs text-primary">
                Finishes on {formatFinishDate(plan.finishDate)} · {plan.totalVideos} videos · {formatPlanDuration(plan.totalDurationSeconds)} · {plan.totalDays} days
              </Text>
            </View>
            {plan.hasEstimatedDuration && (
              <Text variant="caption" className="text-[10px] text-text-muted mt-0.5">
                *Some videos have unknown durations, estimated at 10 minutes.
              </Text>
            )}
          </View>

          {/* Per Day Preview List */}
          <PlanPreviewList days={plan.days} skippedDates={skippedDates} onToggleSkipDate={toggleSkipDate} />

          {/* Action Button */}
          <Button
            variant="primary"
            title={saving ? "Creating Tasks..." : `Create ${plan.days.length} Tasks`}
            disabled={plan.days.length === 0 || saving}
            onPress={handleCreateTasks}
            className="mt-1"
          />
        </ScrollView>
      </Sheet>

      <DatePickerSheet visible={datePickerVisible} onClose={() => setDatePickerVisible(false)} selectedDate={startDate} onSelectDate={setStartDate} />
      <TimePickerSheet visible={timePickerVisible} onClose={() => setTimePickerVisible(false)} initialTime={startTime || "09:00"} onSelectTime={(t: string | null) => setStartTime(t)} />
    </>
  );
}
