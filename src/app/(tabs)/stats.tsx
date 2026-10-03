import React, { useState } from "react";
import { View, RefreshControl } from "react-native";
import { router } from "expo-router";
import { ChartBar } from "phosphor-react-native";
import { Screen, Text, EmptyState, Button } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { todayStr } from "@/core/utils/dates";
import {
  useStatsData,
  RangeSwitch,
  StatsView,
  StatsSkeleton,
  type StatsRange,
} from "@/features/stats";
import { useT } from "@/core/i18n";

export default function StatsScreen() {
  const { t } = useT();
  const [range, setRange] = useState<StatsRange>("7d");
  const { data, loading, error, retry, refresh } = useStatsData(range);
  const [refreshing, setRefreshing] = useState(false);
  const today = todayStr();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <Screen
      scroll
      withTabBarInset
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={THEME_COLORS.lime}
          colors={[THEME_COLORS.lime]}
        />
      }
    >
      {/* Header with Title and Range Switch */}
      <View className="pt-2 pb-4">
        <View className="flex-row items-center gap-1.5 mb-1">
          <ChartBar size={14} color={THEME_COLORS.lime} weight="fill" />
          <Text variant="label">{t("stats.title").toUpperCase()}</Text>
        </View>
        <Text variant="display" className="mb-4">
          {t("stats.overview")}
        </Text>

        <RangeSwitch value={range} onChange={(r) => setRange(r)} />
      </View>

      {/* Loading Skeleton */}
      {loading && !data && <StatsSkeleton />}

      {/* Error State */}
      {error && !loading && (
        <View className="bg-surface border border-coral/20 rounded-2xl p-6 items-center my-6">
          <Text className="text-coral font-bold text-base mb-1">
            {t("common.error")}
          </Text>
          <Text className="text-muted text-xs text-center mb-4">{error}</Text>
          <Button variant="secondary" size="sm" title={t("common.retry")} onPress={retry} />
        </View>
      )}

      {/* Empty State when range has no data */}
      {!loading && data && !data.hasData && (
        <EmptyState
          illustration="empty-stats"
          title={t("stats.noStatsData")}
          description={t("stats.noStatsDesc")}
          actionLabel={t("common.today")}
          onAction={() => router.push("/(tabs)")}
          className="mt-4"
        />
      )}

      {/* Data Loaded: Bento Layout */}
      {!loading && data && data.hasData && (
        <StatsView data={data} highlightToday={today} />
      )}
    </Screen>
  );
}
