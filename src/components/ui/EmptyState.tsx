import React from "react";
import { View, Text } from "react-native";
import Svg, { Rect, Path, Circle, Line } from "react-native-svg";
import { Button } from "./Button";
import { cn } from "@/core/utils/cn";
import { THEME_COLORS } from "@/lib/theme";
import { useAccent } from "@/lib/theme/store";

export type EmptyIllustrationType =
  | "empty-habits"
  | "empty-tasks"
  | "empty-stats"
  | "all-done";

export interface EmptyStateProps {
  illustration?: React.ReactNode | EmptyIllustrationType;
  title: string;
  description: string;
  actionTitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyHabitsIllustration({ size = 88 }: { size?: number }) {
  const { accent } = useAccent();
  return (
    <Svg width={size} height={size} viewBox="0 0 88 88" fill="none">
      <Rect
        x="12"
        y="16"
        width="64"
        height="56"
        rx="16"
        stroke="rgba(255, 255, 255, 0.12)"
        strokeWidth="2"
        fill={THEME_COLORS.surface}
      />
      <Circle cx="30" cy="36" r="6" stroke={accent.hex} strokeWidth="2" />
      <Line x1="44" y1="36" x2="66" y2="36" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" strokeLinecap="round" />
      <Circle cx="30" cy="52" r="6" stroke={THEME_COLORS.secondary.coral} strokeWidth="2" />
      <Line x1="44" y1="52" x2="58" y2="52" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="2" strokeLinecap="round" />
      <Circle cx="64" cy="22" r="4" fill={accent.hex} />
    </Svg>
  );
}

export function EmptyPlannerIllustration({ size = 88 }: { size?: number }) {
  const { accent } = useAccent();
  return (
    <Svg width={size} height={size} viewBox="0 0 88 88" fill="none">
      <Rect
        x="16"
        y="18"
        width="56"
        height="54"
        rx="14"
        stroke="rgba(255, 255, 255, 0.12)"
        strokeWidth="2"
        fill={THEME_COLORS.surface}
      />
      <Line x1="16" y1="32" x2="72" y2="32" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1.5" />
      <Line x1="28" y1="12" x2="28" y2="20" stroke={THEME_COLORS.secondary.softBlue} strokeWidth="2.5" strokeLinecap="round" />
      <Line x1="60" y1="12" x2="60" y2="20" stroke={THEME_COLORS.secondary.softBlue} strokeWidth="2.5" strokeLinecap="round" />
      <Circle cx="32" cy="46" r="3" fill="rgba(255, 255, 255, 0.2)" />
      <Circle cx="44" cy="46" r="3" fill={accent.hex} />
      <Circle cx="56" cy="46" r="3" fill="rgba(255, 255, 255, 0.2)" />
      <Circle cx="32" cy="58" r="3" fill="rgba(255, 255, 255, 0.2)" />
      <Circle cx="44" cy="58" r="3" fill="rgba(255, 255, 255, 0.2)" />
      <Circle cx="56" cy="58" r="3" fill={THEME_COLORS.secondary.mint} />
    </Svg>
  );
}

export function EmptyStatsIllustration({ size = 88 }: { size?: number }) {
  const { accent } = useAccent();
  return (
    <Svg width={size} height={size} viewBox="0 0 88 88" fill="none">
      <Rect
        x="12"
        y="14"
        width="64"
        height="60"
        rx="16"
        stroke="rgba(255, 255, 255, 0.12)"
        strokeWidth="2"
        fill={THEME_COLORS.surface}
      />
      <Path
        d="M24 60L36 46L48 52L64 32"
        stroke={accent.hex}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="36" cy="46" r="3" fill={THEME_COLORS.secondary.coral} />
      <Circle cx="48" cy="52" r="3" fill={THEME_COLORS.secondary.softBlue} />
      <Circle cx="64" cy="32" r="4" fill={accent.hex} />
      <Line x1="22" y1="64" x2="66" y2="64" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1.5" />
    </Svg>
  );
}

export function EmptyState({
  illustration,
  title,
  description,
  actionTitle,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const resolvedIllustration = (() => {
    if (!illustration) return null;
    if (typeof illustration !== "string") return illustration;
    switch (illustration) {
      case "empty-habits":
        return <EmptyHabitsIllustration />;
      case "empty-tasks":
      case "all-done":
        return <EmptyPlannerIllustration />;
      case "empty-stats":
        return <EmptyStatsIllustration />;
      default:
        return null;
    }
  })();

  const buttonLabel = actionLabel || actionTitle;

  return (
    <View
      className={cn(
        "items-center justify-center py-8 px-6 bg-surface border border-border rounded-card",
        className
      )}
    >
      {resolvedIllustration && <View className="mb-4">{resolvedIllustration}</View>}
      <Text className="text-text-primary font-bold text-lg text-center mb-1">
        {title}
      </Text>
      <Text className="text-text-secondary font-sans text-xs text-center max-w-[260px] leading-relaxed mb-4">
        {description}
      </Text>
      {buttonLabel && onAction && (
        <Button
          variant="primary"
          size="sm"
          title={buttonLabel}
          onPress={onAction}
        />
      )}
    </View>
  );
}
