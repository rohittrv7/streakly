import React from "react";
import { View } from "react-native";
import { Warning, ArrowCounterClockwise } from "@/components/icons";
import { Text } from "./Text";
import { Button } from "./Button";
import { THEME_COLORS } from "@/lib/theme";
import { useT } from "@/core/i18n";

export interface ErrorBoundaryProps {
  error: Error;
  retry: () => void;
}

export function RootErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const { t } = useT();

  return (
    <View
      style={{ backgroundColor: THEME_COLORS.background }}
      className="flex-1 items-center justify-center p-6"
    >
      <View className="w-16 h-16 rounded-full bg-coral/15 items-center justify-center mb-4">
        <Warning size={32} color={THEME_COLORS.coral} weight="bold" />
      </View>
      <Text variant="title" className="text-center mb-2 font-bold">
        {t("common.somethingWentWrong")}
      </Text>
      <Text variant="body" className="text-center text-text-secondary mb-6 max-w-[300px]">
        {error?.message || t("common.unexpectedError")}
      </Text>
      <Button
        variant="primary"
        title={t("common.restartApp")}
        icon={<ArrowCounterClockwise size={18} color={THEME_COLORS.background} weight="bold" />}
        onPress={retry}
      />
    </View>
  );
}
