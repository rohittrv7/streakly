import React from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { Gear, Sparkle } from "@/components/icons";
import { Text, Button } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { useAccent } from "@/lib/theme/store";

export interface TodayHeaderProps {
  greeting: string;
  dateLabel: string;
}

export function TodayHeader({ greeting, dateLabel }: TodayHeaderProps) {
  const router = useRouter();
  const { accent } = useAccent();

  return (
    <View className="flex-row items-center justify-between pt-4 pb-4">
      <View className="flex-1">
        <View className="flex-row items-center gap-1.5 mb-1">
          <Sparkle size={14} color={accent.hex} weight="fill" />
          <Text variant="label">{dateLabel.toUpperCase()}</Text>
        </View>
        <Text variant="display">{greeting}</Text>
      </View>
      <Button
        variant="icon-only"
        size="md"
        icon={<Gear size={22} color={THEME_COLORS.text.primary} weight="regular" />}
        onPress={() => router.push("/settings")}
        accessibilityLabel="Settings"
      />
    </View>
  );
}
