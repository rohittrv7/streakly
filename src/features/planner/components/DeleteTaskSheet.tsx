import React from "react";
import { View } from "react-native";
import { Sheet, Button, Text } from "@/components/ui";

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
  return (
    <Sheet visible={visible} onClose={onClose} title="Delete Task">
      <View className="gap-4 pb-2">
        <Text variant="body" className="text-text-secondary">
          Are you sure you want to delete &quot;{title}&quot;? This action cannot be undone.
        </Text>
        <View className="gap-2">
          <Button
            variant="secondary"
            className="bg-coral/20 border-coral/40"
            textClassName="text-coral"
            title="Confirm Delete"
            onPress={async () => {
              onClose();
              await onConfirm();
            }}
          />
          <Button variant="secondary" title="Cancel" onPress={onClose} />
        </View>
      </View>
    </Sheet>
  );
}
