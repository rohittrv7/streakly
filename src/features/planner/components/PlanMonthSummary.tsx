import React from "react";
import { View, Pressable } from "react-native";
import { Plus, Trash, CheckCircle } from "@/components/icons";
import { Card, Text, Button } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { CATEGORY_COLORS } from "../calendar";
import type { TaskCategory } from "../types";

export interface StagedPlanTemplate {
  id: string;
  title: string;
  category: TaskCategory;
  startTime?: string | null;
  endTime?: string | null;
  notes?: string | null;
  dates: string[];
}

export interface PlanMonthSummaryProps {
  templates: StagedPlanTemplate[];
  onRemoveTemplate: (id: string) => void;
  onAddAnother: () => void;
  onCreatePlan: () => Promise<void>;
  loading: boolean;
}

export function PlanMonthSummary({
  templates,
  onRemoveTemplate,
  onAddAnother,
  onCreatePlan,
  loading,
}: PlanMonthSummaryProps) {
  const totalTasks = templates.reduce((sum, t) => sum + t.dates.length, 0);

  return (
    <View className="gap-5">
      <Card variant="surface" className="p-4 border border-border">
        <View className="flex-row items-center justify-between mb-1">
          <Text variant="title" className="text-lg font-bold">Planned Routines</Text>
          <View className="bg-primary/20 px-2.5 py-0.5 rounded-pill border border-primary/40">
            <Text className="text-xs font-extrabold text-primary">{totalTasks} tasks total</Text>
          </View>
        </View>
        <Text variant="caption">Review your staged routines before saving them to the planner.</Text>
      </Card>

      {/* List of templates */}
      <View className="gap-3">
        {templates.map((tpl) => {
          const categoryColor = CATEGORY_COLORS[tpl.category] || THEME_COLORS.sky;
          return (
            <Card key={tpl.id} variant="surface" className="p-3.5 border border-border">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2.5 flex-1 mr-2">
                  <View style={{ backgroundColor: categoryColor }} className="w-1.5 h-9 rounded-pill" />
                  <View className="flex-1">
                    <Text variant="body" className="font-bold text-sm">{tpl.title}</Text>
                    <Text variant="caption" className="text-[11px] text-text-secondary mt-0.5">
                      {tpl.category} • {tpl.dates.length} sessions
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => onRemoveTemplate(tpl.id)}
                  hitSlop={8}
                  className="p-2 active:opacity-60"
                  accessibilityLabel={`Remove ${tpl.title}`}
                >
                  <Trash size={18} color={THEME_COLORS.text.muted} />
                </Pressable>
              </View>
            </Card>
          );
        })}
      </View>

      {/* Actions */}
      <View className="gap-2.5 pt-2">
        <Button
          variant="secondary"
          title="Add Another Routine"
          icon={<Plus size={16} color={THEME_COLORS.text.primary} />}
          onPress={onAddAnother}
        />
        <Button
          variant="primary"
          title={`Create Plan (${totalTasks} Tasks)`}
          icon={<CheckCircle size={18} color={THEME_COLORS.background} weight="bold" />}
          onPress={onCreatePlan}
          loading={loading}
          disabled={totalTasks === 0}
        />
      </View>
    </View>
  );
}
