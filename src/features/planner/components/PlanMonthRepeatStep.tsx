import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { Calendar, Plus, Minus } from "@/components/icons";
import { Text, Button, Pill } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { DatePickerSheet } from "./DatePickerSheet";
import type { RecurrenceRule } from "../recurrence";

const WEEKDAYS = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 0 },
];

export interface PlanMonthRepeatStepProps {
  rule: RecurrenceRule;
  onChangeRule: (rule: RecurrenceRule) => void;
}

export function PlanMonthRepeatStep({
  rule,
  onChangeRule,
}: PlanMonthRepeatStepProps) {
  const [dateTarget, setDateTarget] = useState<"from" | "to" | "start" | null>(null);

  const activeType = rule.type;

  const handleTypeChange = (type: "weekdays" | "next_n_days" | "daily") => {
    if (type === "weekdays") {
      onChangeRule({
        type: "weekdays",
        weekdays: [1, 3, 5],
        from: rule.type === "next_n_days" ? rule.start : rule.from,
        to: rule.type === "next_n_days" ? rule.start : rule.to,
      });
    } else if (type === "next_n_days") {
      onChangeRule({
        type: "next_n_days",
        start: rule.type === "next_n_days" ? rule.start : rule.from,
        n: 14,
      });
    } else {
      onChangeRule({
        type: "daily",
        from: rule.type === "next_n_days" ? rule.start : rule.from,
        to: rule.type === "next_n_days" ? rule.start : rule.to,
      });
    }
  };

  const toggleWeekday = (val: number) => {
    if (rule.type !== "weekdays") return;
    const current = rule.weekdays;
    const next = current.includes(val)
      ? current.filter((w) => w !== val)
      : [...current, val];
    onChangeRule({ ...rule, weekdays: next });
  };

  const stepN = (delta: number) => {
    if (rule.type !== "next_n_days") return;
    onChangeRule({ ...rule, n: Math.max(1, Math.min(90, rule.n + delta)) });
  };

  const renderDateRow = (from: string, to: string) => (
    <View className="flex-row gap-3">
      <Pressable onPress={() => setDateTarget("from")} className="flex-1 bg-surface p-3 rounded-card border border-border">
        <Text variant="label" className="mb-1">FROM</Text>
        <View className="flex-row items-center gap-2">
          <Calendar size={16} color={THEME_COLORS.primary} />
          <Text variant="body" className="font-semibold text-sm">{from}</Text>
        </View>
      </Pressable>
      <Pressable onPress={() => setDateTarget("to")} className="flex-1 bg-surface p-3 rounded-card border border-border">
        <Text variant="label" className="mb-1">TO</Text>
        <View className="flex-row items-center gap-2">
          <Calendar size={16} color={THEME_COLORS.primary} />
          <Text variant="body" className="font-semibold text-sm">{to}</Text>
        </View>
      </Pressable>
    </View>
  );

  return (
    <View className="gap-5">
      <View className="gap-2">
        <Text variant="label">REPEAT PATTERN</Text>
        <View className="flex-row gap-2">
          <Pill label="Weekdays" selected={activeType === "weekdays"} onPress={() => handleTypeChange("weekdays")} />
          <Pill label="Next N Days" selected={activeType === "next_n_days"} onPress={() => handleTypeChange("next_n_days")} />
          <Pill label="Daily" selected={activeType === "daily"} onPress={() => handleTypeChange("daily")} />
        </View>
      </View>

      {rule.type === "weekdays" && (
        <View className="gap-3">
          <Text variant="label">SELECT DAYS OF THE WEEK</Text>
          <View className="flex-row flex-wrap gap-2">
            {WEEKDAYS.map((w) => (
              <Pill key={w.value} label={w.label} selected={rule.weekdays.includes(w.value)} onPress={() => toggleWeekday(w.value)} />
            ))}
          </View>
          {renderDateRow(rule.from, rule.to)}
        </View>
      )}

      {rule.type === "next_n_days" && (
        <View className="gap-4">
          <Pressable onPress={() => setDateTarget("start")} className="bg-surface p-3 rounded-card border border-border">
            <Text variant="label" className="mb-1">START DATE</Text>
            <View className="flex-row items-center gap-2">
              <Calendar size={16} color={THEME_COLORS.primary} />
              <Text variant="body" className="font-semibold text-sm">{rule.start}</Text>
            </View>
          </Pressable>
          <View className="items-center bg-surface p-4 rounded-card border border-border gap-2">
            <Text variant="label">DURATION (DAYS)</Text>
            <View className="flex-row items-center gap-4">
              <Button variant="secondary" size="sm" icon={<Minus size={16} color={THEME_COLORS.text.primary} />} onPress={() => stepN(-1)} />
              <Text className="text-3xl font-extrabold text-primary min-w-[50px] text-center">{rule.n}</Text>
              <Button variant="secondary" size="sm" icon={<Plus size={16} color={THEME_COLORS.text.primary} />} onPress={() => stepN(1)} />
            </View>
          </View>
        </View>
      )}

      {rule.type === "daily" && renderDateRow(rule.from, rule.to)}

      <DatePickerSheet
        visible={dateTarget !== null}
        onClose={() => setDateTarget(null)}
        selectedDate={dateTarget === "start" ? (rule as any).start : dateTarget === "from" ? (rule as any).from : (rule as any).to || (rule as any).from}
        onSelectDate={(d) => {
          if (dateTarget === "from" && (rule.type === "weekdays" || rule.type === "daily")) onChangeRule({ ...rule, from: d });
          else if (dateTarget === "to" && (rule.type === "weekdays" || rule.type === "daily")) onChangeRule({ ...rule, to: d });
          else if (dateTarget === "start" && rule.type === "next_n_days") onChangeRule({ ...rule, start: d });
        }}
      />
    </View>
  );
}
