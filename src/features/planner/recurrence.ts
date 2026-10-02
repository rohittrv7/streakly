import { parseISO } from "date-fns";
import { addDays, toDateStr } from "@/core/utils/dates";

export type RecurrenceRule =
  | { type: "weekdays"; weekdays: number[]; from: string; to: string }
  | { type: "next_n_days"; start: string; n: number }
  | { type: "daily"; from: string; to: string };

const MAX_RECURRENCE_DATES = 366;

/**
 * Expands a recurrence rule into a sorted unique list of YYYY-MM-DD dates.
 */
export function expandRecurrence(rule: RecurrenceRule): string[] {
  const datesSet = new Set<string>();

  if (rule.type === "weekdays") {
    if (rule.from > rule.to || !rule.weekdays || rule.weekdays.length === 0) {
      return [];
    }

    let curr = rule.from;
    const weekdaySet = new Set(rule.weekdays);
    let count = 0;

    while (curr <= rule.to && count < MAX_RECURRENCE_DATES) {
      const day = parseISO(`${curr}T12:00:00`).getDay();
      if (weekdaySet.has(day)) {
        datesSet.add(curr);
        count++;
      }
      curr = toDateStr(addDays(curr, 1));
    }
  } else if (rule.type === "next_n_days") {
    if (rule.n <= 0) return [];
    const count = Math.min(rule.n, MAX_RECURRENCE_DATES);

    for (let i = 0; i < count; i++) {
      datesSet.add(toDateStr(addDays(rule.start, i)));
    }
  } else if (rule.type === "daily") {
    if (rule.from > rule.to) return [];

    let curr = rule.from;
    let count = 0;

    while (curr <= rule.to && count < MAX_RECURRENCE_DATES) {
      datesSet.add(curr);
      count++;
      curr = toDateStr(addDays(curr, 1));
    }
  }

  return Array.from(datesSet).sort();
}
