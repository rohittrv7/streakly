import React from "react";
import { View, Pressable } from "react-native";
import { HabitIcon, HABIT_ICON_KEYS, resolveHabitIcon } from "./HabitIcon";
import { Text } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";

export const COLOR_OPTIONS = [
  { name: "Lime", hex: THEME_COLORS.lime },
  { name: "Coral", hex: THEME_COLORS.coral },
  { name: "Sky", hex: THEME_COLORS.sky },
  { name: "Mint", hex: THEME_COLORS.mint },
];

interface HabitVisualPickersProps {
  color: string;
  onColorChange: (color: string) => void;
  icon: string;
  onIconChange: (icon: string) => void;
}

export function HabitVisualPickers({
  color,
  onColorChange,
  icon,
  onIconChange,
}: HabitVisualPickersProps) {
  const selectedIconKey = resolveHabitIcon(icon);

  return (
    <View className="gap-5">
      {/* Color Selection */}
      <View>
        <Text variant="label" className="mb-2">COLOR ACCENT</Text>
        <View className="flex-row gap-3">
          {COLOR_OPTIONS.map((c) => (
            <Pressable
              key={c.name}
              onPress={() => onColorChange(c.hex)}
              className="items-center justify-center p-1 rounded-full"
            >
              <View
                style={{ backgroundColor: c.hex }}
                className={`w-9 h-9 rounded-full items-center justify-center ${
                  color === c.hex ? "border-2 border-text-primary" : "border border-border"
                }`}
              />
            </Pressable>
          ))}
        </View>
      </View>

      {/* Icon Picker Grid */}
      <View>
        <Text variant="label" className="mb-2">ICON</Text>
        <View className="flex-row flex-wrap gap-2.5 bg-surface p-3 rounded-card border border-border">
          {HABIT_ICON_KEYS.map((iconKey) => {
            const selected = selectedIconKey === iconKey;
            return (
              <Pressable
                key={iconKey}
                onPress={() => onIconChange(iconKey)}
                style={{
                  backgroundColor: selected ? `${THEME_COLORS.lime}20` : THEME_COLORS.elevated,
                  borderColor: selected ? THEME_COLORS.lime : THEME_COLORS.border,
                  borderWidth: selected ? 2 : 1,
                }}
                className="w-10 h-10 rounded-full items-center justify-center"
              >
                <HabitIcon
                  name={iconKey}
                  size={19}
                  color={selected ? THEME_COLORS.lime : THEME_COLORS.text.secondary}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
