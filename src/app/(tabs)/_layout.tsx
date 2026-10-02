import React from "react";
import { Tabs } from "expo-router";
import { FloatingTabBar } from "@/components/navigation/FloatingTabBar";

export default function TabsLayout() {
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
          title: "Today",
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: "Habits",
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: "Planner",
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          title: "Focus",
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
        }}
      />
    </Tabs>
  );
}
