import React, { useState } from "react";
import { View } from "react-native";
import { Clipboard as ClipboardIcon, Plus } from "phosphor-react-native";
import * as Clipboard from "expo-clipboard";
import { Input, Button, Text } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";

export interface YouTubeAddLinkRowProps {
  onAdd: (url: string) => Promise<void> | void;
}

export function YouTubeAddLinkRow({ onAdd }: YouTubeAddLinkRowProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text && text.trim()) {
        setUrl(text.trim());
        setError(null);
      }
    } catch {
      // Ignored
    }
  };

  const handleAdd = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      await onAdd(trimmed);
      setUrl("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="gap-1.5">
      <View className="flex-row items-center gap-2">
        <Input
          placeholder="Paste YouTube video or playlist link..."
          value={url}
          onChangeText={(t) => {
            setUrl(t);
            if (error) setError(null);
          }}
          containerClassName="flex-1 min-w-0 mb-0"
          inputClassName="text-xs"
          returnKeyType="done"
          onSubmitEditing={handleAdd}
        />
        <Button
          variant="secondary"
          size="sm"
          icon={<ClipboardIcon size={16} color={THEME_COLORS.text.primary} />}
          onPress={handlePaste}
          className="w-11 h-11 shrink-0 p-0 items-center justify-center"
          accessibilityLabel="Paste from clipboard"
        />
        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={16} color={THEME_COLORS.background} weight="bold" />}
          onPress={handleAdd}
          loading={loading}
          disabled={!url.trim()}
          className="w-11 h-11 shrink-0 p-0 items-center justify-center"
          accessibilityLabel="Add video link"
        />
      </View>
      {error && <Text className="text-coral text-xs ml-1">{error}</Text>}
    </View>
  );
}
