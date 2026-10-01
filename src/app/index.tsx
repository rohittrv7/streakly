import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Fire, CheckCircle, Sparkle, CalendarBlank } from "phosphor-react-native";
import { todayStr, getWeekDays } from "@/core/utils/dates";
import { cn } from "@/core/utils/cn";
import { THEME_COLORS } from "@/lib/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function TestScreen() {
  const [streakCount, setStreakCount] = useState(3);
  const scale = useSharedValue(1);
  const weekDays = getWeekDays();
  const today = todayStr();

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const incrementStreak = () => {
    setStreakCount((prev) => prev + 1);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="pt-6 pb-4">
          <View className="flex-row items-center gap-2 mb-1">
            <Sparkle size={16} color={THEME_COLORS.primary} weight="fill" />
            <Text className="text-primary font-bold text-xs uppercase tracking-widest">
              System Test • Step 1
            </Text>
          </View>
          <Text className="text-text-primary font-extrabold text-3xl tracking-tight">
            Streakly Setup
          </Text>
          <Text className="text-text-secondary font-sans text-sm mt-1">
            NativeWind, Google Fonts, Reanimated & Tokens Verified
          </Text>
        </View>

        {/* Hero Bento Streak Card */}
        <View className="bg-surface border border-border rounded-card p-5 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center gap-2">
              <View className="w-10 h-10 rounded-pill bg-[#262A14] items-center justify-center">
                <Fire size={22} color={THEME_COLORS.primary} weight="fill" />
              </View>
              <View>
                <Text className="text-text-secondary font-medium text-xs uppercase tracking-wider">
                  Active Streak
                </Text>
                <Text className="text-text-primary font-bold text-lg">
                  3 din ka streak, ab mat todna
                </Text>
              </View>
            </View>
            <View className="bg-elevated px-3 py-1.5 rounded-pill border border-border">
              <Text className="text-primary font-bold text-sm">
                {streakCount} Days 🔥
              </Text>
            </View>
          </View>

          <Text className="text-text-secondary font-sans text-xs mb-4">
            Today is {today}. Keep the momentum going!
          </Text>

          {/* Interactive Reanimated Spring Button */}
          <AnimatedPressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={incrementStreak}
            style={animatedButtonStyle}
            className="bg-primary py-3.5 px-5 rounded-pill flex-row items-center justify-center gap-2 active:opacity-90"
          >
            <CheckCircle size={20} color="#0F0F10" weight="bold" />
            <Text className="text-background font-bold text-sm">
              Tap to Test Reanimated Spring & Haptics
            </Text>
          </AnimatedPressable>
        </View>

        {/* Week Days Strip Preview */}
        <View className="bg-surface border border-border rounded-card p-4 mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <CalendarBlank size={18} color={THEME_COLORS.text.secondary} />
            <Text className="text-text-secondary font-medium text-xs uppercase tracking-wider">
              Horizontal Week Strip (core/utils/dates)
            </Text>
          </View>

          <View className="flex-row justify-between items-center">
            {weekDays.map((day) => {
              const isCurrentDay = day.dateStr === today;
              return (
                <View
                  key={day.dateStr}
                  className={cn(
                    "items-center py-2.5 px-2 rounded-2xl min-w-[42px]",
                    isCurrentDay
                      ? "bg-primary"
                      : "bg-elevated border border-border"
                  )}
                >
                  <Text
                    className={cn(
                      "text-[10px] font-semibold uppercase mb-1",
                      isCurrentDay ? "text-background" : "text-text-secondary"
                    )}
                  >
                    {day.dayShort}
                  </Text>
                  <Text
                    className={cn(
                      "text-sm font-bold",
                      isCurrentDay ? "text-background" : "text-text-primary"
                    )}
                  >
                    {day.dayNumber}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Tokens & Typography Matrix */}
        <View className="bg-surface border border-border rounded-card p-4 mb-4">
          <Text className="text-text-secondary font-semibold text-xs uppercase tracking-wider mb-3">
            Design Tokens Verification
          </Text>

          <View className="gap-2.5">
            <View className="flex-row items-center justify-between py-1.5 border-b border-border">
              <Text className="text-text-primary font-sans text-sm">
                Regular 400
              </Text>
              <Text className="text-text-secondary font-sans text-xs">
                PlusJakartaSans-Regular
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-1.5 border-b border-border">
              <Text className="text-text-primary font-medium text-sm">
                Medium 500
              </Text>
              <Text className="text-text-secondary font-medium text-xs">
                PlusJakartaSans-Medium
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-1.5 border-b border-border">
              <Text className="text-text-primary font-semibold text-sm">
                SemiBold 600
              </Text>
              <Text className="text-text-secondary font-semibold text-xs">
                PlusJakartaSans-SemiBold
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-1.5 border-b border-border">
              <Text className="text-text-primary font-bold text-sm">
                Bold 700
              </Text>
              <Text className="text-text-secondary font-bold text-xs">
                PlusJakartaSans-Bold
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-1.5">
              <Text className="text-text-primary font-extrabold text-sm">
                ExtraBold 800
              </Text>
              <Text className="text-text-secondary font-extrabold text-xs">
                PlusJakartaSans-ExtraBold
              </Text>
            </View>
          </View>

          {/* Color Swatches */}
          <View className="flex-row gap-2 mt-4 pt-3 border-t border-border">
            <View className="flex-1 items-center bg-[#262A14] py-2 rounded-xl border border-primary/20">
              <View className="w-3.5 h-3.5 rounded-full bg-primary mb-1" />
              <Text className="text-[10px] text-primary font-bold">Lime</Text>
            </View>
            <View className="flex-1 items-center bg-[#2A1D1A] py-2 rounded-xl border border-coral/20">
              <View className="w-3.5 h-3.5 rounded-full bg-coral mb-1" />
              <Text className="text-[10px] text-coral font-bold">Coral</Text>
            </View>
            <View className="flex-1 items-center bg-[#1A2230] py-2 rounded-xl border border-softBlue/20">
              <View className="w-3.5 h-3.5 rounded-full bg-softBlue mb-1" />
              <Text className="text-[10px] text-softBlue font-bold">Soft Blue</Text>
            </View>
            <View className="flex-1 items-center bg-[#172A22] py-2 rounded-xl border border-mint/20">
              <View className="w-3.5 h-3.5 rounded-full bg-mint mb-1" />
              <Text className="text-[10px] text-mint font-bold">Mint</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
