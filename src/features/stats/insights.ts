import { parseISO } from "date-fns";
import type { DailyCompletion, FocusSummary, StatInsight } from "./types";
import { formatMinutes } from "./format";

interface InsightInput {
  dailyCompletions: DailyCompletion[];
  focusSummary: FocusSummary;
}

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function getInsights(data: InsightInput): StatInsight[] {
  const { dailyCompletions, focusSummary } = data;
  if (dailyCompletions.length < 5) {
    return [];
  }

  const totalScheduled = dailyCompletions.reduce((acc, d) => acc + d.scheduled, 0);
  const totalDone = dailyCompletions.reduce((acc, d) => acc + d.done, 0);
  if (totalScheduled === 0 && totalDone === 0 && focusSummary.totalMinutes === 0) {
    return [];
  }

  const insights: StatInsight[] = [];

  // 1. Best weekday
  const weekdayTotals: Record<number, { done: number; scheduled: number }> = {};
  for (let i = 0; i < 7; i++) {
    weekdayTotals[i] = { done: 0, scheduled: 0 };
  }

  for (const dc of dailyCompletions) {
    if (dc.scheduled > 0) {
      const d = parseISO(`${dc.date}T12:00:00`);
      const day = d.getDay();
      weekdayTotals[day].scheduled += dc.scheduled;
      weekdayTotals[day].done += dc.done;
    }
  }

  let bestDayIndex = -1;
  let bestRate = -1;

  for (let i = 0; i < 7; i++) {
    const { done, scheduled } = weekdayTotals[i];
    if (scheduled >= 2) {
      const rate = done / scheduled;
      if (rate > bestRate) {
        bestRate = rate;
        bestDayIndex = i;
      }
    }
  }

  if (bestDayIndex !== -1 && bestRate > 0) {
    const dayName = WEEKDAY_NAMES[bestDayIndex];
    const pct = Math.round(bestRate * 100);
    insights.push({
      type: "best_weekday",
      title: "Best Weekday",
      description: `${dayName} is your strongest day with ${pct}% completion.`,
      value: dayName,
    });
  }

  // 2. Consistency
  const activeDays = dailyCompletions.filter((d) => d.done >= 1).length;
  const totalDays = dailyCompletions.length;
  if (totalDays > 0 && activeDays > 0) {
    const consistencyPct = Math.round((activeDays / totalDays) * 100);
    insights.push({
      type: "consistency",
      title: "Consistency",
      description: `Active on ${activeDays} of ${totalDays} days in this period.`,
      value: `${consistencyPct}%`,
    });
  }

  // 3. Top focus category
  if (focusSummary.totalMinutes > 0 && focusSummary.perCategoryMinutes.length > 0) {
    const top = focusSummary.perCategoryMinutes[0];
    const catName = top.category.charAt(0).toUpperCase() + top.category.slice(1);
    insights.push({
      type: "top_focus_category",
      title: "Top Focus Area",
      description: `${catName} took ${top.percent}% of focus time (${formatMinutes(top.minutes)}).`,
      value: catName,
    });
  }

  return insights.slice(0, 3);
}
