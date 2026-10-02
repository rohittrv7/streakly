import React from "react";
import { View } from "react-native";
import { Warning, ArrowCounterClockwise } from "phosphor-react-native";
import { Text } from "./Text";
import { Button } from "./Button";
import { THEME_COLORS } from "@/lib/theme";

export interface ErrorBoundaryProps {
  error: Error;
  retry: () => void;
}

export function RootErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View
      style={{ backgroundColor: THEME_COLORS.background }}
      className="flex-1 items-center justify-center p-6"
    >
      <View className="w-16 h-16 rounded-full bg-coral/15 items-center justify-center mb-4">
        <Warning size={32} color={THEME_COLORS.coral} weight="bold" />
      </View>
      <Text variant="title" className="text-center mb-2 font-bold">
        Something went wrong
      </Text>
      <Text variant="body" className="text-center text-text-secondary mb-6 max-w-[300px]">
        {error?.message || "An unexpected error occurred. You can restart the app below."}
      </Text>
      <Button
        variant="primary"
        title="Restart App"
        icon={<ArrowCounterClockwise size={18} color="#0F0F10" weight="bold" />}
        onPress={retry}
      />
    </View>
  );
}
