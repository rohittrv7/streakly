import { THEME_COLORS } from "@/lib/theme";
import type { TranslationKey } from "@/core/i18n";

export type TaskCategory = "Study" | "Fitness" | "Reading" | "Work" | "Custom";

export interface CategoryConfig {
  key: TaskCategory;
  labelKey: TranslationKey;
  color: string;
  bgTint: string;
  borderTint: string;
}

export const CATEGORIES: TaskCategory[] = [
  "Study",
  "Fitness",
  "Reading",
  "Work",
  "Custom",
];

export const CATEGORY_CONFIG: Record<TaskCategory, CategoryConfig> = {
  Study: {
    key: "Study",
    labelKey: "categories.study",
    color: THEME_COLORS.sky,
    bgTint: "rgba(142, 167, 255, 0.15)",
    borderTint: "rgba(142, 167, 255, 0.28)",
  },
  Fitness: {
    key: "Fitness",
    labelKey: "categories.fitness",
    color: THEME_COLORS.lime,
    bgTint: "rgba(212, 255, 63, 0.15)",
    borderTint: "rgba(212, 255, 63, 0.28)",
  },
  Reading: {
    key: "Reading",
    labelKey: "categories.reading",
    color: THEME_COLORS.coral,
    bgTint: "rgba(255, 122, 89, 0.15)",
    borderTint: "rgba(255, 122, 89, 0.28)",
  },
  Work: {
    key: "Work",
    labelKey: "categories.work",
    color: THEME_COLORS.mint,
    bgTint: "rgba(111, 227, 176, 0.15)",
    borderTint: "rgba(111, 227, 176, 0.28)",
  },
  Custom: {
    key: "Custom",
    labelKey: "categories.custom",
    color: THEME_COLORS.muted,
    bgTint: "rgba(138, 138, 144, 0.15)",
    borderTint: "rgba(138, 138, 144, 0.28)",
  },
};

export function getCategoryConfig(category?: string | null): CategoryConfig {
  if (!category) return CATEGORY_CONFIG.Custom;
  const match = CATEGORIES.find(
    (c) => c.toLowerCase() === category.toLowerCase()
  );
  return match ? CATEGORY_CONFIG[match] : CATEGORY_CONFIG.Custom;
}

export function getCategoryColor(category?: string | null): string {
  return getCategoryConfig(category).color;
}
