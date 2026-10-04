import React from "react";
import { View, Pressable } from "react-native";
import { Check, Vibrate, Translate, Palette } from "@/components/icons";
import { Card, Text, Toggle, Button, Pill } from "@/components/ui";
import { ACCENT_LIST, type AccentKey } from "@/lib/theme/accents";
import { useAccent } from "@/lib/theme/store";
import { useT } from "@/core/i18n";
import { useSettingsStore } from "../store";
import { THEME_COLORS } from "@/lib/theme";
import { Haptics } from "@/core/utils/haptics";

export function AppearanceSection() {
  const { t, language, setLanguage } = useT();
  const { key: currentAccent, accent, setAccent } = useAccent();
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const setHaptics = useSettingsStore((s) => s.setHaptics);

  const handleAccentPress = (accentKey: AccentKey) => {
    Haptics.selectionAsync();
    setAccent(accentKey);
  };

  const handleLanguageToggle = (lang: "en" | "hinglish") => {
    Haptics.selectionAsync();
    setLanguage(lang);
  };

  return (
    <Card variant="surface" className="p-4 mb-4 border border-border">
      {/* Section Header */}
      <View className="flex-row items-center gap-2 mb-3">
        <Palette size={18} color={accent.hex} weight="fill" />
        <Text variant="body" className="font-bold text-text-primary">
          {t("settings.appearance")}
        </Text>
      </View>

      {/* Accent Color Picker */}
      <View className="mb-4">
        <Text variant="caption" className="mb-2.5">
          {t("settings.accentColor")}
        </Text>
        <View className="flex-row items-center justify-between py-1">
          {ACCENT_LIST.map((item) => {
            const isSelected = item.key === currentAccent;
            return (
              <Pressable
                key={item.key}
                onPress={() => handleAccentPress(item.key)}
                className="items-center justify-center min-w-[48px] min-h-[48px]"
                accessibilityRole="button"
                accessibilityLabel={`${item.label} accent`}
                accessibilityState={{ selected: isSelected }}
              >
                <View
                  style={{
                    backgroundColor: item.hex,
                    borderColor: isSelected ? "#FFFFFF" : "transparent",
                    borderWidth: isSelected ? 3 : 0,
                  }}
                  className="w-10 h-10 rounded-full items-center justify-center shadow-sm"
                >
                  {isSelected && <Check size={20} color={item.onAccentHex} weight="bold" />}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Live Preview Card */}
        <View
          style={{ backgroundColor: accent.softBackground, borderColor: accent.borderHex }}
          className="mt-3 p-3.5 rounded-card-sm border flex-row items-center justify-between"
        >
          <View className="flex-1 pr-3">
            <Text variant="caption" className="font-semibold text-text-primary">
              {accent.label}
            </Text>
            <Text variant="caption" className="text-text-secondary text-xs">
              Live chrome preview
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Pill label="Active" selected />
            <Button
              title="Accent"
              size="sm"
              style={{ backgroundColor: accent.hex }}
              textClassName="text-background font-bold"
              onPress={() => {}}
            />
          </View>
        </View>
      </View>

      {/* Language Selector */}
      <View className="py-3 border-t border-border flex-row items-center justify-between min-h-[48px]">
        <View className="flex-row items-center gap-2.5">
          <Translate size={18} color={THEME_COLORS.text.secondary} />
          <View>
            <Text variant="body" className="font-medium text-text-primary">
              {t("settings.language")}
            </Text>
            <Text variant="caption">
              {language === "en" ? "English" : "Roman Hinglish"}
            </Text>
          </View>
        </View>
        <View className="flex-row gap-2">
          <Pill
            label="English"
            selected={language === "en"}
            onPress={() => handleLanguageToggle("en")}
          />
          <Pill
            label="Hinglish"
            selected={language === "hinglish"}
            onPress={() => handleLanguageToggle("hinglish")}
          />
        </View>
      </View>

      {/* Haptics Toggle */}
      <View className="pt-3 border-t border-border flex-row items-center justify-between min-h-[48px]">
        <View className="flex-row items-center gap-2.5 flex-1 pr-3">
          <Vibrate size={18} color={THEME_COLORS.text.secondary} />
          <View className="flex-1">
            <Text variant="body" className="font-medium text-text-primary">
              {t("settings.haptics")}
            </Text>
            <Text variant="caption">
              Tactile vibrations on tap and complete
            </Text>
          </View>
        </View>
        <Toggle
          value={hapticsEnabled}
          onValueChange={setHaptics}
          accessibilityLabel="Toggle Haptics"
        />
      </View>
    </Card>
  );
}
