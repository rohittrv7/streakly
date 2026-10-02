import React, { useState, useEffect } from "react";
import { View, Pressable } from "react-native";
import { Card, Text, Button } from "@/components/ui";
import {
  getScheduledNotifications,
  reconcileNotificationsNow,
  scheduleTestNotification,
  cancelAllOurNotifications,
  getConfiguredChannelCount,
  getPermissionStatus,
  useReconcileStore,
  type ScheduledNotificationItem,
} from "@/lib/notifications";
import { Haptics } from "@/core/utils/haptics";

export function NotificationDevSection() {
  const [data, setData] = useState<{
    total: number;
    ourCount: number;
    items: ScheduledNotificationItem[];
  }>({ total: 0, ourCount: 0, items: [] });
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [permStatus, setPermStatus] = useState<string>("checking...");
  const [testResult, setTestResult] = useState<string | null>(null);

  const lastReconcile = useReconcileStore((s) => s.lastResult);
  const channelsCount = getConfiguredChannelCount();

  const refresh = async () => {
    const [res, perm] = await Promise.all([
      getScheduledNotifications(),
      getPermissionStatus(),
    ]);
    setData(res);
    setPermStatus(perm.status);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleReconcile = async () => {
    setLoading(true);
    await reconcileNotificationsNow();
    await refresh();
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  const handleTestNotification = async (seconds: number) => {
    setLoading(true);
    setTestResult(`Scheduling test in ${seconds}s...`);
    const res = await scheduleTestNotification(seconds);
    await refresh();
    setLoading(false);

    if (res.success) {
      setTestResult(`✅ Scheduled id: ${res.id}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      setTestResult(`❌ Error: ${res.error}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    }
  };

  const handleCancelAll = async () => {
    setLoading(true);
    await cancelAllOurNotifications();
    await refresh();
    setLoading(false);
    setTestResult(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  };

  return (
    <Card variant="surface" className="p-4 mb-4 border border-border">
      <View className="flex-row items-center justify-between mb-2">
        <Text variant="body" className="font-bold text-primary">
          Notification Debug (Dev)
        </Text>
        <Text variant="caption" className="font-semibold text-text-secondary">
          {data.ourCount} / 60 pending
        </Text>
      </View>

      {/* Diagnostics Row */}
      <View className="p-2.5 rounded bg-background/50 border border-border gap-1 mb-2">
        <Text variant="caption" className="text-xs">
          Permission: <Text className="font-bold text-text-primary">{permStatus}</Text> | Channels: <Text className="font-bold text-text-primary">{channelsCount}</Text>
        </Text>
        {lastReconcile && (
          <Text variant="caption" className="text-xs text-text-secondary">
            Last reconcile at {lastReconcile.at}: {lastReconcile.scheduledCount} sched, {lastReconcile.cancelledCount} canc, {lastReconcile.errors.length} err
          </Text>
        )}
        {testResult && (
          <Text variant="caption" className="text-xs font-semibold text-primary mt-0.5">
            {testResult}
          </Text>
        )}
      </View>

      <View className="gap-2 my-2">
        <Button
          size="sm"
          variant="secondary"
          title="Reconcile Now"
          loading={loading}
          onPress={handleReconcile}
        />

        <View className="flex-row gap-2">
          <Button
            size="sm"
            variant="secondary"
            title="Test in 10s"
            onPress={() => handleTestNotification(10)}
            className="flex-1"
          />
          <Button
            size="sm"
            variant="secondary"
            title="Test in 2m"
            onPress={() => handleTestNotification(120)}
            className="flex-1"
          />
        </View>

        <Button
          size="sm"
          variant="ghost"
          title="Clear All Scheduled"
          textClassName="text-coral"
          onPress={handleCancelAll}
        />
      </View>

      <Pressable onPress={() => setExpanded(!expanded)} className="py-1">
        <Text variant="caption" className="text-primary underline">
          {expanded ? "Hide scheduled list" : `View scheduled list (${data.items.length})`}
        </Text>
      </Pressable>

      {expanded && (
        <View className="mt-2 pt-2 border-t border-border gap-2">
          {data.items.length === 0 ? (
            <Text variant="caption" className="text-text-muted">
              No Streakly notifications currently scheduled.
            </Text>
          ) : (
            data.items.map((item) => (
              <View key={item.id} className="p-2 rounded bg-surface border border-border">
                <Text variant="caption" className="font-bold text-text-primary">
                  {item.id}
                </Text>
                <Text variant="caption" className="text-text-secondary">
                  {item.title} — {item.body}
                </Text>
                <Text variant="caption" className="text-xs text-primary mt-0.5">
                  At: {item.triggerDescription}
                </Text>
              </View>
            ))
          )}
        </View>
      )}
    </Card>
  );
}
