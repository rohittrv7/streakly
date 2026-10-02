import { addDays, toDateStr } from "@/core/utils/dates";
import { parseISO } from "date-fns";
import type { YouTubePlaylistItem } from "../api-types";
import type { PlanRule, DayPlan, PlanSummary } from "./types";

const DEFAULT_ESTIMATED_SECONDS = 600; // 10 minutes
const MAX_SEARCH_DAYS = 366;

export function splitPlaylistIntoDays(
  videos: YouTubePlaylistItem[],
  rule: PlanRule,
  startDateStr: string,
  weekdays: number[] = [0, 1, 2, 3, 4, 5, 6],
  skippedDates: Set<string> = new Set()
): PlanSummary {
  if (!videos || videos.length === 0) {
    return {
      days: [],
      finishDate: startDateStr,
      totalVideos: 0,
      totalDurationSeconds: 0,
      totalDays: 0,
      hasEstimatedDuration: false,
    };
  }

  const weekdaySet = new Set(weekdays.length > 0 ? weekdays : [0, 1, 2, 3, 4, 5, 6]);
  const isVideoMode = rule.mode === "videos_per_day";
  const perDayLimit = Math.max(1, rule.videosPerDay || 1);
  const maxSecondsPerDay = Math.max(15, rule.minutesPerDay || 60) * 60;

  const rawDayPlans: Array<{
    date: string;
    videos: YouTubePlaylistItem[];
    totalDurationSeconds: number;
    hasEstimatedDuration: boolean;
  }> = [];

  let videoIndex = 0;
  let currentDateStr = startDateStr;
  let daysSearched = 0;

  while (videoIndex < videos.length && daysSearched < MAX_SEARCH_DAYS) {
    const d = parseISO(`${currentDateStr}T12:00:00`);
    const dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon ...
    daysSearched++;

    // Check if this date is eligible
    if (!weekdaySet.has(dayOfWeek) || skippedDates.has(currentDateStr)) {
      currentDateStr = addDays(currentDateStr, 1);
      continue;
    }

    const dayVideos: YouTubePlaylistItem[] = [];
    let dayDuration = 0;
    let dayHasEst = false;

    if (isVideoMode) {
      // Videos per day mode
      while (videoIndex < videos.length && dayVideos.length < perDayLimit) {
        const v = videos[videoIndex++];
        dayVideos.push(v);
        const dur = v.durationSeconds && v.durationSeconds > 0 ? v.durationSeconds : DEFAULT_ESTIMATED_SECONDS;
        if (!v.durationSeconds || v.durationSeconds <= 0) dayHasEst = true;
        dayDuration += dur;
      }
    } else {
      // Minutes per day mode (greedy packing)
      while (videoIndex < videos.length) {
        const nextVideo = videos[videoIndex];
        const nextDur = nextVideo.durationSeconds && nextVideo.durationSeconds > 0
          ? nextVideo.durationSeconds
          : DEFAULT_ESTIMATED_SECONDS;
        const isEst = !nextVideo.durationSeconds || nextVideo.durationSeconds <= 0;

        // If day already has videos and adding this exceeds limit, save for tomorrow
        if (dayVideos.length > 0 && dayDuration + nextDur > maxSecondsPerDay) {
          break;
        }

        // Add video (if first video exceeds limit, it gets its own day)
        dayVideos.push(nextVideo);
        dayDuration += nextDur;
        if (isEst) dayHasEst = true;
        videoIndex++;

        // If this single video was >= daily limit, stop adding more to this day
        if (dayDuration >= maxSecondsPerDay) {
          break;
        }
      }
    }

    if (dayVideos.length > 0) {
      rawDayPlans.push({
        date: currentDateStr,
        videos: dayVideos,
        totalDurationSeconds: dayDuration,
        hasEstimatedDuration: dayHasEst,
      });
    }

    currentDateStr = addDays(currentDateStr, 1);
  }

  const totalDays = rawDayPlans.length;
  let overallDuration = 0;
  let overallHasEst = false;

  const days: DayPlan[] = rawDayPlans.map((p, idx) => {
    overallDuration += p.totalDurationSeconds;
    if (p.hasEstimatedDuration) overallHasEst = true;
    return {
      date: p.date,
      dayIndex: idx + 1,
      totalDays,
      videos: p.videos,
      totalDurationSeconds: p.totalDurationSeconds,
      hasEstimatedDuration: p.hasEstimatedDuration,
    };
  });

  const finishDate = days.length > 0 ? days[days.length - 1].date : startDateStr;

  return {
    days,
    finishDate,
    totalVideos: videos.length,
    totalDurationSeconds: overallDuration,
    totalDays,
    hasEstimatedDuration: overallHasEst,
  };
}
