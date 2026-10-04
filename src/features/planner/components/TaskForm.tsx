import React, { useState } from "react";
import { View } from "react-native";
import { Trash, Copy } from "@/components/icons";
import { Button, Pill, Input } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { CATEGORY_COLORS } from "../calendar";
import { validateTask, type TaskValidationErrors } from "../utils";
import type { Task, TaskCategory, TaskChecklistItem } from "../types";
import { DatePickerSheet } from "./DatePickerSheet";
import { TimePickerSheet } from "./TimePickerSheet";
import { TaskChecklistSection } from "./TaskChecklistSection";
import { TaskFormDateTimeRow } from "./TaskFormDateTimeRow";
import { TaskFormTitleRow } from "./TaskFormTitleRow";
import { DeleteTaskSheet } from "./DeleteTaskSheet";
import { YouTubeSection, type TaskLink } from "@/features/youtube";
import { todayStr } from "@/core/utils/dates";
import { useTaskFormYouTube } from "./useTaskFormYouTube";
import { useT } from "@/core/i18n";

const CATEGORIES: TaskCategory[] = ["Study", "Fitness", "Reading", "Work", "Custom"];

export interface TaskFormProps {
  initialTask?: Task | null;
  initialDate?: string;
  initialChecklist?: TaskChecklistItem[];
  initialLinks?: TaskLink[];
  onSubmit: (data: {
    title: string;
    notes?: string | null;
    category: TaskCategory;
    date: string;
    startTime?: string | null;
    endTime?: string | null;
    checklist?: TaskChecklistItem[];
    links?: TaskLink[];
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
  onDuplicate?: () => Promise<void>;
  submitLabel?: string;
}

export function TaskForm({
  initialTask,
  initialDate,
  initialChecklist = [],
  initialLinks = [],
  onSubmit,
  onDelete,
  onDuplicate,
  submitLabel: customSubmitLabel,
}: TaskFormProps) {
  const { t } = useT();
  const submitLabel = customSubmitLabel || (initialTask ? t("planner.saveTask") : t("planner.createTask"));
  const [title, setTitle] = useState(initialTask?.title || "");
  const [notes, setNotes] = useState(initialTask?.notes || "");
  const [category, setCategory] = useState<TaskCategory>(initialTask?.category || "Study");
  const [date, setDate] = useState(initialTask?.date || initialDate || todayStr());
  const [startTime, setStartTime] = useState<string | null>(initialTask?.startTime || null);
  const [endTime, setEndTime] = useState<string | null>(initialTask?.endTime || null);
  const [checklist, setChecklist] = useState<TaskChecklistItem[]>(initialChecklist);

  const [errors, setErrors] = useState<TaskValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [dateSheetVisible, setDateSheetVisible] = useState(false);
  const [timePickerTarget, setTimePickerTarget] = useState<"start" | "end" | null>(null);
  const [deleteSheetVisible, setDeleteSheetVisible] = useState(false);

  const yt = useTaskFormYouTube({
    initialTaskId: initialTask?.id,
    initialLinks,
    currentTitle: title,
    onSetTitle: setTitle,
    onClearTitleError: () => setErrors((e) => ({ ...e, title: undefined })),
  });

  const handleSubmit = async () => {
    const val = validateTask({ title, startTime, endTime });
    if (!val.valid) {
      setErrors(val.errors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        notes: notes.trim() || null,
        category,
        date,
        startTime,
        endTime,
        checklist,
        links: yt.pendingLinks,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="gap-5 pb-12">
      <TaskFormTitleRow
        title={title}
        error={errors.title}
        isFetchingTitle={yt.isFetchingTitle}
        showAutofillCaption={yt.showAutofillCaption}
        onChangeText={yt.onUserChangeTitle}
        onUndoAutofill={yt.onUndoAutofill}
      />

      <View className="gap-2">
        <View className="flex-row flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Pill key={cat} label={cat} selected={category === cat} colorDot={CATEGORY_COLORS[cat]} onPress={() => setCategory(cat)} />
          ))}
        </View>
      </View>

      <TaskFormDateTimeRow
        date={date}
        startTime={startTime}
        endTime={endTime}
        onPressDate={() => setDateSheetVisible(true)}
        onPressStartTime={() => setTimePickerTarget("start")}
        onPressEndTime={() => setTimePickerTarget("end")}
        timesError={errors.times}
      />

      <Input label="NOTES (OPTIONAL)" placeholder="Add details, links, or context..." value={notes} onChangeText={setNotes} multiline numberOfLines={3} />

      <TaskChecklistSection
        items={checklist}
        onAdd={(text) => setChecklist((c) => [...c, { id: Date.now().toString(), taskId: initialTask?.id || "", text, done: false, position: c.length }])}
        onToggle={(id) => setChecklist((c) => c.map((i) => (i.id === id ? { ...i, done: !i.done } : i)))}
        onRemove={(id) => setChecklist((c) => c.filter((i) => i.id !== id))}
      />

      <YouTubeSection
        mode="edit"
        pendingLinks={yt.pendingLinks}
        pendingMetadataStatus={yt.pendingMetaStatus}
        onAddPendingLink={yt.handleAddPendingLink}
        onRemovePendingLink={(id) => yt.setPendingLinks((p) => p.filter((x) => x.id !== id))}
        onTogglePendingWatched={(id) => yt.setPendingLinks((p) => p.map((x) => (x.id === id ? { ...x, watched: !x.watched } : x)))}
        onUpdatePendingProgress={(id, d, tot) => yt.setPendingLinks((p) => p.map((x) => (x.id === id ? { ...x, playlistDone: d, playlistTotal: tot } : x)))}
        onSetPendingWatchedTill={(id, sec) => yt.setPendingLinks((p) => p.map((x) => (x.id === id ? { ...x, watchedTillSeconds: sec } : x)))}
        onSetPendingNote={(id, n) => yt.setPendingLinks((p) => p.map((x) => (x.id === id ? { ...x, note: n } : x)))}
        onRetryPendingMetadata={yt.handleRetryPendingMetadata}
      />

      <View className="gap-3 pt-2">
        <Button variant="primary" title={submitLabel} onPress={handleSubmit} loading={loading} />
        {initialTask && onDuplicate && (
          <Button variant="secondary" title={t("planner.duplicateTask")} icon={<Copy size={16} color={THEME_COLORS.text.primary} />} onPress={onDuplicate} />
        )}
        {initialTask && onDelete && (
          <Button variant="ghost" title={t("planner.deleteTask")} icon={<Trash size={16} color={THEME_COLORS.coral} />} textClassName="text-coral" onPress={() => setDeleteSheetVisible(true)} />
        )}
      </View>

      <DatePickerSheet visible={dateSheetVisible} onClose={() => setDateSheetVisible(false)} selectedDate={date} onSelectDate={setDate} />
      <TimePickerSheet
        visible={timePickerTarget !== null}
        onClose={() => setTimePickerTarget(null)}
        title={timePickerTarget === "start" ? "Select Start Time" : "Select End Time"}
        initialTime={timePickerTarget === "start" ? startTime : endTime}
        onSelectTime={(t) => { if (timePickerTarget === "start") setStartTime(t); else setEndTime(t); }}
      />
      <DeleteTaskSheet visible={deleteSheetVisible} onClose={() => setDeleteSheetVisible(false)} title={title} onConfirm={onDelete || (() => {})} />
    </View>
  );
}
