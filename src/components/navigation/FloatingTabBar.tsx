import React, { useEffect, useState } from "react";
import { View, Pressable, Keyboard, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Haptics } from "@/core/utils/haptics";
import {
  House,
  Target,
  CalendarBlank,
  Timer,
  ChartBar,
} from "phosphor-react-native";
import { Text } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { useAccent } from "@/lib/theme/store";
import { TAB_BAR_MARGIN_BOTTOM, FLOATING_TAB_BAR_HEIGHT } from "@/components/ui/Screen";

export interface TabBarRoute {
  key: string;
  name: string;
  params?: any;
}

export interface BottomTabBarProps {
  state: {
    index: number;
    routes: TabBarRoute[];
    [key: string]: any;
  };
  descriptors: Record<string, any>;
  navigation: any;
}

export interface TabItemLayout {
  x: number;
  width: number;
}

export function computeIndicatorLayout(
  layouts: Record<number, TabItemLayout>,
  activeIndex: number
): TabItemLayout {
  const layout = layouts[activeIndex];
  return (!layout || layout.width <= 0) ? { x: 0, width: 0 } : { x: layout.x, width: layout.width };
}

const TAB_CONFIGS: Record<string, { name: string; label: string; Icon: any }> = {
  index: { name: "index", label: "Today", Icon: House },
  habits: { name: "habits", label: "Habits", Icon: Target },
  planner: { name: "planner", label: "Planner", Icon: CalendarBlank },
  focus: { name: "focus", label: "Focus", Icon: Timer },
  stats: { name: "stats", label: "Stats", Icon: ChartBar },
};

export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { accent } = useAccent();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [layouts, setLayouts] = useState<Record<number, TabItemLayout>>({});

  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    const layout = computeIndicatorLayout(layouts, state.index);
    if (layout.width > 0) {
      indicatorX.value = withSpring(layout.x, { damping: 18, stiffness: 220 });
      indicatorWidth.value = withSpring(layout.width, { damping: 18, stiffness: 220 });
    }
  }, [layouts, state.index, indicatorX, indicatorWidth]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
    opacity: indicatorWidth.value > 0 ? 1 : 0,
  }));

  if (isKeyboardVisible) return null;

  return (
    <View
      style={{
        position: "absolute",
        bottom: insets.bottom + TAB_BAR_MARGIN_BOTTOM,
        left: 0,
        right: 0,
        alignItems: "center",
        paddingHorizontal: 16,
      }}
      pointerEvents="box-none"
    >
      <View
        style={{ height: FLOATING_TAB_BAR_HEIGHT }}
        className="w-full max-w-[380px] flex-row items-center justify-between px-3 bg-elevated border border-border rounded-pill relative overflow-hidden shadow-lg"
      >
        <Animated.View
          style={[
            animatedIndicatorStyle,
            {
              position: "absolute",
              top: 6,
              bottom: 6,
              borderRadius: 9999,
              backgroundColor: accent.softBackground,
              borderWidth: 1,
              borderColor: accent.borderHex,
            },
          ]}
        />

        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const config = TAB_CONFIGS[route.name] || { name: route.name, label: route.name, Icon: House };
          const Icon = config.Icon;
          const label = config.label;

          const onPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              onLayout={(e) => {
                const { x, width } = e.nativeEvent.layout;
                setLayouts((prev) => (prev[index]?.x === x && prev[index]?.width === width ? prev : { ...prev, [index]: { x, width } }));
              }}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={label}
              className={`flex-row items-center justify-center min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-full z-10 ${
                isFocused ? "flex-shrink-0" : "flex-shrink"
              }`}
            >
              <Icon
                size={22}
                color={isFocused ? accent.hex : THEME_COLORS.text.secondary}
                weight={isFocused ? "fill" : "regular"}
              />
              {isFocused && (
                <Text
                  variant="caption"
                  style={{ color: accent.hex }}
                  className="ml-1.5 font-bold text-[12px] leading-none"
                  numberOfLines={1}
                >
                  {label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
