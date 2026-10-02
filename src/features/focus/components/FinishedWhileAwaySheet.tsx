import React from "react";
import { View } from "react-native";
import { CheckCircle } from "phosphor-react-native";
import { Sheet, Text, Button } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";

export interface FinishedWhileAwaySheetProps {
  visible: boolean;
  onClose: () => void;
}

export function FinishedWhileAwaySheet({
  visible,
  onClose,
}: FinishedWhileAwaySheetProps) {
  return (
    <Sheet visible={visible} onClose={onClose} title="Session Finished">
      <View className="gap-4 pb-2 items-center">
        <View className="w-14 h-14 rounded-full bg-mint/20 items-center justify-center my-1 border border-mint/40">
          <CheckCircle size={30} color={THEME_COLORS.mint} weight="fill" />
        </View>

        <Text variant="title" className="text-base text-center">
          Session finished while you were away
        </Text>

        <Text variant="body" className="text-text-secondary text-center px-4">
          Great job! Your completed focus session has been logged to your daily stats.
        </Text>

        <View className="w-full mt-2">
          <Button variant="primary" title="Got It" onPress={onClose} />
        </View>
      </View>
    </Sheet>
  );
}
