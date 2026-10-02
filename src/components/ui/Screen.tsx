import {
  View,
  ScrollView,
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
  withTabBarInset = false,
  edges = ["top", "left", "right"],
  className,
  contentContainerClassName,
  refreshControl,
  scrollViewProps,
  ...props
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = withTabBarInset
    ? calculateTabBarInset(insets.bottom)
    : 16;

  if (scroll) {
    return (
      <SafeAreaView
        edges={edges}
        className={cn("flex-1 bg-background", className)}
        {...props}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          contentContainerStyle={{ paddingBottom: bottomPadding }}
          contentContainerClassName={cn("px-screen pt-2", contentContainerClassName)}
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
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
