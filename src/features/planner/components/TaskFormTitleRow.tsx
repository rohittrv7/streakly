import React from "react";
import { View, ActivityIndicator, TouchableOpacity } from "react-native";
import { Input, Text } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { useTranslation } from "@/core/i18n";

export interface TaskFormTitleRowProps {
  title: string;
  error?: string;
  isFetchingTitle: boolean;
  showAutofillCaption: boolean;
  onChangeText: (text: string) => void;
  onUndoAutofill: () => void;
}

export function TaskFormTitleRow({
  title,
  error,
  isFetchingTitle,
  showAutofillCaption,
  onChangeText,
  onUndoAutofill,
}: TaskFormTitleRowProps) {
  const { t } = useTranslation();

  return (
    <View>
      <Input
        label="TITLE *"
        placeholder="e.g. Solve 2 LeetCode problems"
        value={title}
        onChangeText={onChangeText}
        error={error}
      />

      {isFetchingTitle && (
        <View className="flex-row items-center gap-2 -mt-2 mb-2 ml-1">
          <ActivityIndicator size="small" color={THEME_COLORS.primary} />
          <Text variant="caption" className="text-xs text-text-muted">
            {t("youtube.fetchingTitle")}
          </Text>
        </View>
      )}

      {showAutofillCaption && title.length > 0 && (
        <View className="flex-row items-center justify-between -mt-2 mb-2 px-1">
          <Text variant="caption" className="text-xs text-text-muted">
            {t("youtube.titleTaken")}
          </Text>
          <TouchableOpacity
            onPress={onUndoAutofill}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={t("common.undo")}
          >
            <Text className="text-xs font-bold text-accent">
              {t("common.undo")}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
