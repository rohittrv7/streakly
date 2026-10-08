import React, { useState, useEffect } from "react";
import { View, Pressable, TextInput } from "react-native";
import { Sheet, Button, Text } from "@/components/ui";
import { to12h, from12h, formatTime } from "@/core/utils/time";
import { Haptics } from "@/core/utils/haptics";

export interface TimePickerPreset {
  label: string;
  time: string;
}

export interface TimePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  initialTime?: string | null;
  onSelectTime: (time: string | null) => void;
  title?: string;
  presets?: TimePickerPreset[];
  clearLabel?: string;
}

export function TimePickerSheet({
  visible,
  onClose,
  initialTime,
  onSelectTime,
  title = "Select Time",
  presets,
  clearLabel = "No Time (Anytime)",
}: TimePickerSheetProps) {
  const [hour12, setHour12] = useState(9);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<"AM" | "PM">("AM");
  const [isTypingMinute, setIsTypingMinute] = useState(false);
  const [minuteText, setMinuteText] = useState("00");

  useEffect(() => {
    if (visible) {
      const initial = to12h(initialTime || "09:00");
      setHour12(initial.hour12);
      setMinute(initial.minute);
      setPeriod(initial.period);
      setMinuteText(initial.minute < 10 ? `0${initial.minute}` : `${initial.minute}`);
      setIsTypingMinute(false);
    }
  }, [initialTime, visible]);

  const stepHour = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setHour12((h) => {
      let next = h + delta;
      if (next < 1) next = 12;
      if (next > 12) next = 1;
      return next;
    });
  };

  const stepMinute = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setMinute((m) => {
      const next = (m + delta * 5 + 60) % 60;
      const rounded = Math.floor(next / 5) * 5;
      setMinuteText(rounded < 10 ? `0${rounded}` : `${rounded}`);
      return rounded;
    });
  };

  const handleMinuteBlur = () => {
    setIsTypingMinute(false);
    const parsed = parseInt(minuteText, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 59) {
      setMinute(parsed);
      setMinuteText(parsed < 10 ? `0${parsed}` : `${parsed}`);
    } else {
      setMinuteText(minute < 10 ? `0${minute}` : `${minute}`);
    }
  };

  const handleApplyPreset = (timeStr: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const parsed = to12h(timeStr);
    setHour12(parsed.hour12);
    setMinute(parsed.minute);
    setPeriod(parsed.period);
    setMinuteText(parsed.minute < 10 ? `0${parsed.minute}` : `${parsed.minute}`);
  };

  const handleConfirm = () => {
    const finalMin = isTypingMinute ? Math.max(0, Math.min(59, parseInt(minuteText, 10) || minute)) : minute;
    onSelectTime(from12h(hour12, finalMin, period));
    onClose();
  };

  const formattedDisplay = `${hour12}:${minute < 10 ? `0${minute}` : minute} ${period}`;

  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <View className="gap-4 pb-3">
        {/* Preset chips */}
        {presets && presets.length > 0 && (
          <View className="flex-row flex-wrap gap-2">
            {presets.map((preset) => (
              <Pressable
                key={preset.time}
                onPress={() => handleApplyPreset(preset.time)}
                className="px-3 py-2 min-h-[44px] rounded-full bg-surface border border-border items-center justify-center active:opacity-75"
              >
                <Text variant="caption" className="font-semibold text-text-primary">
                  {preset.label} {formatTime(preset.time)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Big Time Display */}
        <View className="items-center py-2.5 bg-surface rounded-card border border-border">
          <Text className="text-4xl font-extrabold text-primary tracking-wider">
            {formattedDisplay}
          </Text>
        </View>

        {/* AM / PM Segmented Control */}
        <View className="flex-row rounded-lg bg-elevated p-1 border border-border">
          <Pressable
            onPress={() => { Haptics.selectionAsync().catch(() => {}); setPeriod("AM"); }}
            className={`flex-1 min-h-[44px] items-center justify-center rounded-md ${period === "AM" ? "bg-primary" : "bg-transparent"}`}
          >
            <Text className={`font-bold text-sm ${period === "AM" ? "text-background" : "text-text-secondary"}`}>AM</Text>
          </Pressable>
          <Pressable
            onPress={() => { Haptics.selectionAsync().catch(() => {}); setPeriod("PM"); }}
            className={`flex-1 min-h-[44px] items-center justify-center rounded-md ${period === "PM" ? "bg-primary" : "bg-transparent"}`}
          >
            <Text className={`font-bold text-sm ${period === "PM" ? "text-background" : "text-text-secondary"}`}>PM</Text>
          </Pressable>
        </View>

        {/* Steppers */}
        <View className="flex-row items-center justify-around">
          {/* Hour Stepper */}
          <View className="items-center gap-1">
            <Text variant="caption">HOUR (1-12)</Text>
            <View className="flex-row items-center gap-2">
              <Button variant="secondary" size="sm" title="-" onPress={() => stepHour(-1)} className="min-w-[44px] min-h-[44px]" />
              <Text className="text-xl font-bold min-w-[36px] text-center">{hour12}</Text>
              <Button variant="secondary" size="sm" title="+" onPress={() => stepHour(1)} className="min-w-[44px] min-h-[44px]" />
            </View>
          </View>

          {/* Minute Stepper */}
          <View className="items-center gap-1">
            <Text variant="caption">MINUTE (Exact / 5m)</Text>
            <View className="flex-row items-center gap-2">
              <Button variant="secondary" size="sm" title="-" onPress={() => stepMinute(-1)} className="min-w-[44px] min-h-[44px]" />
              {isTypingMinute ? (
                <TextInput
                  value={minuteText}
                  onChangeText={setMinuteText}
                  onBlur={handleMinuteBlur}
                  autoFocus
                  keyboardType="numeric"
                  maxLength={2}
                  className="text-xl font-bold min-w-[36px] text-center text-text-primary border-b border-primary"
                />
              ) : (
                <Pressable onPress={() => setIsTypingMinute(true)} className="min-h-[44px] justify-center">
                  <Text className="text-xl font-bold min-w-[36px] text-center">{minute < 10 ? `0${minute}` : minute}</Text>
                </Pressable>
              )}
              <Button variant="secondary" size="sm" title="+" onPress={() => stepMinute(1)} className="min-w-[44px] min-h-[44px]" />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-2 mt-1">
          <Button variant="primary" title="Set Time" onPress={handleConfirm} className="min-h-[44px]" />
          <Button variant="ghost" title={clearLabel} onPress={() => { onSelectTime(null); onClose(); }} className="min-h-[44px]" />
        </View>
      </View>
    </Sheet>
  );
}
