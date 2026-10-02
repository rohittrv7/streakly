import React, { useState } from "react";
import { View, Switch, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Haptics } from "@/core/utils/haptics";
import { Sheet, Text, Button } from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";
import { useTranslation } from "@/core/i18n";
import {
  type FocusSettings,
  MIN_DURATION_SEC,
  MAX_DURATION_SEC,
  formatDurationLabel,
  stepDurationSec,
} from "../timer";
import { CustomDurationSheet } from "./CustomDurationSheet";
import { SettingStepperRow } from "./SettingStepperRow";
import { FocusAlarmSettingsSection } from "./FocusAlarmSettingsSection";

export interface FocusSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
  settings: FocusSettings;
  onUpdateSettings: (newSettings: Partial<FocusSettings>) => void;
}

export function FocusSettingsSheet({
  visible,
  onClose,
  settings,
  onUpdateSettings,
}: FocusSettingsSheetProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [customTarget, setCustomTarget] = useState<{
    key: "focusSec" | "shortBreakSec" | "longBreakSec";
    title: string;
    initialSeconds: number;
  } | null>(null);

  const focusSec = settings.focusSec ?? (settings.focusMinutes ? settings.focusMinutes * 60 : 1500);
  const shortBreakSec = settings.shortBreakSec ?? (settings.shortBreakMinutes ? settings.shortBreakMinutes * 60 : 300);
  const longBreakSec = settings.longBreakSec ?? (settings.longBreakMinutes ? settings.longBreakMinutes * 60 : 900);

  const stepDuration = (key: "focusSec" | "shortBreakSec" | "longBreakSec", current: number, dir: 1 | -1) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onUpdateSettings({ [key]: stepDurationSec(current, dir) });
  };

  const stepCount = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const cur = settings.sessionsBeforeLongBreak || 4;
    const next = Math.min(8, Math.max(2, cur + delta));
    onUpdateSettings({ sessionsBeforeLongBreak: next });
  };

  return (
    <>
      <Sheet visible={visible} onClose={onClose} title={t("focus.settings")} size="tall">
        <View className="flex-1">
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            <View className="gap-3.5">
              {/* Focus Duration */}
              <SettingStepperRow
                label="Focus Duration"
                value={formatDurationLabel(focusSec)}
                onTapValue={() => setCustomTarget({ key: "focusSec", title: "Focus Duration", initialSeconds: focusSec })}
                onDecrement={() => stepDuration("focusSec", focusSec, -1)}
                onIncrement={() => stepDuration("focusSec", focusSec, 1)}
                canDecrement={focusSec > MIN_DURATION_SEC}
                canIncrement={focusSec < MAX_DURATION_SEC}
              />

              {/* Short Break */}
              <SettingStepperRow
                label="Short Break"
                value={formatDurationLabel(shortBreakSec)}
                onTapValue={() => setCustomTarget({ key: "shortBreakSec", title: "Short Break", initialSeconds: shortBreakSec })}
                onDecrement={() => stepDuration("shortBreakSec", shortBreakSec, -1)}
                onIncrement={() => stepDuration("shortBreakSec", shortBreakSec, 1)}
                canDecrement={shortBreakSec > MIN_DURATION_SEC}
                canIncrement={shortBreakSec < MAX_DURATION_SEC}
              />

              {/* Long Break */}
              <SettingStepperRow
                label="Long Break"
                value={formatDurationLabel(longBreakSec)}
                onTapValue={() => setCustomTarget({ key: "longBreakSec", title: "Long Break", initialSeconds: longBreakSec })}
                onDecrement={() => stepDuration("longBreakSec", longBreakSec, -1)}
                onIncrement={() => stepDuration("longBreakSec", longBreakSec, 1)}
                canDecrement={longBreakSec > MIN_DURATION_SEC}
                canIncrement={longBreakSec < MAX_DURATION_SEC}
              />

              {/* Sessions before long break */}
              <SettingStepperRow
                label="Sessions before Long Break"
                value={`${settings.sessionsBeforeLongBreak || 4}`}
                onDecrement={() => stepCount(-1)}
                onIncrement={() => stepCount(1)}
                canDecrement={(settings.sessionsBeforeLongBreak || 4) > 2}
                canIncrement={(settings.sessionsBeforeLongBreak || 4) < 8}
              />

              {/* Noise helper note */}
              <Text variant="caption" className="text-text-muted text-xs text-center px-2">
                {t("focus.underOneMinNoise")}
              </Text>

              {/* Keep screen on toggle */}
              <View className="flex-row items-center justify-between p-3.5 bg-surface rounded-2xl border border-border">
                <View className="flex-1 mr-3">
                  <Text variant="body" className="font-bold text-sm">Keep screen on</Text>
                  <Text variant="caption" className="text-text-muted text-xs mt-0.5">
                    Prevents phone from sleeping while a focus session is running
                  </Text>
                </View>
                <Switch
                  value={settings.keepScreenOn ?? true}
                  onValueChange={(val) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    onUpdateSettings({ keepScreenOn: val });
                  }}
                  trackColor={{ false: THEME_COLORS.elevated, true: THEME_COLORS.primary }}
                  thumbColor={THEME_COLORS.background}
                />
              </View>

              {/* Alarm sound & repeat reminders settings */}
              <FocusAlarmSettingsSection />
            </View>
          </ScrollView>

          <View style={{ paddingBottom: Math.max(insets.bottom, 12) }} className="pt-2">
            <Button variant="primary" title="Done" onPress={onClose} />
          </View>
        </View>
      </Sheet>

      {customTarget && (
        <CustomDurationSheet
          visible={Boolean(customTarget)}
          title={customTarget.title}
          initialSeconds={customTarget.initialSeconds}
          onClose={() => setCustomTarget(null)}
          onSave={(sec) => {
            onUpdateSettings({ [customTarget.key]: sec });
            setCustomTarget(null);
          }}
        />
      )}
    </>
  );
}
