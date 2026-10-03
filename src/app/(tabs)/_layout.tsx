import React from "react";
import { Tabs } from "expo-router";
import { FloatingTabBar } from "@/components/navigation/FloatingTabBar";
import { useT } from "@/core/i18n";

export default function TabsLayout() {
  const { t } = useT();

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.today"),
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: t("tabs.habits"),
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: t("tabs.planner"),
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          title: t("tabs.focus"),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: t("tabs.stats"),
        }}
      />
    </Tabs>
  );
}
