import React, { useEffect, useRef, useState } from "react";
import {
  Modal, View, Text, Pressable, PanResponder, KeyboardAvoidingView,
  TouchableWithoutFeedback, Dimensions, ScrollView,
} from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS, useReducedMotion,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "@/core/utils/cn";
import { resolveSheetHeight, type SheetSize } from "./sheet-utils";

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  size?: SheetSize;
  children: React.ReactNode;
  className?: string;
}

export function Sheet({
  visible,
  onClose,
  title,
  size = "auto",
  children,
  className,
}: SheetProps) {
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get("window").height;
  const shouldReduceMotion = useReducedMotion();

  const translateY = useSharedValue(screenHeight);
  const backdropOpacity = useSharedValue(0);
  const [mounted, setMounted] = useState(visible);

  const { maxHeight, height } = resolveSheetHeight(size, screenHeight, insets.top);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      if (shouldReduceMotion) {
        translateY.value = 0;
        backdropOpacity.value = 1;
      } else {
        backdropOpacity.value = withTiming(1, { duration: 220 });
        translateY.value = withTiming(0, {
          duration: 260,
          easing: Easing.out(Easing.cubic),
        });
      }
    } else if (mounted) {
      if (shouldReduceMotion) {
        translateY.value = screenHeight;
        backdropOpacity.value = 0;
        setMounted(false);
      } else {
        backdropOpacity.value = withTiming(0, { duration: 180 });
        translateY.value = withTiming(
          screenHeight,
          { duration: 200, easing: Easing.in(Easing.cubic) },
          (finished) => {
            if (finished) runOnJS(setMounted)(false);
          }
        );
      }
    }
  }, [visible, mounted, shouldReduceMotion, screenHeight, translateY, backdropOpacity]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.value = gestureState.dy;
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.6) {
          backdropOpacity.value = withTiming(0, { duration: 180 });
          translateY.value = withTiming(
            screenHeight,
            { duration: 200, easing: Easing.in(Easing.cubic) },
            () => runOnJS(onClose)()
          );
        } else {
          translateY.value = withTiming(0, {
            duration: 200,
            easing: Easing.out(Easing.cubic),
          });
        }
      },
    })
  ).current;

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!mounted) return null;

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end">
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            style={animatedBackdropStyle}
            className="absolute inset-0 bg-black/60"
          />
        </TouchableWithoutFeedback>

        {/* Keyboard Aware Sheet Container */}
        <KeyboardAvoidingView
          behavior="padding"
          pointerEvents="box-none"
          className="w-full justify-end"
        >
          <Animated.View
            style={[
              animatedSheetStyle,
              {
                maxHeight,
                height,
                paddingBottom: insets.bottom + 16,
              },
            ]}
            className={cn(
              "bg-surface border-t border-border rounded-t-[28px] px-6 pt-2 w-full",
              className
            )}
          >
            {/* Drag Handle */}
            <View
              {...panResponder.panHandlers}
              className="w-full items-center py-2.5 active:opacity-70"
            >
              <View className="w-10 h-1 bg-white/20 rounded-full" />
            </View>

            {/* Optional Title Header */}
            {title && (
              <View className="flex-row items-center justify-between gap-3 pb-3 mb-2 border-b border-border">
                <Text
                  className="flex-1 min-w-0 text-text-primary font-bold text-lg"
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {title}
                </Text>
                <Pressable
                  onPress={onClose}
                  hitSlop={8}
                  className="w-11 h-11 shrink-0 rounded-full bg-elevated items-center justify-center border border-border active:opacity-60"
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <Text className="text-text-secondary text-base font-bold">✕</Text>
                </Pressable>
              </View>
            )}

            {size === "full" || size === "tall" ? (
              <ScrollView
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
            ) : (
              children
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
