import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { Sheet, Button, Text } from "@/components/ui";

export interface TimePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  initialTime?: string | null;
  onSelectTime: (time: string | null) => void;
  title?: string;
}

export function TimePickerSheet({
  visible,
  onClose,
  initialTime = "09:00",
  onSelectTime,
  title = "Select Time",
}: TimePickerSheetProps) {
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);

  useEffect(() => {
    if (initialTime) {
      const parts = initialTime.split(":");
      setHour(parseInt(parts[0], 10) || 9);
      setMinute(parseInt(parts[1], 10) || 0);
    }
  }, [initialTime, visible]);

  const stepHour = (delta: number) => {
    setHour((h) => (h + delta + 24) % 24);
  };

  const stepMinute = (delta: number) => {
    setMinute((m) => {
      const next = (m + delta * 5 + 60) % 60;
      return Math.floor(next / 5) * 5;
    });
  };

  const handleConfirm = () => {
    const hStr = hour < 10 ? `0${hour}` : `${hour}`;
    const mStr = minute < 10 ? `0${minute}` : `${minute}`;
    onSelectTime(`${hStr}:${mStr}`);
    onClose();
  };

  const handleNoTime = () => {
    onSelectTime(null);
    onClose();
  };

  const formattedDisplay = `${hour < 10 ? `0${hour}` : hour}:${minute < 10 ? `0${minute}` : minute}`;

  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <View className="gap-5 pb-3">
        {/* Big Time Display */}
        <View className="items-center py-2 bg-surface rounded-card border border-border">
          <Text className="text-4xl font-extrabold text-primary tracking-wider">
            {formattedDisplay}
          </Text>
        </View>

        {/* Steppers */}
        <View className="flex-row items-center justify-around">
          {/* Hour Stepper */}
          <View className="items-center gap-1">
            <Text variant="caption">HOUR (0-23)</Text>
            <View className="flex-row items-center gap-2">
              <Button variant="secondary" size="sm" title="-" onPress={() => stepHour(-1)} />
              <Text className="text-xl font-bold min-w-[32px] text-center">{hour}</Text>
              <Button variant="secondary" size="sm" title="+" onPress={() => stepHour(1)} />
            </View>
          </View>

          {/* Minute Stepper (5-min steps) */}
          <View className="items-center gap-1">
            <Text variant="caption">MINUTE (5m)</Text>
            <View className="flex-row items-center gap-2">
              <Button variant="secondary" size="sm" title="-" onPress={() => stepMinute(-1)} />
              <Text className="text-xl font-bold min-w-[32px] text-center">
                {minute < 10 ? `0${minute}` : minute}
              </Text>
              <Button variant="secondary" size="sm" title="+" onPress={() => stepMinute(1)} />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-2 mt-2">
          <Button variant="primary" title="Set Time" onPress={handleConfirm} />
          <Button variant="ghost" title="No Time (Anytime)" onPress={handleNoTime} />
        </View>
      </View>
    </Sheet>
  );
}
