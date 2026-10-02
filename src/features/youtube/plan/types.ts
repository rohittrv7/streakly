import type { YouTubePlaylistItem } from "../api-types";

export type PlanMode = "videos_per_day" | "minutes_per_day";

export interface PlanRule {
  mode: PlanMode;
  videosPerDay?: number; // 1 - 5
  minutesPerDay?: number; // 15 - 480
}

export interface DayPlan {
  date: string; // YYYY-MM-DD
  dayIndex: number; // 1 to totalDays
  totalDays: number;
  videos: YouTubePlaylistItem[];
  totalDurationSeconds: number;
  hasEstimatedDuration: boolean;
}

export interface PlanSummary {
  days: DayPlan[];
  finishDate: string;
  totalVideos: number;
  totalDurationSeconds: number;
  totalDays: number;
  hasEstimatedDuration: boolean;
}
