import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { Plus, Trash } from "phosphor-react-native";
import type { TaskChecklistItem } from "../types";
import { Text, Input, Button, Checkbox } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";

export interface TaskChecklistSectionProps {
  items: TaskChecklistItem[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: (text: string) => void;
}

export function TaskChecklistSection({
  items,
  onToggle,
  onRemove,
  onAdd,
}: TaskChecklistSectionProps) {
  const [newText, setNewText] = useState("");

  const handleAdd = () => {
    const trimmed = newText.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setNewText("");
  };

  return (
    <View className="gap-2.5">
      <Text variant="label">CHECKLIST ({items.length})</Text>

      {/* Items list */}
      {items.map((item) => (
        <View
          key={item.id}
          className="flex-row items-center justify-between bg-surface p-2.5 rounded-card border border-border"
        >
          <View className="flex-row items-center gap-2.5 flex-1 mr-2">
            <Checkbox
              checked={item.done}
              onCheckedChange={() => onToggle(item.id)}
              color="lime"
              accessibilityLabel={`Toggle checklist item ${item.text}`}
            />
            <Text
              variant="body"
              className={`text-sm flex-1 ${item.done ? "line-through text-text-muted" : "text-text-primary"}`}
            >
              {item.text}
            </Text>
          </View>

          <Pressable
            onPress={() => onRemove(item.id)}
            hitSlop={8}
            className="p-1.5 active:opacity-60"
            accessibilityLabel={`Remove ${item.text}`}
          >
            <Trash size={16} color={THEME_COLORS.text.muted} />
          </Pressable>
        </View>
      ))}

      {/* Add new item row */}
      <View className="flex-row items-center gap-2 mt-1">
        <Input
          placeholder="Add subtask / checklist item..."
          value={newText}
          onChangeText={setNewText}
          containerClassName="flex-1 min-w-0 mb-0"
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <Button
          variant="secondary"
          size="sm"
          title="Add"
          icon={<Plus size={16} color={THEME_COLORS.text.primary} />}
          onPress={handleAdd}
          className="h-11 shrink-0 px-3.5"
        />
      </View>
    </View>
  );
}
