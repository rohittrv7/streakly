import React from "react";
import { View } from "react-native";
import { Sheet, Button, Text } from "@/components/ui";
import { useT } from "@/core/i18n";

export interface DeleteTaskSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  onConfirm: () => Promise<void> | void;
}

export function DeleteTaskSheet({
  visible,
  onClose,
  title,
  onConfirm,
}: DeleteTaskSheetProps) {
  const { t } = useT();

  return (
    <Sheet visible={visible} onClose={onClose} title={t("planner.deleteTask")}>
      <View className="gap-4 pb-2">
        <Text variant="body" className="text-text-secondary">
          {t("planner.deleteConfirm")} ({title})
        </Text>
        <View className="gap-2">
          <Button
            variant="secondary"
            className="bg-coral/20 border-coral/40"
            textClassName="text-coral"
            title={t("common.delete")}
            onPress={async () => {
              onClose();
              await onConfirm();
            }}
          />
          <Button variant="secondary" title={t("common.cancel")} onPress={onClose} />
        </View>
      </View>
    </Sheet>
  );
}
