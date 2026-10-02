import React from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { CaretRight, Fire } from "phosphor-react-native";
import { HabitIcon } from "@/features/habits/components/HabitIcon";
import { THEME_COLORS } from "@/lib/theme";
import type { HabitBreakdownItem } from "../types";

interface HabitBreakdownListProps {
  items: HabitBreakdownItem[];
}

export function HabitBreakdownList({ items }: HabitBreakdownListProps) {
  if (items.length === 0) return null;

  return (
    <View className="w-full">
      {items.map((habit) => {
        const habitColor =
          (THEME_COLORS as Record<string, any>)[habit.color] ||
          habit.color ||
          THEME_COLORS.lime;

        return (
          <View
            key={habit.id}
            className="flex-row items-center justify-between py-3 border-b border-white/5"
          >
            {/* Left: Icon bubble */}
            <View
              style={{ backgroundColor: `${habitColor}20` }}
              className="w-10 h-10 rounded-xl items-center justify-center mr-3"
            >
              <HabitIcon name={habit.icon} size={20} color={habitColor} />
            </View>

            {/* Middle: Details & Progress Bar */}
            <View className="flex-1 mr-2">
              <View className="flex-row items-center justify-between mb-1">
                <Text
                  numberOfLines={1}
                  className="text-text-primary text-sm font-semibold flex-1 mr-2"
                >
                  {habit.name}
                </Text>
                <View className="flex-row items-center gap-2">
                  {habit.currentStreak > 0 && (
                    <View className="flex-row items-center bg-coral/10 px-1.5 py-0.5 rounded-md gap-0.5">
                      <Fire size={12} color={THEME_COLORS.coral} weight="fill" />
                      <Text className="text-coral text-[10px] font-bold">
                        {habit.currentStreak}
                      </Text>
                    </View>
                  )}
                  <Text className="text-lime text-xs font-bold">
                    {habit.percent}%
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-1">
                <View
                  style={{
                    width: `${Math.min(100, Math.max(0, habit.percent))}%`,
                    backgroundColor: habitColor,
                  }}
                  className="h-full rounded-full"
                />
              </View>

              <Text className="text-muted text-[10px]">
                {habit.done} / {habit.scheduled} completed
              </Text>
            </View>

            {/* Right: Isolated 44px touch target Chevron Button */}
            <Pressable
              onPress={() => {
                router.push({
                  pathname: "/habit/[id]",
                  params: { id: habit.id },
                });
              }}
              hitSlop={8}
              className="w-11 h-11 items-center justify-center rounded-full active:bg-white/5"
              accessibilityLabel={`Edit ${habit.name}`}
              accessibilityRole="button"
            >
              <CaretRight size={18} color={THEME_COLORS.muted} weight="bold" />
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
