import { cn } from "@/core/utils/cn";
import {
  todayStr,
  toDateStr,
  addDays,
  getWeekDays,
  isScheduledOn,
} from "@/core/utils/dates";
import { THEME_COLORS, THEME_FONTS, THEME_RADIUS } from "@/lib/theme";

describe("core/utils/cn", () => {
  it("merges class names correctly without conflict", () => {
    const result = cn("p-4", "text-primary", false && "hidden", "bg-surface");
    expect(result).toBe("p-4 text-primary bg-surface");
  });

  it("handles tailwind class overrides properly", () => {
    const result = cn("p-4", "p-6");
    expect(result).toBe("p-6");
  });
});

describe("core/utils/dates", () => {
  it("todayStr returns date in YYYY-MM-DD format", () => {
    const today = todayStr();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("toDateStr formats string, date and timestamp properly", () => {
    expect(toDateStr("2026-10-01")).toBe("2026-10-01");
    const d = new Date(2026, 9, 15); // Oct 15, 2026
    expect(toDateStr(d)).toBe("2026-10-15");
  });

  it("addDays correctly shifts days forward and backward", () => {
    const base = "2026-10-01";
    expect(addDays(base, 5)).toBe("2026-10-06");
    expect(addDays(base, -1)).toBe("2026-09-30");
  });

  it("getWeekDays returns 7 consecutive days", () => {
    const week = getWeekDays("2026-10-01");
    expect(week).toHaveLength(7);
    expect(week[0]).toHaveProperty("dateStr");
    expect(week[0]).toHaveProperty("dayNumber");
    expect(week[0]).toHaveProperty("dayShort");
  });

  it("isScheduledOn evaluates daily and custom schedules accurately", () => {
    expect(isScheduledOn("daily", "2026-10-01")).toBe(true);
    expect(isScheduledOn({ type: "daily" }, "2026-10-01")).toBe(true);

    // 2026-10-01 is a Thursday (day 4)
    expect(
      isScheduledOn({ type: "specific_days", days: [4] }, "2026-10-01")
    ).toBe(true);
    expect(
      isScheduledOn({ type: "specific_days", days: [1, 2] }, "2026-10-01")
    ).toBe(false);
  });
});

describe("Theme Tokens", () => {
  it("has the warm dark theme colors and lime primary defined", () => {
    expect(THEME_COLORS.background).toBe("#0F0F10");
    expect(THEME_COLORS.surface).toBe("#1A1A1C");
    expect(THEME_COLORS.elevated).toBe("#232326");
    expect(THEME_COLORS.primary).toBe("#D4FF3F");
    expect(THEME_COLORS.secondary.coral).toBe("#FF7A59");
    expect(THEME_COLORS.secondary.softBlue).toBe("#8EA7FF");
    expect(THEME_COLORS.secondary.mint).toBe("#6FE3B0");
  });

  it("has Plus Jakarta Sans fonts and radius defined", () => {
    expect(THEME_FONTS.bold).toBe("PlusJakartaSans-Bold");
    expect(THEME_RADIUS.card).toBe(24);
    expect(THEME_RADIUS.pill).toBe(9999);
  });
});
