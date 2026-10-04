import React, { useState, useRef, useEffect } from "react";
import { View } from "react-native";
import { Clipboard as ClipboardIcon, Plus } from "@/components/icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Input, Button, Text } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { useT } from "@/core/i18n";
import { extractYouTubeUrls, shouldAutoAdd } from "../paste-utils";

export interface YouTubeAddLinkRowProps {
  onAdd: (url: string) => Promise<void> | void;
  onAddBatch?: (urls: string[]) => Promise<{ added: number; existing: number }>;
}

export function YouTubeAddLinkRow({ onAdd, onAddBatch }: YouTubeAddLinkRowProps) {
  const { t } = useT();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const prevTextRef = useRef("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isAddingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {
      // Ignored
    }
  };

  const processInput = async (inputText: string) => {
    if (isAddingRef.current) return;
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const urls = extractYouTubeUrls(trimmed);
    if (urls.length === 0) return;

    isAddingRef.current = true;
    setLoading(true);
    setError(null);
    setFeedback(null);

    try {
      if (urls.length > 1 && onAddBatch) {
        const res = await onAddBatch(urls);
        setUrl("");
        prevTextRef.current = "";
        triggerHaptic();
        if (res.added > 0) {
          const msg = `${t("youtube.addedLinks", { count: res.added })}${res.existing > 0 ? `, ${res.existing} ${t("youtube.alreadyAdded").toLowerCase()}` : ""}`;
          setFeedback(msg);
          setTimeout(() => setFeedback(null), 3000);
        } else if (res.existing > 0) {
          setError(t("youtube.alreadyAdded"));
        }
      } else if (urls.length > 1) {
        let added = 0;
        let existing = 0;
        for (const u of urls) {
          try {
            await onAdd(u);
            added++;
          } catch (err: unknown) {
            if (err instanceof Error && err.message.toLowerCase().includes("already")) existing++;
          }
        }
        setUrl("");
        prevTextRef.current = "";
        triggerHaptic();
        if (added > 0) {
          setFeedback(`${t("youtube.addedLinks", { count: added })}${existing > 0 ? `, ${existing} ${t("youtube.alreadyAdded").toLowerCase()}` : ""}`);
          setTimeout(() => setFeedback(null), 3000);
        } else if (existing > 0) {
          setError(t("youtube.alreadyAdded"));
        }
      } else {
        await onAdd(urls[0]);
        setUrl("");
        prevTextRef.current = "";
        triggerHaptic();
      }
    } catch (err: unknown) {
      const isDup = err instanceof Error && err.message.toLowerCase().includes("already");
      setError(isDup ? t("youtube.alreadyAdded") : (err instanceof Error ? err.message : t("youtube.invalidUrl")));
    } finally {
      setLoading(false);
      isAddingRef.current = false;
    }
  };

  const handleTextChange = (nextText: string) => {
    const prevText = prevTextRef.current;
    prevTextRef.current = nextText;
    setUrl(nextText);
    if (error) setError(null);
    if (feedback) setFeedback(null);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    const check = shouldAutoAdd({ previousText: prevText, nextText, isPasteButton: false });
    if (check.autoAdd) {
      if (check.isImmediate) {
        processInput(nextText);
      } else {
        debounceTimerRef.current = setTimeout(() => {
          processInput(nextText);
        }, 500);
      }
    } else if (nextText.trim().length > 6) {
      debounceTimerRef.current = setTimeout(() => {
        if (extractYouTubeUrls(nextText).length === 0) {
          setError(t("youtube.invalidUrl"));
        }
      }, 1000);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text && text.trim()) {
        const check = shouldAutoAdd({ previousText: "", nextText: text, isPasteButton: true });
        if (check.autoAdd) {
          await processInput(text);
        } else {
          setUrl(text);
          setError(t("youtube.invalidUrl"));
        }
      }
    } catch {
      // Ignored
    }
  };

  const handleBlur = () => {
    if (url.trim().length > 0 && extractYouTubeUrls(url).length === 0) {
      setError(t("youtube.invalidUrl"));
    }
  };

  return (
    <View className="gap-1.5">
      <View className="flex-row items-center gap-2">
        <Input
          placeholder={t("youtube.pasteUrl")}
          value={url}
          onChangeText={handleTextChange}
          onBlur={handleBlur}
          containerClassName="flex-1 min-w-0 mb-0"
          inputClassName="text-xs"
          returnKeyType="done"
          onSubmitEditing={() => processInput(url)}
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
          onPress={() => processInput(url)}
          loading={loading}
          disabled={!url.trim()}
          className="w-11 h-11 shrink-0 p-0 items-center justify-center"
          accessibilityLabel={t("youtube.addLink")}
        />
      </View>
      {error && <Text className="text-coral text-xs ml-1">{error}</Text>}
      {feedback && <Text className="text-lime text-xs ml-1">{feedback}</Text>}
    </View>
  );
}
