import React, { useState } from "react";
import { View } from "react-native";
import { Trash, Warning } from "phosphor-react-native";
import { Sheet, Text, Button, Input } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";

interface DataDeleteSheetProps {
  visible: boolean;
  onClose: () => void;
  loading: boolean;
  onConfirm: () => void;
}

export function DataDeleteSheet({
  visible,
  onClose,
  loading,
  onConfirm,
}: DataDeleteSheetProps) {
  const [confirmText, setConfirmText] = useState("");
  const isMatch = confirmText.trim() === "DELETE";

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  const handleConfirm = () => {
    if (!isMatch) return;
    onConfirm();
    setConfirmText("");
  };

  return (
    <Sheet visible={visible} onClose={handleClose} title="Delete All Data?" size="tall">
      <View className="gap-4 pb-4">
        <View className="p-3.5 rounded-card-sm bg-coral/15 border border-coral/30 flex-row items-start gap-2.5">
          <Warning size={20} color={THEME_COLORS.coral} weight="bold" />
          <View className="flex-1">
            <Text variant="caption" className="font-bold text-coral mb-0.5">
              Irreversible Action
            </Text>
            <Text variant="caption" className="text-text-secondary">
              This will permanently delete all your habits, completed history, tasks, YouTube links, focus sessions, and reset all settings.
            </Text>
          </View>
        </View>

        <View className="gap-1.5">
          <Text variant="caption">
            Type <Text variant="caption" className="font-bold text-coral">DELETE</Text> to confirm:
          </Text>
          <Input
            value={confirmText}
            onChangeText={setConfirmText}
            placeholder="Type DELETE"
            autoCapitalize="characters"
          />
        </View>

        <Button
          variant="secondary"
          title="Delete All Data Permanently"
          disabled={!isMatch || loading}
          loading={loading}
          className="border-coral"
          textClassName="text-coral font-bold"
          icon={<Trash size={18} color={THEME_COLORS.coral} weight="bold" />}
          onPress={handleConfirm}
        />

        <Button
          variant="ghost"
          title="Cancel"
          disabled={loading}
          onPress={handleClose}
        />
      </View>
    </Sheet>
  );
}
