import React, { useEffect, useRef } from "react";
import { View, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useReducedMotion,
} from "react-native-reanimated";
import { Fire, DotsThreeVertical } from "phosphor-react-native";
import { Haptics } from "@/core/utils/haptics";
import type { Habit } from "../types";
import { useHabitStats } from "../hooks";
import { formatFrequency } from "../utils";
import { HabitIcon } from "./HabitIcon";
import {
  Text,
  Card,
  Checkbox,
  AnimatedNumber,
  StrikeText,
  type CheckboxColor,
} from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { useT } from "@/core/i18n";

function resolveColorKey(color: string): CheckboxColor {
  if (color === THEME_COLORS.coral) return "coral";
  if (color === THEME_COLORS.sky) return "sky";
  if (color === THEME_COLORS.mint) return "mint";
  return "lime";
}

export interface HabitCardProps {
  habit: Habit;
  onPress: () => void;
}

export function HabitCard({ habit, onPress }: HabitCardProps) {
  const { t } = useT();
  const {
    currentStreak,
    last7Days,
    isCompletedToday,
    isScheduledToday,
    toggleToday,
  } = useHabitStats(habit);

  const isReducedMotion = useReducedMotion();
  const isFirstRender = useRef(true);
  const cardOpacity = useSharedValue(isCompletedToday ? 0.7 : 1);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      cardOpacity.value = isCompletedToday ? 0.7 : 1;
      return;
    }
    if (isReducedMotion) {
      cardOpacity.value = isCompletedToday ? 0.7 : 1;
    } else {
      cardOpacity.value = withTiming(isCompletedToday ? 0.7 : 1, { duration: 250 });
    }
  }, [isCompletedToday, isReducedMotion, cardOpacity]);

  const animatedCardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
  }));

  const checkboxColorKey = resolveColorKey(habit.color);

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  return (
    <Card variant="surface" className="p-4 mb-3 border border-border">
      <Animated.View style={animatedCardStyle}>
        <View className="flex-row items-center justify-between">
          {/* Left: Long-pressable Icon + Name area */}
          <Pressable
            onLongPress={handleLongPress}
            delayLongPress={350}
            accessibilityRole="button"
            accessibilityLabel={`${habit.name}, long press to edit`}
            className="flex-row items-center gap-3 flex-1 mr-2"
          >
            <View
              style={{ backgroundColor: `${habit.color}20` }}
              className="w-11 h-11 rounded-full items-center justify-center border border-border"
            >
              <HabitIcon name={habit.icon} color={habit.color} size={22} />
            </View>

            <View className="flex-1">
              <StrikeText
                struck={isCompletedToday}
                lineColor={habit.color}
                variant="body"
                className="font-bold mb-0.5"
              >
                {habit.name}
              </StrikeText>
              <Text variant="caption" className="text-text-secondary text-[12px]">
                {formatFrequency(habit, t)}
              </Text>
            </View>
          </Pressable>

          {/* Right: Streak, isolated edit button & isolated checkbox */}
          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center gap-1 bg-elevated px-2 py-1 rounded-pill border border-border">
              <Fire
                size={15}
                color={currentStreak > 0 ? THEME_COLORS.coral : THEME_COLORS.text.muted}
                weight="fill"
              />
              <AnimatedNumber
                value={currentStreak}
                className="text-xs font-bold text-text-primary"
              />
            </View>

            <Pressable
              onPress={onPress}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${habit.name}`}
              className="w-11 h-11 items-center justify-center rounded-full active:opacity-60"
            >
              <DotsThreeVertical size={18} color={THEME_COLORS.text.muted} weight="bold" />
            </Pressable>

            {isScheduledToday ? (
              <Checkbox
                checked={isCompletedToday}
                onCheckedChange={() => toggleToday()}
                color={checkboxColorKey}
                accessibilityLabel={`Complete ${habit.name} today`}
              />
            ) : (
              <View className="w-[44px] h-[44px] items-center justify-center opacity-30">
                <View className="w-5 h-5 rounded-full border border-border" />
              </View>
            )}
          </View>
        </View>

        {/* 7-Day Mini Dots (Non-pressable info row) */}
        <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border">
          {last7Days.map((day) => {
            let dotStyle: any = {};
            let dotClass = "w-6 h-6 rounded-full items-center justify-center";

            if (day.done) {
              dotStyle = { backgroundColor: habit.color };
            } else if (day.frozen) {
              dotStyle = { backgroundColor: THEME_COLORS.sky };
            } else if (day.scheduled) {
              dotClass += " border border-border bg-elevated";
              if (day.isToday) dotStyle = { borderColor: habit.color };
            } else {
              dotClass += " opacity-25 bg-surface";
            }

            return (
              <View key={day.date} className="items-center gap-1">
                <View style={dotStyle} className={dotClass}>
                  <Text
                    className={`text-[9px] font-bold ${
                      day.done ? "text-background" : "text-text-secondary"
                    }`}
                  >
                    {day.dayShort}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </Animated.View>
    </Card>
  );
}
