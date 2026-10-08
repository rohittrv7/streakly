import React from "react";
import { View } from "react-native";
import { Warning, FileArrowUp } from "@/components/icons";
import { Sheet, Text, Button } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { formatTime } from "@/core/utils/time";
import { format } from "date-fns";
import { type ValidationResult } from "../backup/types";

interface DataImportSheetProps {
  visible: boolean;
  onClose: () => void;
  validation: ValidationResult | null;
  loading: boolean;
  onConfirm: () => void;
}

export function DataImportSheet({
  visible,
  onClose,
  validation,
  loading,
  onConfirm,
}: DataImportSheetProps) {
  if (!validation || !validation.counts) return null;
  const { counts, exportedAt } = validation;
  const dateFormatted = exportedAt
    ? `${new Date(exportedAt).toLocaleDateString()} ${formatTime(format(new Date(exportedAt), "HH:mm"))}`
    : "Unknown";

  return (
    <Sheet visible={visible} onClose={onClose} title="Import Backup" size="tall">
      <View className="gap-4 pb-4">
        {/* Warning banner */}
        <View className="p-3.5 rounded-card-sm bg-coral/15 border border-coral/30 flex-row items-start gap-2.5">
          <Warning size={20} color={THEME_COLORS.coral} weight="bold" />
          <View className="flex-1">
            <Text variant="caption" className="font-bold text-coral mb-0.5">
              Replaces Current Data
            </Text>
            <Text variant="caption" className="text-text-secondary">
              Importing this file will overwrite existing habits, tasks, and focus sessions. An automatic safety snapshot will be created before restoring.
            </Text>
          </View>
        </View>

        {/* Counts Preview */}
        <View className="p-4 rounded-card-sm bg-surface border border-border gap-2">
          <View className="flex-row justify-between">
            <Text variant="caption">Export Date:</Text>
            <Text variant="caption" className="font-semibold text-text-primary">
              {dateFormatted}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text variant="caption">Habits & Completions:</Text>
            <Text variant="caption" className="font-semibold text-text-primary">
              {counts.habits} habits, {counts.habitCompletions} completions
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text variant="caption">Tasks & Subtasks:</Text>
            <Text variant="caption" className="font-semibold text-text-primary">
              {counts.tasks} tasks, {counts.taskChecklistItems} items
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text variant="caption">Focus Sessions:</Text>
            <Text variant="caption" className="font-semibold text-text-primary">
              {counts.focusSessions} sessions
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <Button
          variant="primary"
          title="Confirm & Restore Backup"
          loading={loading}
          icon={<FileArrowUp size={18} color="#0F0F10" weight="bold" />}
          onPress={onConfirm}
        />
        <Button
          variant="ghost"
          title="Cancel"
          disabled={loading}
          onPress={onClose}
        />
      </View>
    </Sheet>
  );
}
