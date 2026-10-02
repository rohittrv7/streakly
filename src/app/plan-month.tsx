import React, { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { X, ArrowRight, ArrowLeft, CalendarBlank } from "phosphor-react-native";
import { Haptics } from "@/core/utils/haptics";
import { parseISO, endOfMonth } from "date-fns";
import { Screen, Text, Button, Input, Pill, Sheet } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { todayStr, toDateStr } from "@/core/utils/dates";
import { expandRecurrence, type RecurrenceRule } from "@/features/planner/recurrence";
import { CATEGORY_COLORS } from "@/features/planner/calendar";
import { usePlanner } from "@/features/planner/hooks";
import type { TaskCategory } from "@/features/planner/types";
import { PlanMonthRepeatStep } from "@/features/planner/components/PlanMonthRepeatStep";
import { PlanMonthPreviewStep } from "@/features/planner/components/PlanMonthPreviewStep";
import { PlanMonthSummary, type StagedPlanTemplate } from "@/features/planner/components/PlanMonthSummary";

const CATEGORIES: TaskCategory[] = ["Study", "Fitness", "Reading", "Work", "Custom"];

export default function PlanMonthModal() {
  const router = useRouter();
  const { createMany } = usePlanner();

  const today = todayStr();
  const monthEnd = toDateStr(endOfMonth(parseISO(`${today}T12:00:00`)));

  const [step, setStep] = useState<1 | 2 | 3 | "summary">(1);
  const [stagedTemplates, setStagedTemplates] = useState<StagedPlanTemplate[]>([]);
  const [showDiscardSheet, setShowDiscardSheet] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("Study");
  const [notes, setNotes] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);

  const [rule, setRule] = useState<RecurrenceRule>({
    type: "weekdays",
    weekdays: [1, 3, 5],
    from: today,
    to: monthEnd,
  });

  const [previewDates, setPreviewDates] = useState<Array<{ date: string; selected: boolean }>>([]);

  const handleNextStep1 = () => {
    if (!title.trim()) {
      setTitleError("Task title is required");
      return;
    }
    setTitleError(null);
    setStep(2);
  };

  const handleNextStep2 = () => {
    const dates = expandRecurrence(rule);
    setPreviewDates(dates.map((d) => ({ date: d, selected: true })));
    setStep(3);
  };

  const handleAddToPlan = () => {
    const selected = previewDates.filter((d) => d.selected).map((d) => d.date);
    if (selected.length === 0) return;

    setStagedTemplates((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title: title.trim(),
        category,
        notes: notes.trim() || null,
        dates: selected,
      },
    ]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setTitle("");
    setNotes("");
    setStep("summary");
  };

  const handleFinalCreate = async () => {
    const allTasks = stagedTemplates.flatMap((tpl) =>
      tpl.dates.map((d) => ({
        title: tpl.title,
        notes: tpl.notes,
        category: tpl.category,
        date: d,
      }))
    );
    if (allTasks.length === 0) return;

    setSaving(true);
    try {
      await createMany(allTasks);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll>
      <View className="flex-row items-center justify-between pt-2 pb-4 mb-4 border-b border-border">
        <View>
          <View className="flex-row items-center gap-1.5 mb-0.5">
            <CalendarBlank size={14} color={THEME_COLORS.primary} weight="fill" />
            <Text variant="label">PLANNER</Text>
          </View>
          <Text variant="title">
            {step === "summary" ? "Plan Summary" : `Plan Month • Step ${step} of 3`}
          </Text>
        </View>

        <Button
          variant="icon-only"
          size="sm"
          icon={<X size={18} color={THEME_COLORS.text.primary} weight="bold" />}
          onPress={() => {
            if (stagedTemplates.length > 0 || title.trim().length > 0) setShowDiscardSheet(true);
            else router.back();
          }}
          accessibilityLabel="Close"
        />
      </View>

      {step === 1 && (
        <View className="gap-5 pb-8">
          <Input
            label="TASK TITLE *"
            placeholder="e.g. Physics Revision"
            value={title}
            onChangeText={(t) => { setTitle(t); if (titleError) setTitleError(null); }}
            error={titleError || undefined}
          />
          <View className="gap-2">
            <Text variant="label">CATEGORY</Text>
            <View className="flex-row flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Pill key={cat} label={cat} selected={category === cat} colorDot={CATEGORY_COLORS[cat]} onPress={() => setCategory(cat)} />
              ))}
            </View>
          </View>
          <Input label="NOTES (OPTIONAL)" placeholder="Objectives or focus topics..." value={notes} onChangeText={setNotes} multiline numberOfLines={2} />
          <Button variant="primary" title="Next: Repeat Rule" icon={<ArrowRight size={18} color={THEME_COLORS.background} />} onPress={handleNextStep1} className="mt-2" />
        </View>
      )}

      {step === 2 && (
        <View className="gap-5 pb-8">
          <PlanMonthRepeatStep rule={rule} onChangeRule={setRule} />
          <View className="flex-row gap-3 pt-2">
            <Button variant="secondary" title="Back" icon={<ArrowLeft size={16} color={THEME_COLORS.text.primary} />} onPress={() => setStep(1)} className="flex-1" />
            <Button variant="primary" title="Preview Dates" icon={<ArrowRight size={18} color={THEME_COLORS.background} />} onPress={handleNextStep2} className="flex-1" />
          </View>
        </View>
      )}

      {step === 3 && (
        <PlanMonthPreviewStep
          previewDates={previewDates}
          onToggleDate={(dStr) =>
            setPreviewDates((prev) => prev.map((d) => (d.date === dStr ? { ...d, selected: !d.selected } : d)))
          }
          onBack={() => setStep(2)}
          onAddToPlan={handleAddToPlan}
        />
      )}

      {step === "summary" && (
        <PlanMonthSummary
          templates={stagedTemplates}
          onRemoveTemplate={(id) => setStagedTemplates((t) => t.filter((x) => x.id !== id))}
          onAddAnother={() => setStep(1)}
          onCreatePlan={handleFinalCreate}
          loading={saving}
        />
      )}

      <Sheet visible={showDiscardSheet} onClose={() => setShowDiscardSheet(false)} title="Discard Plan?">
        <View className="gap-4 pb-2">
          <Text variant="body" className="text-text-secondary">
            You have unsaved routines in your monthly plan. If you close now, your progress will be lost.
          </Text>
          <View className="gap-2">
            <Button variant="secondary" className="bg-coral/20 border-coral/40" textClassName="text-coral" title="Discard and Exit" onPress={() => { setShowDiscardSheet(false); router.back(); }} />
            <Button variant="secondary" title="Keep Editing" onPress={() => setShowDiscardSheet(false)} />
          </View>
        </View>
      </Sheet>
    </Screen>
  );
}
