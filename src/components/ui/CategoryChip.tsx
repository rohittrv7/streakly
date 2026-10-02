import React from "react";
import { View, Text } from "react-native";
import { getCategoryConfig } from "@/core/theme/categories";
import { useT } from "@/core/i18n";
import { cn } from "@/core/utils/cn";

export interface CategoryChipProps {
  category: string;
  className?: string;
  dotSize?: number;
}

export function CategoryChip({
  category,
  className,
  dotSize = 6,
}: CategoryChipProps) {
  const { t } = useT();
  const config = getCategoryConfig(category);
  const label = t(config.labelKey) || config.key;

  return (
    <View
      style={{
        backgroundColor: config.bgTint,
        borderColor: config.borderTint,
        borderWidth: 1,
      }}
      className={cn(
        "h-7 px-2.5 rounded-full flex-row items-center gap-1.5 self-start",
        className
      )}
      accessibilityRole="text"
      accessibilityLabel={`Category ${label}`}
    >
      <View
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: config.color,
        }}
      />
      <Text className="text-xs font-semibold text-text-primary tracking-tight">
        {label}
      </Text>
    </View>
  );
}
