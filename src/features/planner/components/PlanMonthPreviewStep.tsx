import React from "react";
import { View, ScrollView } from "react-native";
import { ArrowLeft, Plus } from "phosphor-react-native";
import { Text, Button, Checkbox, Card } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";

export interface PlanMonthPreviewStepProps {
  previewDates: Array<{ date: string; selected: boolean }>;
  onToggleDate: (dateStr: string) => void;
  onBack: () => void;
  onAddToPlan: () => void;
}

export function PlanMonthPreviewStep({
  previewDates,
  onToggleDate,
  onBack,
  onAddToPlan,
}: PlanMonthPreviewStepProps) {
  const selectedCount = previewDates.filter((d) => d.selected).length;

  return (
    <View className="gap-5 pb-8">
      <View className="flex-row items-center justify-between">
        <Text variant="label">PREVIEW DATES</Text>
        <Text variant="caption" className="font-bold text-primary">
          {selectedCount} sessions selected
        </Text>
      </View>

      <Card variant="surface" className="max-h-72 p-2 border border-border">
        <ScrollView nestedScrollEnabled className="gap-1">
          {previewDates.map((item) => (
            <View
              key={item.date}
              className="flex-row items-center justify-between p-2 rounded-card active:bg-elevated"
            >
              <Text variant="body" className="font-semibold text-sm">
                {item.date}
              </Text>
              <Checkbox
                checked={item.selected}
                onCheckedChange={() => onToggleDate(item.date)}
                color="lime"
                accessibilityLabel={`Include ${item.date}`}
              />
            </View>
          ))}
        </ScrollView>
      </Card>

      <View className="flex-row gap-3 pt-2">
        <Button
          variant="secondary"
          title="Back"
          icon={<ArrowLeft size={16} color={THEME_COLORS.text.primary} />}
          onPress={onBack}
          className="flex-1"
        />
        <Button
          variant="primary"
          title="Add to Plan"
          icon={<Plus size={18} color={THEME_COLORS.background} />}
          onPress={onAddToPlan}
          className="flex-1"
          disabled={selectedCount === 0}
        />
      </View>
    </View>
  );
}
