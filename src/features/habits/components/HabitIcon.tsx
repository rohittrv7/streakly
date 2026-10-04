import React from "react";
import {
  Book,
  Barbell,
  Drop,
  Moon,
  Brain,
  Code,
  MusicNote,
  Fire,
  Heart,
  Sun,
  Sparkle,
  Coffee,
  Bicycle,
  Leaf,
  PencilSimple,
  Clock,
  Smiley,
  CheckCircle,
  Target,
  Trophy,
  Star,
  Globe,
  Sneaker,
  Bed,
} from "@/components/icons";
import { THEME_COLORS } from "@/lib/theme";

export const DEFAULT_HABIT_ICON = "target" as const;

export const HABIT_ICON_KEYS = [
  "run",
  "book",
  "drop",
  "code",
  "moon",
  "barbell",
  "brain",
  "music",
  "fire",
  "heart",
  "sun",
  "sparkle",
  "coffee",
  "bicycle",
  "leaf",
  "bed",
  "pencil",
  "clock",
  "smile",
  "check",
  "target",
  "trophy",
  "star",
  "globe",
] as const;

export type HabitIconKey = (typeof HABIT_ICON_KEYS)[number];

export const HABIT_ICON_MAP: Record<HabitIconKey, React.ComponentType<any>> = {
  run: Sneaker,
  book: Book,
  drop: Drop,
  code: Code,
  moon: Moon,
  barbell: Barbell,
  brain: Brain,
  music: MusicNote,
  fire: Fire,
  heart: Heart,
  sun: Sun,
  sparkle: Sparkle,
  coffee: Coffee,
  bicycle: Bicycle,
  leaf: Leaf,
  bed: Bed,
  pencil: PencilSimple,
  clock: Clock,
  smile: Smiley,
  check: CheckCircle,
  target: Target,
  trophy: Trophy,
  star: Star,
  globe: Globe,
};

export const AVAILABLE_HABIT_ICONS = HABIT_ICON_KEYS;

const ICON_ALIASES: Record<string, HabitIconKey> = {
  PersonSimpleRun: "run",
  BookOpen: "book",
  Drop: "drop",
  Code: "code",
  Moon: "moon",
  sneaker: "run",
};

export function resolveHabitIcon(iconName?: string | null): HabitIconKey {
  if (!iconName) return DEFAULT_HABIT_ICON;
  if (iconName in ICON_ALIASES) return ICON_ALIASES[iconName];
  const lower = iconName.toLowerCase();
  if (lower in ICON_ALIASES) return ICON_ALIASES[lower];
  if ((HABIT_ICON_KEYS as readonly string[]).includes(lower)) {
    return lower as HabitIconKey;
  }
  return DEFAULT_HABIT_ICON;
}

interface HabitIconProps {
  name: string;
  size?: number;
  color?: string;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
}

export function HabitIcon({
  name,
  size = 20,
  color = THEME_COLORS.primary,
  weight = "fill",
}: HabitIconProps) {
  const resolved = resolveHabitIcon(name);
  const IconComponent = HABIT_ICON_MAP[resolved] || Target;
  return <IconComponent size={size} color={color} weight={weight} />;
}
