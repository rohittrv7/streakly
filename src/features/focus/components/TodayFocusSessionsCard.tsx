import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { format, parseISO } from "date-fns";
import { DotsThreeVertical, Trash } from "phosphor-react-native";
import { Card, Text, Sheet, Button } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { usePlannerStore } from "@/features/planner/store";
import type { FocusSession } from "../types";
import { useT } from "@/core/i18n";

export interface TodayFocusSessionsCardProps {
  sessions: FocusSession[];
  todayMinutes: number;
  todaySessionCount: number;
  onDeleteSession: (id: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Study: THEME_COLORS.lime,
  Fitness: THEME_COLORS.mint,
  Reading: THEME_COLORS.coral,
  Work: THEME_COLORS.sky,
  Custom: THEME_COLORS.text.muted,
};

export function TodayFocusSessionsCard({
  sessions,
  todayMinutes,
  todaySessionCount,
  onDeleteSession,
}: TodayFocusSessionsCardProps) {
  const { t } = useT();
  const tasks = usePlannerStore((s) => s.tasks);
  const [deleteTarget, setDeleteTarget] = useState<FocusSession | null>(null);

  const formatSessionTime = (isoString: string) => {
    try {
      return format(parseISO(isoString), "h:mm a");
    } catch {
      return "--:--";
    }
  };

  return (
    <Card variant="surface" className="p-4 mx-1 border border-border gap-3.5 mb-6">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-border pb-3">
        <View>
          <Text variant="label" className="text-[11px] text-text-muted tracking-wider">
            {t("focus.todaySessions").toUpperCase()}
          </Text>
          <Text variant="body" className="font-extrabold text-base text-text-primary mt-0.5">
            {todayMinutes} {t("common.min")}
          </Text>
        </View>

        <View className="bg-primary/20 px-2.5 py-1 rounded-pill border border-primary/40">
          <Text className="text-[11px] font-extrabold text-primary">
            {todaySessionCount} {t("focus.cycles").toLowerCase()}
          </Text>
        </View>
      </View>

      {/* Sessions list */}
      {sessions.length === 0 ? (
        <View className="py-4 items-center justify-center">
          <Text variant="caption" className="text-text-muted text-xs text-center">
            {t("focus.noSessionsToday")}
          </Text>
        </View>
      ) : (
        <View className="gap-2.5">
          {sessions.map((s) => {
            const task = tasks.find((t) => t.id === s.taskId);
            const title = task ? task.title : s.category;
            const mins = Math.max(1, Math.round(s.durationSeconds / 60));
            const dotColor = CATEGORY_COLORS[s.category] || THEME_COLORS.primary;

            return (
              <View
                key={s.id}
                className="flex-row items-center justify-between py-1.5 px-2.5 rounded-xl bg-elevated border border-border"
              >
                <View className="flex-row items-center gap-2.5 flex-1 mr-2">
                  <View
                    style={{ backgroundColor: dotColor }}
                    className="w-2.5 h-2.5 rounded-full"
                  />
                  <View className="flex-1">
                    <Text variant="body" className="font-bold text-xs text-text-primary" numberOfLines={1}>
                      {title}
                    </Text>
                    <View className="flex-row items-center gap-2 mt-0.5">
                      <Text variant="caption" className="text-[10px] text-text-muted">
                        {formatSessionTime(s.startedAt)} • {mins}m
                      </Text>
                      <View
                        className={`px-1.5 py-0.2 rounded-pill ${
                          s.completed ? "bg-mint/20 border border-mint/40" : "bg-coral/20 border border-coral/40"
                        }`}
                      >
                        <Text
                          className={`text-[9px] font-bold ${
                            s.completed ? "text-mint" : "text-coral"
                          }`}
                        >
                          {s.completed ? "Completed" : "Stopped early"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Dots menu / Delete */}
                <Pressable
                  onPress={() => setDeleteTarget(s)}
                  hitSlop={8}
                  className="w-8 h-8 items-center justify-center rounded-full active:opacity-60"
                  accessibilityLabel="Session options"
                >
                  <DotsThreeVertical size={16} color={THEME_COLORS.text.muted} weight="bold" />
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      {/* Delete Confirmation Sheet */}
      <Sheet
        visible={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Session Record?"
      >
        <View className="gap-4 pb-2">
          <Text variant="body" className="text-text-secondary">
            Are you sure you want to delete this {deleteTarget ? Math.round(deleteTarget.durationSeconds / 60) : 0}-minute session record?
          </Text>
          <View className="gap-2">
            <Button
              variant="secondary"
              className="bg-coral/20 border-coral/40"
              textClassName="text-coral"
              title="Delete Session"
              icon={<Trash size={16} color={THEME_COLORS.coral} />}
              onPress={() => {
                if (deleteTarget) {
                  onDeleteSession(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
            />
            <Button variant="secondary" title="Cancel" onPress={() => setDeleteTarget(null)} />
          </View>
        </View>
      </Sheet>
    </Card>
  );
}
