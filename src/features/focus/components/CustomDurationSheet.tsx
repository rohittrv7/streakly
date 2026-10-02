import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Sheet, Text, Button, Input } from "@/components/ui";
import { useTranslation } from "@/core/i18n";
import { MIN_DURATION_SEC, MAX_DURATION_SEC } from "../duration";

export interface CustomDurationSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  initialSeconds: number;
  onSave: (seconds: number) => void;
}

export function CustomDurationSheet({
  visible,
  onClose,
  title,
  initialSeconds,
  onSave,
}: CustomDurationSheetProps) {
  const { t } = useTranslation();
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      const clamped = Math.max(0, initialSeconds);
      const mins = Math.floor(clamped / 60);
      const secs = clamped % 60;
      setMinutes(String(mins));
      setSeconds(String(secs));
      setError(null);
    }
  }, [visible, initialSeconds]);

  const handleSave = () => {
    const parsedMins = parseInt(minutes.trim(), 10) || 0;
    const parsedSecs = parseInt(seconds.trim(), 10) || 0;
    const total = parsedMins * 60 + parsedSecs;

    if (total < MIN_DURATION_SEC || total > MAX_DURATION_SEC) {
      setError("Duration must be between 10 sec and 180 min");
      return;
    }

    onSave(total);
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={title || t("focus.exactDurationTitle")} size="auto">
      <View className="gap-4 pb-2">
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label={t("focus.minutes")}
              keyboardType="number-pad"
              maxLength={3}
              value={minutes}
              onChangeText={(text) => {
                setMinutes(text.replace(/[^0-9]/g, ""));
                setError(null);
              }}
              placeholder="0"
            />
          </View>
          <View className="flex-1">
            <Input
              label={t("focus.seconds")}
              keyboardType="number-pad"
              maxLength={2}
              value={seconds}
              onChangeText={(text) => {
                setSeconds(text.replace(/[^0-9]/g, ""));
                setError(null);
              }}
              placeholder="0"
            />
          </View>
        </View>

        {error && (
          <Text variant="caption" className="text-coral -mt-2 ml-1">
            {error}
          </Text>
        )}

        <View className="flex-row gap-3 mt-1">
          <Button variant="secondary" title="Cancel" onPress={onClose} className="flex-1" />
          <Button variant="primary" title="Save" onPress={handleSave} className="flex-1" />
        </View>
      </View>
    </Sheet>
  );
}
