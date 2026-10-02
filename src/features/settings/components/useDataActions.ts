import { useState } from "react";
import { Alert } from "react-native";
import { Haptics } from "@/core/utils/haptics";
import {
  exportBackupData,
  pickAndValidateBackupFile,
  createSafetySnapshot,
  executeRestore,
  undoLastImport,
  canUndoImport,
  type ValidationResult,
} from "../backup";
import { deleteAllData } from "../backup/delete";

export function useDataActions() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [undoing, setUndoing] = useState(false);
  const [importSheetOpen, setImportSheetOpen] = useState(false);
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const handleExport = async () => {
    Haptics.selectionAsync();
    setExporting(true);
    const res = await exportBackupData();
    setExporting(false);
    if (res.success && res.counts) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Backup Exported",
        `Exported ${res.counts.habits} habits, ${res.counts.tasks} tasks, and ${res.counts.focusSessions} focus sessions.`
      );
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Export Failed", res.error || "Could not write backup file.");
    }
  };

  const handlePickImport = async () => {
    Haptics.selectionAsync();
    setImporting(true);
    const { validation } = await pickAndValidateBackupFile();
    setImporting(false);

    if (!validation.valid || !validation.payload) {
      if (validation.error !== "File selection was cancelled") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Invalid Backup", validation.error || "Could not read backup file.");
      }
      return;
    }

    setValidationResult(validation);
    setImportSheetOpen(true);
  };

  const handleConfirmImport = async () => {
    if (!validationResult?.payload) return;
    setImporting(true);
    await createSafetySnapshot();
    const res = await executeRestore(validationResult.payload);
    setImporting(false);
    setImportSheetOpen(false);

    if (res.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Restore Completed", "Your backup was restored successfully.");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Restore Failed", res.error || "Could not apply backup data.");
    }
  };

  const handleUndo = async () => {
    Haptics.selectionAsync();
    setUndoing(true);
    const res = await undoLastImport();
    setUndoing(false);
    if (res.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Import Reverted", "Your data was restored to the state before the import.");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Undo Failed", res.error || "Could not revert import.");
    }
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    const res = await deleteAllData();
    setDeleting(false);
    setDeleteSheetOpen(false);

    if (res.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("All Data Deleted", "All habits, tasks, and settings have been cleared.");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Delete Failed", res.error || "Could not clear data.");
    }
  };

  return {
    exporting,
    importing,
    deleting,
    undoing,
    importSheetOpen,
    deleteSheetOpen,
    validationResult,
    setImportSheetOpen,
    setDeleteSheetOpen,
    handleExport,
    handlePickImport,
    handleConfirmImport,
    handleUndo,
    handleConfirmDelete,
    undoAvailable: canUndoImport(),
  };
}
