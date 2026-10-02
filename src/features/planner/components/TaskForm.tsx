import React, { useState } from "react";
import { View } from "react-native";
import { Trash, Copy } from "phosphor-react-native";
import { Button, Pill } from "@/components/ui";
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
import {
  YouTubeSection,
  parseYouTubeUrl,
  getFallbackThumbnail,
  fetchOEmbed,
  cleanVideoTitle,
  shouldAutofillTitle,
  type TaskLink,
} from "@/features/youtube";
import { todayStr } from "@/core/utils/dates";
import { generateId } from "@/core/utils/id";
import { Input } from "@/components/ui";

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
  submitLabel = initialTask ? "Save Changes" : "Create Task",
}: TaskFormProps) {
  const [title, setTitle] = useState(initialTask?.title || "");
  const [titleTouched, setTitleTouched] = useState(false);
  const [alreadyFilled, setAlreadyFilled] = useState(false);
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);
  const [showAutofillCaption, setShowAutofillCaption] = useState(false);

  const [notes, setNotes] = useState(initialTask?.notes || "");
  const [category, setCategory] = useState<TaskCategory>(initialTask?.category || "Study");
  const [date, setDate] = useState(initialTask?.date || initialDate || todayStr());
  const [startTime, setStartTime] = useState<string | null>(initialTask?.startTime || null);
  const [endTime, setEndTime] = useState<string | null>(initialTask?.endTime || null);
  const [checklist, setChecklist] = useState<TaskChecklistItem[]>(initialChecklist);
  const [pendingLinks, setPendingLinks] = useState<TaskLink[]>(initialLinks);
  const [pendingMetaStatus, setPendingMetaStatus] = useState<Record<string, "idle" | "loading" | "error" | "success">>({});

  const [errors, setErrors] = useState<TaskValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [dateSheetVisible, setDateSheetVisible] = useState(false);
  const [timePickerTarget, setTimePickerTarget] = useState<"start" | "end" | null>(null);
  const [deleteSheetVisible, setDeleteSheetVisible] = useState(false);

  const tryAutofill = (linkTitle?: string | null) => {
    if (shouldAutofillTitle({ currentTitle: title, touched: titleTouched, alreadyFilled, linkTitle })) {
      const cleaned = cleanVideoTitle(linkTitle!);
      setTitle(cleaned);
      setAlreadyFilled(true);
      setShowAutofillCaption(true);
      if (errors.title) setErrors((e) => ({ ...e, title: undefined }));
    }
  };

  const handleAddPendingLink = async (url: string) => {
    const parsed = parseYouTubeUrl(url);
    if (!parsed) throw new Error("This doesn't look like a valid YouTube link.");
    if (pendingLinks.some((l) => l.externalId === parsed.externalId)) {
      throw new Error("This video is already added.");
    }
    const id = generateId();
    const thumb = parsed.kind === "playlist" ? null : getFallbackThumbnail(parsed.externalId);
    const newL: TaskLink = {
      id,
      taskId: initialTask?.id || "",
      url: parsed.canonicalUrl,
      kind: parsed.kind === "playlist" ? "playlist" : "video",
      externalId: parsed.externalId,
      title: parsed.kind === "playlist" ? "YouTube Playlist" : "YouTube Video",
      thumbnailUrl: thumb,
      watched: false,
      watchedTillSeconds: parsed.startSeconds || null,
      playlistTotal: parsed.kind === "playlist" ? 10 : null,
      playlistDone: parsed.kind === "playlist" ? 0 : null,
      createdAt: new Date().toISOString(),
    };
    setPendingLinks((prev) => [...prev, newL]);
    setPendingMetaStatus((s) => ({ ...s, [id]: "loading" }));

    const willFetchForTitle = !titleTouched && !alreadyFilled && title.trim().length === 0;
    if (willFetchForTitle) setIsFetchingTitle(true);

    fetchOEmbed(parsed.canonicalUrl).then((res) => {
      if (willFetchForTitle) setIsFetchingTitle(false);
      if (res.success) {
        setPendingLinks((prev) =>
          prev.map((l) => (l.id === id ? { ...l, title: res.data.title, thumbnailUrl: res.data.thumbnailUrl || thumb } : l))
        );
        setPendingMetaStatus((s) => ({ ...s, [id]: "success" }));
        tryAutofill(res.data.title);
      } else {
        setPendingMetaStatus((s) => ({ ...s, [id]: "error" }));
      }
    }).catch(() => {
      if (willFetchForTitle) setIsFetchingTitle(false);
      setPendingMetaStatus((s) => ({ ...s, [id]: "error" }));
    });
  };

  const handleRetryPendingMetadata = async (id: string) => {
    const link = pendingLinks.find((l) => l.id === id);
    if (!link) return;
    setPendingMetaStatus((s) => ({ ...s, [id]: "loading" }));
    const willFetchForTitle = !titleTouched && !alreadyFilled && title.trim().length === 0;
    if (willFetchForTitle) setIsFetchingTitle(true);
    try {
      const res = await fetchOEmbed(link.url);
      if (res.success) {
        setPendingLinks((prev) =>
          prev.map((l) => (l.id === id ? { ...l, title: res.data.title, thumbnailUrl: res.data.thumbnailUrl || l.thumbnailUrl } : l))
        );
        setPendingMetaStatus((s) => ({ ...s, [id]: "success" }));
        tryAutofill(res.data.title);
      } else {
        setPendingMetaStatus((s) => ({ ...s, [id]: "error" }));
      }
    } finally {
      if (willFetchForTitle) setIsFetchingTitle(false);
    }
  };

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
        links: pendingLinks,
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
        isFetchingTitle={isFetchingTitle}
        showAutofillCaption={showAutofillCaption}
        onChangeText={(t) => {
          setTitle(t);
          setTitleTouched(true);
          setShowAutofillCaption(false);
          if (errors.title) setErrors((e) => ({ ...e, title: undefined }));
        }}
        onUndoAutofill={() => {
          setTitle("");
          setTitleTouched(true);
          setShowAutofillCaption(false);
        }}
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
        taskId={initialTask?.id}
        pendingLinks={pendingLinks}
        pendingMetadataStatus={pendingMetaStatus}
        onAddPendingLink={handleAddPendingLink}
        onRemovePendingLink={(id) => setPendingLinks((p) => p.filter((x) => x.id !== id))}
        onTogglePendingWatched={(id) => setPendingLinks((p) => p.map((x) => (x.id === id ? { ...x, watched: !x.watched } : x)))}
        onUpdatePendingProgress={(id, d, tot) => setPendingLinks((p) => p.map((x) => (x.id === id ? { ...x, playlistDone: d, playlistTotal: tot } : x)))}
        onSetPendingWatchedTill={(id, sec) => setPendingLinks((p) => p.map((x) => (x.id === id ? { ...x, watchedTillSeconds: sec } : x)))}
        onSetPendingNote={(id, n) => setPendingLinks((p) => p.map((x) => (x.id === id ? { ...x, note: n } : x)))}
        onRetryPendingMetadata={handleRetryPendingMetadata}
      />

      <View className="gap-3 pt-2">
        <Button variant="primary" title={submitLabel} onPress={handleSubmit} loading={loading} />
        {initialTask && onDuplicate && (
          <Button variant="secondary" title="Duplicate Task" icon={<Copy size={16} color={THEME_COLORS.text.primary} />} onPress={onDuplicate} />
        )}
        {initialTask && onDelete && (
          <Button variant="ghost" title="Delete Task" icon={<Trash size={16} color={THEME_COLORS.coral} />} textClassName="text-coral" onPress={() => setDeleteSheetVisible(true)} />
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
