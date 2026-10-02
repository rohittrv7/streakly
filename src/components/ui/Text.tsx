import React from "react";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { cn } from "@/core/utils/cn";

export type TextVariant =
  | "display"
  | "title"
  | "body"
  | "caption"
  | "label"
  | "muted";

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  className?: string;
  children?: React.ReactNode;
}

const VARIANT_MAP: Record<TextVariant, string> = {
  display:
    "text-[32px] font-extrabold text-text-primary tracking-tight leading-tight",
  title: "text-[22px] font-bold text-text-primary leading-snug",
  body: "text-[15px] font-sans text-text-primary leading-relaxed",
  caption: "text-xs font-medium text-text-secondary leading-normal",
  label:
    "text-[11px] font-bold text-text-secondary uppercase tracking-widest leading-none",
  muted: "text-sm font-sans text-text-muted leading-normal",
};

export function Text({
  variant = "body",
  className,
  children,
  maxFontSizeMultiplier = 1.3,
  ...props
}: TextProps) {
  return (
    <RNText
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      className={cn(VARIANT_MAP[variant], className)}
      {...props}
    >
      {children}
    </RNText>
  );
}
