import React, { useState, useEffect } from "react";
import { View, TextInput } from "react-native";
import { Key, ClipboardText, Trash, CheckCircle, WarningCircle, XCircle, WifiSlash } from "@/components/icons";
import * as Clipboard from "expo-clipboard";
import { Card, Text, Button } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { Haptics } from "@/core/utils/haptics";
import { useT } from "@/core/i18n";
import {
  getUserStoredApiKey,
  saveUserApiKey,
  deleteUserApiKey,
  maskApiKey,
  testYouTubeApiKey,
  type ApiKeyStatus,
} from "@/features/youtube/api-key";

export function AdvancedSection() {
  const { t } = useT();
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [savedMaskedKey, setSavedMaskedKey] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ApiKeyStatus | null>(null);

  useEffect(() => {
    loadKey();
  }, []);

  const loadKey = async () => {
    const key = await getUserStoredApiKey();
    setSavedMaskedKey(key ? maskApiKey(key) : null);
  };

  const handlePaste = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const clip = await Clipboard.getStringAsync();
    if (clip && clip.trim()) {
      setApiKeyInput(clip.trim());
      setTestResult(null);
    }
  };

  const handleSave = async () => {
    if (!apiKeyInput.trim()) return;
    await saveUserApiKey(apiKeyInput.trim());
    setApiKeyInput("");
    setTestResult(null);
    await loadKey();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  };

  const handleClear = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    await deleteUserApiKey();
    setApiKeyInput("");
    setSavedMaskedKey(null);
    setTestResult(null);
  };

  const handleTestKey = async () => {
    const keyToTest = apiKeyInput.trim() || (await getUserStoredApiKey());
    if (!keyToTest) return;

    setTesting(true);
    setTestResult(null);
    try {
      const res = await testYouTubeApiKey(keyToTest);
      setTestResult(res);
      if (res === "valid") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      }
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card variant="surface" className="p-4 mb-4 border border-border">
      <View className="flex-row items-center gap-2 mb-2">
        <Key size={18} color={THEME_COLORS.primary} weight="bold" />
        <Text variant="title" className="text-sm font-bold">{t("settings.youtubeApiKey") || "YouTube API Key (Optional)"}</Text>
      </View>

      <Text variant="caption" className="text-text-secondary text-xs mb-3">
        {t("settings.youtubeApiKeyHelp") || "Import full playlists with videos, titles, and durations. The key is stored securely on your device."}
      </Text>

      {/* Currently Saved Key Display */}
      {savedMaskedKey && (
        <View className="flex-row items-center justify-between p-2.5 rounded-[12px] bg-elevated border border-border mb-3 min-h-[44px]">
          <View className="flex-1 mr-2">
            <Text variant="caption" className="text-[10px] text-text-muted">Active Key</Text>
            <Text variant="body" className="font-mono text-xs text-text-primary">{savedMaskedKey}</Text>
          </View>
          <Button
            variant="secondary"
            size="sm"
            icon={<Trash size={14} color={THEME_COLORS.coral} />}
            onPress={handleClear}
            className="w-8 h-8 p-0 bg-coral/10 border-coral/30"
          />
        </View>
      )}

      {/* New Key Input Field */}
      <View className="flex-row items-center gap-2 mb-3">
        <View className="flex-1 bg-elevated rounded-[12px] border border-border px-3 min-h-[44px] justify-center">
          <TextInput
            placeholder="AIzaSy..."
            placeholderTextColor={THEME_COLORS.text.muted}
            value={apiKeyInput}
            onChangeText={(txt) => { setApiKeyInput(txt); setTestResult(null); }}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={false}
            className="text-xs text-text-primary font-mono py-2"
          />
        </View>
        <Button
          variant="secondary"
          size="sm"
          icon={<ClipboardText size={16} color={THEME_COLORS.text.primary} />}
          onPress={handlePaste}
          className="h-[44px] px-3"
          accessibilityLabel="Paste API Key"
        />
      </View>

      {/* Actions & Test Status */}
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row gap-2">
          {apiKeyInput.trim().length > 0 && (
            <Button variant="primary" size="sm" title="Save" onPress={handleSave} className="min-h-[44px] px-4" />
          )}
          {(apiKeyInput.trim().length > 0 || savedMaskedKey) && (
            <Button
              variant="secondary"
              size="sm"
              title={testing ? "Testing..." : "Test Key"}
              disabled={testing}
              onPress={handleTestKey}
              className="min-h-[44px] px-4"
            />
          )}
        </View>

        {/* Test Result Indicator */}
        {testResult && (
          <View className="flex-row items-center gap-1.5 flex-shrink">
            {testResult === "valid" && (
              <>
                <CheckCircle size={16} color={THEME_COLORS.primary} weight="fill" />
                <Text variant="caption" className="text-primary font-bold text-xs">Valid</Text>
              </>
            )}
            {testResult === "invalid" && (
              <>
                <XCircle size={16} color={THEME_COLORS.coral} weight="fill" />
                <Text variant="caption" className="text-coral font-bold text-xs">Invalid</Text>
              </>
            )}
            {testResult === "quota_exceeded" && (
              <>
                <WarningCircle size={16} color={THEME_COLORS.amber} weight="fill" />
                <Text variant="caption" className="text-amber font-bold text-xs">Quota Exceeded</Text>
              </>
            )}
            {testResult === "offline" && (
              <>
                <WifiSlash size={16} color={THEME_COLORS.text.muted} weight="bold" />
                <Text variant="caption" className="text-text-muted font-bold text-xs">Offline</Text>
              </>
            )}
          </View>
        )}
      </View>
    </Card>
  );
}
