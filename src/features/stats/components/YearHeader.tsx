import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, CaretLeft, CaretRight } from "@/components/icons";
import { THEME_COLORS } from "@/lib/theme";
import { useT } from "@/core/i18n";

interface YearHeaderProps {
  year: number;
  earliestYear: number;
  currentYear: number;
  onSelectYear: (year: number) => void;
}

export function YearHeader({
  year,
  earliestYear,
  currentYear,
  onSelectYear,
}: YearHeaderProps) {
  const router = useRouter();
  const { t } = useT();

  const canGoPrev = year > earliestYear;
  const canGoNext = year < currentYear;

  return (
    <View className="flex-row items-center justify-between pb-3 pt-2">
      {/* Back Button (44x44px touch target) */}
      <Pressable
        onPress={() => router.back()}
        hitSlop={8}
        className="w-11 h-11 rounded-full bg-elevated border border-border items-center justify-center active:opacity-60 shrink-0"
        accessibilityRole="button"
        accessibilityLabel={t("common.back")}
      >
        <ArrowLeft size={20} color={THEME_COLORS.text.primary} weight="bold" />
      </Pressable>

      {/* Year Switcher */}
      <View className="flex-row items-center gap-2 bg-surface px-2 py-1 rounded-2xl border border-white/5">
        <Pressable
          onPress={() => canGoPrev && onSelectYear(year - 1)}
          disabled={!canGoPrev}
          hitSlop={8}
          className="w-11 h-11 items-center justify-center rounded-xl active:opacity-60"
          style={{ opacity: canGoPrev ? 1 : 0.3 }}
          accessibilityRole="button"
          accessibilityLabel={`Previous year ${year - 1}`}
        >
          <CaretLeft size={18} color={THEME_COLORS.text.primary} weight="bold" />
        </Pressable>

        <Text className="text-text-primary text-base font-bold min-w-[50px] text-center">
          {year}
        </Text>

        <Pressable
          onPress={() => canGoNext && onSelectYear(year + 1)}
          disabled={!canGoNext}
          hitSlop={8}
          className="w-11 h-11 items-center justify-center rounded-xl active:opacity-60"
          style={{ opacity: canGoNext ? 1 : 0.3 }}
          accessibilityRole="button"
          accessibilityLabel={`Next year ${year + 1}`}
        >
          <CaretRight size={18} color={THEME_COLORS.text.primary} weight="bold" />
        </Pressable>
      </View>
    </View>
  );
}
