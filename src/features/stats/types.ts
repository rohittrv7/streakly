import type { Habit } from "@/features/habits/types";
import type { Task } from "@/features/planner/types";
import type { FocusSession } from "@/features/focus/types";
import type { StatsRange, DateRange } from "./ranges";

export type { StatsRange, DateRange };

export interface StatsRawData {
  habits: Habit[];
  completions: { habitId: string; date: string }[];
  freezes: { habitId: string; date: string }[];
  tasks: Task[];
  focusSessions: FocusSession[];
}

export interface DailyCompletion {
  date: string;
  scheduled: number;
  done: number;
  ratio: number | null; // null when scheduled === 0
}

export interface OverallCompletion {
  done: number;
  scheduled: number;
  percent: number;
}

export interface StreakSummary {
  topStreakHabit: Habit | null;
  topStreak: number;
  bestStreakEver: number;
}

export interface HabitBreakdownItem {
  id: string;
  name: string;
  color: string;
  icon: string;
  percent: number;
  done: number;
  scheduled: number;
  currentStreak: number;
}

export interface TaskSummary {
  done: number;
  missed: number;
  upcoming: number;
  total: number;
  byCategory: Record<string, number>;
}

export interface FocusSummary {
  totalMinutes: number;
  sessionCount: number;
  averagePerDay: number;
  longestSession: number;
  perDayMinutes: { date: string; minutes: number }[];
  perCategoryMinutes: { category: string; minutes: number; percent: number }[];
}

export interface HeatmapCell {
  date: string;
  level: 0 | 1 | 2 | 3 | 4;
  inRange: boolean;
  scheduled: number;
  done: number;
  focusMinutes: number;
}

export interface StatBucket {
  label: string;
  dateOrKey: string;
  value: number;
  sublabel?: string;
}

export interface StatInsight {
  type: "best_weekday" | "top_focus_category" | "consistency";
  title: string;
  description: string;
  value?: string;
}

export interface StatsAggregatedData {
  range: DateRange;
  overall: OverallCompletion;
  previousOverall: OverallCompletion | null;
  deltaPercent: number | null;
  streakSummary: StreakSummary;
  dailyCompletions: DailyCompletion[];
  habitBreakdown: HabitBreakdownItem[];
  taskSummary: TaskSummary;
  focusSummary: FocusSummary;
  heatmapCells: HeatmapCell[];
  consistencyBuckets: StatBucket[];
  focusBuckets: StatBucket[];
  insights: StatInsight[];
  hasData: boolean;
}
