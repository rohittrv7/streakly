import { parseISO, format } from "date-fns";
import type { StatBucket, DateRange } from "./types";

interface DailyItem {
  date: string;
  value: number; // e.g. percent (0-100) or minutes
}

export function getBuckets(
  range: DateRange,
  perDay: DailyItem[],
  aggregateMode: "average" | "sum" = "average"
): StatBucket[] {
  if (perDay.length === 0) return [];

  if (range.range === "7d") {
    return perDay.map((item) => {
      const d = parseISO(`${item.date}T12:00:00`);
      return {
        label: format(d, "EEE"), // e.g. Mon, Tue
        dateOrKey: item.date,
        value: Math.round(item.value),
        sublabel: format(d, "d"),
      };
    });
  }

  if (range.range === "30d") {
    return perDay.map((item, index) => {
      const d = parseISO(`${item.date}T12:00:00`);
      // Thinned labels: show day of month for 1st, 5th, 10th, 15th, 20th, 25th, or last
      const dayNum = d.getDate();
      const showLabel = dayNum === 1 || dayNum % 5 === 0 || index === perDay.length - 1;
      return {
        label: showLabel ? format(d, "d MMM") : "",
        dateOrKey: item.date,
        value: Math.round(item.value),
        sublabel: format(d, "d"),
      };
    });
  }

  // 90d -> 13 weekly buckets
  const buckets: StatBucket[] = [];
  const chunkSize = 7;
  for (let i = 0; i < perDay.length; i += chunkSize) {
    const chunk = perDay.slice(i, i + chunkSize);
    if (chunk.length === 0) continue;

    let bucketValue = 0;
    if (aggregateMode === "sum") {
      bucketValue = chunk.reduce((acc, c) => acc + c.value, 0);
    } else {
      const sum = chunk.reduce((acc, c) => acc + c.value, 0);
      bucketValue = Math.round(sum / chunk.length);
    }

    const firstDate = chunk[0].date;
    const d = parseISO(`${firstDate}T12:00:00`);
    const weekIndex = Math.floor(i / chunkSize) + 1;
    // Thin weekly labels: every other week or month transitions
    const showLabel = weekIndex === 1 || weekIndex % 3 === 0 || i + chunkSize >= perDay.length;

    buckets.push({
      label: showLabel ? format(d, "d MMM") : "",
      dateOrKey: `W${weekIndex}_${firstDate}`,
      value: bucketValue,
      sublabel: `W${weekIndex}`,
    });
  }

  return buckets;
}
