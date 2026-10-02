import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Sheet, Input, Button } from "@/components/ui";

export interface NoteSheetProps {
  visible: boolean;
  onClose: () => void;
  currentNote: string | null | undefined;
  onSave: (note: string | null) => void;
}

export function NoteSheet({
  visible,
  onClose,
  currentNote,
  onSave,
}: NoteSheetProps) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (visible) {
      setNote(currentNote || "");
    }
  }, [visible, currentNote]);

  const handleSave = () => {
    const trimmed = note.trim();
    onSave(trimmed ? trimmed.slice(0, 300) : null);
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Video Note">
      <View className="gap-4 pb-3">
        <Input
          label="NOTE (MAX 300 CHARS)"
          placeholder="e.g. Focus on problem 3 explanation at 14:00"
          value={note}
          onChangeText={setNote}
          maxLength={300}
          multiline
          numberOfLines={3}
        />
        <View className="gap-2">
          <Button variant="primary" title="Save Note" onPress={handleSave} />
          {currentNote && (
            <Button
              variant="ghost"
              title="Clear Note"
              onPress={() => {
                onSave(null);
                onClose();
              }}
            />
          )}
        </View>
      </View>
    </Sheet>
  );
}
