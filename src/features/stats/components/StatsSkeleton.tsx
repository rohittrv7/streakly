import React from "react";
import { View } from "react-native";
import { Skeleton } from "@/components/ui/Skeleton";

export function StatsSkeleton() {
  return (
    <View className="gap-4 w-full pt-2">
      {/* Hero card skeleton */}
      <Skeleton height={140} borderRadius={24} />

      {/* Two Stat cards row */}
      <View className="flex-row gap-3">
        <Skeleton height={96} borderRadius={16} className="flex-1" />
        <Skeleton height={96} borderRadius={16} className="flex-1" />
      </View>

      {/* Consistency chart card */}
      <Skeleton height={200} borderRadius={20} />

      {/* Heatmap card */}
      <Skeleton height={170} borderRadius={20} />

      {/* Focus card */}
      <Skeleton height={220} borderRadius={20} />

      {/* Habits card */}
      <Skeleton height={180} borderRadius={20} />
    </View>
  );
}
