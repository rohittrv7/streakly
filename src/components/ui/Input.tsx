import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  type TextInputProps,
} from "react-native";
import { cn } from "@/core/utils/cn";
import { THEME_COLORS } from "@/lib/theme";
import { useAccent } from "@/lib/theme/store";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
  inputClassName?: string;
}

export function Input({
  label,
  error,
  icon,
  containerClassName,
  inputClassName,
  multiline,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { accent } = useAccent();
  const isFlex = containerClassName?.includes("flex-1") || containerClassName?.includes("flex-auto");

  return (
    <View className={cn(isFlex ? "flex-1 min-w-0" : "w-full", "mb-3", containerClassName)}>
      {label && (
        <Text className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 ml-1">
          {label}
        </Text>
      )}

      <View
        className={cn(
          "w-full flex-row items-center bg-elevated border rounded-2xl px-3.5 transition-colors",
          multiline ? "py-2.5 min-h-[96px] items-start" : "min-h-[48px]",
          error
            ? "border-coral"
            : isFocused
            ? "border-accent"
            : "border-border"
        )}
      >
        {icon && (
          <View className={cn("mr-2.5", multiline ? "mt-1" : "")}>
            {icon}
          </View>
        )}

        <TextInput
          placeholderTextColor={THEME_COLORS.text.muted}
          selectionColor={accent.hex}
          multiline={multiline}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          className={cn(
            "flex-1 text-text-primary text-sm font-sans",
            multiline ? "text-top pt-0" : "",
            inputClassName
          )}
          style={{ minHeight: multiline ? 80 : 40 }}
          {...props}
        />
      </View>

      {error && (
        <Text className="text-[11px] text-coral font-medium mt-1 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
}
