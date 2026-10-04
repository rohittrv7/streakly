import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Plus, Minus } from "@/components/icons";
import { Text, Button } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";

export interface SettingStepperRowProps {
  label: string;
  value: string;
  onTapValue?: () => void;
  onDecrement: () => void;
  onIncrement: () => void;
  canDecrement: boolean;
  canIncrement: boolean;
}

export function SettingStepperRow({
  label,
  value,
  onTapValue,
  onDecrement,
  onIncrement,
  canDecrement,
  canIncrement,
}: SettingStepperRowProps) {
  return (
    <View className="flex-row items-center justify-between p-3.5 bg-surface rounded-2xl border border-border">
      <Text variant="body" className="font-bold text-sm flex-1 mr-2">{label}</Text>
      <View className="flex-row items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={!canDecrement}
          icon={<Minus size={14} color={THEME_COLORS.text.primary} />}
          onPress={onDecrement}
          className="w-9 h-9 p-0"
        />
        {onTapValue ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onTapValue}
            className="min-w-[70px] py-1.5 px-2 bg-elevated rounded-xl border border-border items-center justify-center"
          >
            <Text className="text-xs font-bold text-center text-text-primary">
              {value}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text className="text-sm font-bold min-w-[55px] text-center text-text-primary">
            {value}
          </Text>
        )}
        <Button
          variant="secondary"
          size="sm"
          disabled={!canIncrement}
          icon={<Plus size={14} color={THEME_COLORS.text.primary} />}
          onPress={onIncrement}
          className="w-9 h-9 p-0"
        />
      </View>
    </View>
  );
}
