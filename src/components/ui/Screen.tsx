import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  type ViewProps,
  type ScrollViewProps,
  type RefreshControlProps,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets, type Edge } from "react-native-safe-area-context";
import { cn } from "@/core/utils/cn";

export const FLOATING_TAB_BAR_HEIGHT = 60;
export const TAB_BAR_MARGIN_BOTTOM = 8;
export const TAB_BAR_BUFFER = 16;
export const TAB_BAR_HEIGHT = 84;

export function calculateTabBarInset(bottomInset: number = 0): number {
  return (
    FLOATING_TAB_BAR_HEIGHT +
    Math.max(bottomInset, 12) +
    TAB_BAR_MARGIN_BOTTOM +
    TAB_BAR_BUFFER
  );
}

export function useTabBarInset(): number {
  const insets = useSafeAreaInsets();
  return calculateTabBarInset(insets.bottom);
}

export interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  scroll?: boolean;
  keyboard?: boolean;
  withTabBarInset?: boolean;
  edges?: Edge[];
  className?: string;
  contentContainerClassName?: string;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  scrollViewProps?: Omit<ScrollViewProps, "children">;
}

export function Screen({
  children,
  scroll = false,
  keyboard = false,
  withTabBarInset = false,
  edges = ["top", "left", "right"],
  className,
  contentContainerClassName,
  refreshControl,
  scrollViewProps,
  ...props
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!keyboard) return;
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboard]);

  const bottomPadding = withTabBarInset
    ? calculateTabBarInset(insets.bottom)
    : 16;
  const totalBottomPadding =
    bottomPadding + (keyboardHeight > 0 ? keyboardHeight + 24 : 0);

  if (scroll || keyboard) {
    const scrollContent = (
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        refreshControl={refreshControl}
        contentContainerStyle={{ paddingBottom: totalBottomPadding }}
        contentContainerClassName={cn("px-screen pt-2", contentContainerClassName)}
        {...scrollViewProps}
      >
        {children}
      </ScrollView>
    );

    return (
      <SafeAreaView
        edges={edges}
        className={cn("flex-1 bg-background", className)}
        {...props}
      >
        {keyboard ? (
          <KeyboardAvoidingView behavior="padding" className="flex-1">
            {scrollContent}
          </KeyboardAvoidingView>
        ) : (
          scrollContent
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={edges}
      className={cn("flex-1 bg-background px-screen", className)}
      style={{ paddingBottom: bottomPadding }}
      {...props}
    >
      {children}
    </SafeAreaView>
  );
}
