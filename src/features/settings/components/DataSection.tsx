import React from "react";
import { View, Pressable } from "react-native";
import {
  Database,
  Export,
  FileArrowDown,
  Trash,
  ArrowUUpLeft,
} from "@/components/icons";
import { Card, Text, Button } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { useAccent } from "@/lib/theme/store";
import { useT } from "@/core/i18n";
import { useDataActions } from "./useDataActions";
import { DataImportSheet } from "./DataImportSheet";
import { DataDeleteSheet } from "./DataDeleteSheet";

export function DataSection() {
  const { t } = useT();
  const { accent } = useAccent();
  const {
    exporting,
    importing,
    deleting,
    undoing,
    importSheetOpen,
    deleteSheetOpen,
    validationResult,
    undoAvailable,
    setImportSheetOpen,
    setDeleteSheetOpen,
    handleExport,
    handlePickImport,
    handleConfirmImport,
    handleUndo,
    handleConfirmDelete,
  } = useDataActions();

  return (
    <>
      <Card variant="surface" className="p-4 mb-4 border border-border">
        {/* Section Header */}
        <View className="flex-row items-center gap-2 mb-3">
          <Database size={18} color={accent.hex} weight="fill" />
          <Text variant="body" className="font-bold text-text-primary">
            {t("settings.data")}
          </Text>
        </View>

        {/* Undo Import row if available */}
        {undoAvailable && (
          <Pressable
            onPress={handleUndo}
            disabled={undoing}
            className="py-3 border-b border-border flex-row items-center justify-between min-h-[48px]"
          >
            <View className="flex-row items-center gap-3">
              <ArrowUUpLeft size={18} color={THEME_COLORS.coral} weight="bold" />
              <View>
                <Text variant="body" className="font-bold text-coral">
                  Undo Recent Import
                </Text>
                <Text variant="caption">Available for 10 minutes</Text>
              </View>
            </View>
            <Button
              title="Undo"
              size="sm"
              variant="secondary"
              loading={undoing}
              onPress={handleUndo}
            />
          </Pressable>
        )}

        {/* Export Backup Row */}
        <Pressable
          onPress={handleExport}
          disabled={exporting}
          className="py-3 flex-row items-center justify-between min-h-[48px]"
          accessibilityRole="button"
          accessibilityLabel="Export Backup"
        >
          <View className="flex-row items-center gap-3">
            <Export size={18} color={THEME_COLORS.text.secondary} />
            <View>
              <Text variant="body" className="font-medium text-text-primary">
                {t("settings.exportBackup")}
              </Text>
              <Text variant="caption">Save JSON file of all data</Text>
            </View>
          </View>
          <Button
            title="Export"
            size="sm"
            variant="ghost"
            loading={exporting}
            onPress={handleExport}
          />
        </Pressable>

        {/* Import Backup Row */}
        <Pressable
          onPress={handlePickImport}
          disabled={importing}
          className="py-3 border-t border-border flex-row items-center justify-between min-h-[48px]"
          accessibilityRole="button"
          accessibilityLabel="Import Backup"
        >
          <View className="flex-row items-center gap-3">
            <FileArrowDown size={18} color={THEME_COLORS.text.secondary} />
            <View>
              <Text variant="body" className="font-medium text-text-primary">
                {t("settings.importBackup")}
              </Text>
              <Text variant="caption">Restore from a JSON file</Text>
            </View>
          </View>
          <Button
            title="Import"
            size="sm"
            variant="ghost"
            loading={importing}
            onPress={handlePickImport}
          />
        </Pressable>

        {/* Delete All Data Row */}
        <Pressable
          onPress={() => setDeleteSheetOpen(true)}
          className="pt-3 border-t border-border flex-row items-center justify-between min-h-[48px]"
          accessibilityRole="button"
          accessibilityLabel="Delete All Data"
        >
          <View className="flex-row items-center gap-3">
            <Trash size={18} color={THEME_COLORS.coral} weight="bold" />
            <View>
              <Text variant="body" className="font-bold text-coral">
                {t("settings.deleteAll")}
              </Text>
              <Text variant="caption">Permanently wipe all records</Text>
            </View>
          </View>
        </Pressable>
      </Card>

      <DataImportSheet
        visible={importSheetOpen}
        onClose={() => setImportSheetOpen(false)}
        validation={validationResult}
        loading={importing}
        onConfirm={handleConfirmImport}
      />

      <DataDeleteSheet
        visible={deleteSheetOpen}
        onClose={() => setDeleteSheetOpen(false)}
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
