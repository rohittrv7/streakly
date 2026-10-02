import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Sheet, Input, Button, Text } from "@/components/ui";
import { parseTimestamp, formatTimestamp } from "../utils";

export interface WatchedTillSheetProps {
  visible: boolean;
  onClose: () => void;
  currentSeconds: number | null | undefined;
  onSave: (seconds: number | null) => void;
}

export function WatchedTillSheet({
  visible,
  onClose,
  currentSeconds,
  onSave,
}: WatchedTillSheetProps) {
  const [val, setVal] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setVal(currentSeconds ? formatTimestamp(currentSeconds) : "");
      setError(null);
    }
  }, [visible, currentSeconds]);

  const handleConfirm = () => {
    const trimmed = val.trim();
    if (!trimmed) {
      onSave(null);
      onClose();
      return;
    }
    const secs = parseTimestamp(trimmed);
    if (secs === null) {
      setError("Enter valid timestamp (e.g. 14:30, 1:05:00, or 90)");
      return;
    }
    onSave(secs);
    onClose();
  };

  const handleClear = () => {
    onSave(null);
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Set Watched Till">
      <View className="gap-4 pb-3">
        <Input
          label="TIMESTAMP (M:SS OR SECONDS)"
          placeholder="e.g. 12:45"
          value={val}
          onChangeText={(t) => {
            setVal(t);
            if (error) setError(null);
          }}
          error={error || undefined}
        />
        <View className="gap-2">
          <Button variant="primary" title="Save Position" onPress={handleConfirm} />
          {currentSeconds !== null && currentSeconds !== undefined && (
            <Button variant="ghost" title="Clear Saved Position" onPress={handleClear} />
          )}
        </View>
      </View>
    </Sheet>
  );
}
