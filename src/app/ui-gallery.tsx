import React, { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, MagnifyingGlass } from "@/components/icons";
import {
  Screen, Text, Card, Button, Pill, Checkbox, ProgressRing,
  AnimatedNumber, Sheet, EmptyState, EmptyHabitsIllustration,
  EmptyPlannerIllustration, Skeleton, Input
} from "@/components/ui";
import { THEME_COLORS } from "@/lib/theme";

export default function UiGalleryScreen() {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [progress, setProgress] = useState(0.65);
  const [counter, setCounter] = useState(14);
  const [checkedLime, setCheckedLime] = useState(true);
  const [checkedCoral, setCheckedCoral] = useState(false);
  const [checkedSky, setCheckedSky] = useState(true);
  const [checkedMint, setCheckedMint] = useState(false);
  const [selectedPill, setSelectedPill] = useState("Daily");
  const [textInputVal, setTextInputVal] = useState("");

  return (
    <Screen scroll withTabBarInset>
      {/* Header */}
      <View className="flex-row items-center justify-between pt-4 pb-4 mb-2">
        <Button
          variant="icon-only"
          size="sm"
          icon={<ArrowLeft size={18} color={THEME_COLORS.text.primary} />}
          onPress={() => router.back()}
        />
        <Text variant="title">UI Primitive Gallery</Text>
        <View className="w-10" />
      </View>

      {/* 1. Typography */}
      <Card variant="surface" className="mb-4">
        <Text variant="label" className="mb-2">1. Typography Primitives</Text>
        <Text variant="display">Display 32px</Text>
        <Text variant="title" className="mt-1">Title Heading 22px</Text>
        <Text variant="body" className="mt-1">Body Text 15px - Plus Jakarta Sans</Text>
        <Text variant="caption" className="mt-1">Caption Text 12px secondary</Text>
        <Text variant="muted" className="mt-1">Muted helper text</Text>
      </Card>

      {/* 2. Buttons & Cards */}
      <Card variant="elevated" className="mb-4">
        <Text variant="label" className="mb-3">2. Buttons & Cards</Text>
        <View className="gap-2.5">
          <Button variant="primary" title="Primary Button (Lime)" />
          <Button variant="secondary" title="Secondary Button" />
          <View className="flex-row gap-2">
            <Button variant="ghost" title="Ghost" className="flex-1" />
            <Button variant="primary" loading title="Loading" className="flex-1" />
            <Button variant="secondary" disabled title="Disabled" className="flex-1" />
          </View>
        </View>
        <Card variant="surface" pressable className="mt-4">
          <Text variant="body" className="font-bold">Pressable Card (Spring 0.97)</Text>
          <Text variant="caption">Tap this card to test spring scale feedback</Text>
        </Card>
      </Card>

      {/* 3. Checkboxes & Pills */}
      <Card variant="surface" className="mb-4">
        <Text variant="label" className="mb-3">3. Checkboxes & Category Pills</Text>
        <View className="flex-row justify-around mb-4">
          <Checkbox checked={checkedLime} onCheckedChange={setCheckedLime} color="lime" />
          <Checkbox checked={checkedCoral} onCheckedChange={setCheckedCoral} color="coral" />
          <Checkbox checked={checkedSky} onCheckedChange={setCheckedSky} color="sky" />
          <Checkbox checked={checkedMint} onCheckedChange={setCheckedMint} color="mint" />
        </View>
        <View className="flex-row gap-2 flex-wrap">
          {["Daily", "Specific Days", "Weekly"].map((p) => (
            <Pill
              key={p}
              label={p}
              selected={selectedPill === p}
              colorDot={p === "Daily" ? THEME_COLORS.primary : THEME_COLORS.secondary.coral}
              onPress={() => setSelectedPill(p)}
            />
          ))}
        </View>
      </Card>

      {/* 4. ProgressRing & AnimatedNumber */}
      <Card variant="elevated" className="mb-4">
        <Text variant="label" className="mb-3">4. ProgressRing & AnimatedNumber</Text>
        <View className="flex-row items-center justify-around py-2">
          <ProgressRing progress={progress} size={84} strokeWidth={8}>
            <Text variant="caption" className="font-bold text-text-primary">
              {Math.round(progress * 100)}%
            </Text>
          </ProgressRing>
          <View className="items-center">
            <AnimatedNumber value={counter} suffix=" Days" />
            <Text variant="caption">Current Streak</Text>
          </View>
        </View>
        <View className="flex-row gap-2 mt-3">
          <Button
            variant="secondary"
            size="sm"
            title="-10% Ring"
            onPress={() => setProgress((p) => Math.max(0, Number((p - 0.1).toFixed(2))))}
            className="flex-1"
          />
          <Button
            variant="secondary"
            size="sm"
            title="+10% Ring"
            onPress={() => setProgress((p) => Math.min(1, Number((p + 0.1).toFixed(2))))}
            className="flex-1"
          />
          <Button
            variant="secondary"
            size="sm"
            title="+1 Streak"
            onPress={() => setCounter((c) => c + 1)}
            className="flex-1"
          />
        </View>
      </Card>

      {/* 5. Inputs & Skeletons */}
      <Card variant="surface" className="mb-4">
        <Text variant="label" className="mb-3">5. Inputs & Skeletons</Text>
        <Input
          label="Habit Name"
          placeholder="e.g. Morning meditation"
          value={textInputVal}
          onChangeText={setTextInputVal}
          icon={<MagnifyingGlass size={16} color={THEME_COLORS.text.muted} />}
        />
        <Input label="Error Demo" value="Invalid input" error="This field is required" />
        <View className="gap-2">
          <Skeleton height={22} width="70%" />
          <Skeleton height={14} width="100%" />
        </View>
      </Card>

      {/* 6. Sheet Modal Trigger */}
      <Card variant="elevated" className="mb-4">
        <Text variant="label" className="mb-2">6. Bottom Sheet Modal</Text>
        <Button
          variant="primary"
          title="Open Bottom Sheet"
          onPress={() => setSheetOpen(true)}
        />
      </Card>

      {/* 7. Empty States */}
      <Text variant="label" className="mb-2 px-1">7. Custom Empty States</Text>
      <View className="gap-3 mb-6">
        <EmptyState
          illustration={<EmptyHabitsIllustration />}
          title="No Habits Yet"
          description="Start small with one simple daily routine."
          actionTitle="Create First Habit"
          onAction={() => setSheetOpen(true)}
        />
        <EmptyState
          illustration={<EmptyPlannerIllustration />}
          title="Day is Open"
          description="Plan your day with focused tasks."
        />
      </View>

      {/* Bottom Sheet Component */}
      <Sheet visible={sheetOpen} onClose={() => setSheetOpen(false)} title="New Habit">
        <View className="pt-2 pb-4 gap-3">
          <Input label="Name" placeholder="e.g. Read 20 pages" />
          <Input label="Notes" placeholder="Optional details..." multiline />
          <Button
            variant="primary"
            title="Save Habit"
            onPress={() => setSheetOpen(false)}
          />
        </View>
      </Sheet>
    </Screen>
  );
}
