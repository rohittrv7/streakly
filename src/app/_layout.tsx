import "../../global.css";
import React, { useState, useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { PlusJakartaSans_400Regular } from "@expo-google-fonts/plus-jakarta-sans/400Regular";
import { PlusJakartaSans_500Medium } from "@expo-google-fonts/plus-jakarta-sans/500Medium";
import { PlusJakartaSans_600SemiBold } from "@expo-google-fonts/plus-jakarta-sans/600SemiBold";
import { PlusJakartaSans_700Bold } from "@expo-google-fonts/plus-jakarta-sans/700Bold";
import { PlusJakartaSans_800ExtraBold } from "@expo-google-fonts/plus-jakarta-sans/800ExtraBold";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { vars } from "nativewind";
import { DbProvider } from "@/lib/db";
import { useHabitsStore } from "@/features/habits";
import { configureReanimatedLogger } from "react-native-reanimated";
import { THEME_COLORS, ACCENT_MAP, DEFAULT_ACCENT } from "@/lib/theme";
import { useAccentStore } from "@/lib/theme/store";
import { useSettingsStore } from "@/features/settings/store";
import { useLanguageStore } from "@/core/i18n";
import { useNotificationSync } from "@/lib/notifications";
import { RootErrorBoundary } from "@/components/ui/RootErrorBoundary";

export { RootErrorBoundary as ErrorBoundary };

// Disable Reanimated strict-mode warning for shared value reads/writes during render
configureReanimatedLogger({
  strict: false,
});

// Keep the splash screen visible while fonts and DB initialize
SplashScreen.preventAutoHideAsync().catch(() => {});

function NotificationSyncWrapper({ children }: { children: React.ReactNode }) {
  useNotificationSync();
  return <>{children}</>;
}

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const loadHabits = useHabitsStore((s) => s.load);
  const accentKey = useAccentStore((s) => s.accentKey);
  const def = ACCENT_MAP[accentKey] || ACCENT_MAP[DEFAULT_ACCENT];

  const themeVars = vars({
    "--color-accent": def.rgbString,
    "--color-accent-soft": def.softBackground,
    "--color-accent-border": def.borderHex,
  });

  const [fontsLoaded, fontError] = useFonts({
    "PlusJakartaSans-Regular": PlusJakartaSans_400Regular,
    "PlusJakartaSans-Medium": PlusJakartaSans_500Medium,
    "PlusJakartaSans-SemiBold": PlusJakartaSans_600SemiBold,
    "PlusJakartaSans-Bold": PlusJakartaSans_700Bold,
    "PlusJakartaSans-ExtraBold": PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (dbReady) {
      (async () => {
        await useLanguageStore.getState().loadLanguage();
        await useSettingsStore.getState().loadSettings();
        await loadHabits();
        setSettingsLoaded(true);
      })();
    }
  }, [dbReady, loadHabits]);

  useEffect(() => {
    if ((fontsLoaded || fontError) && dbReady && settingsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError, dbReady, settingsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[{ flex: 1, backgroundColor: THEME_COLORS.background }, themeVars]}>
        <StatusBar style="light" />
        <DbProvider onReady={() => setDbReady(true)}>
          {dbReady && settingsLoaded ? (
            <NotificationSyncWrapper>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: THEME_COLORS.background },
                  animation: "fade",
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="habit/new"
                  options={{
                    presentation: "modal",
                    animation: "slide_from_bottom",
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="habit/[id]"
                  options={{
                    presentation: "card",
                    animation: "default",
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="task/[id]"
                  options={{
                    presentation: "modal",
                    animation: "slide_from_bottom",
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="task/view/[id]"
                  options={{
                    presentation: "modal",
                    animation: "slide_from_bottom",
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="plan-month"
                  options={{
                    presentation: "modal",
                    animation: "slide_from_bottom",
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="settings"
                  options={{
                    presentation: "card",
                    animation: "default",
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="ui-gallery"
                  options={{
                    presentation: "card",
                    animation: "default",
                    headerShown: false,
                  }}
                />
              </Stack>
            </NotificationSyncWrapper>
          ) : (
            <View style={{ flex: 1, backgroundColor: THEME_COLORS.background }} />
          )}
        </DbProvider>
      </View>
    </GestureHandlerRootView>
  );
}
