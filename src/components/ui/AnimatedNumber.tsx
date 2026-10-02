import React, { useEffect, useRef, useState } from "react";
import { Text, type TextProps } from "react-native";
import { cn } from "@/core/utils/cn";

export interface AnimatedNumberProps extends Omit<TextProps, "children"> {
  value: number;
  duration?: number;
  formatter?: (val: number) => string;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedNumber({
  value,
  duration = 500,
  formatter,
  prefix = "",
  suffix = "",
  className,
  ...props
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);

  useEffect(() => {
    const startValue = previousValueRef.current;
    const endValue = value;
    previousValueRef.current = value;

    if (startValue === endValue) {
      setDisplayValue(endValue);
      return;
    }

    const startTime = Date.now();
    let animationFrameId: number;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (endValue - startValue) * easeProgress);

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(tick);
      } else {
        setDisplayValue(endValue);
      }
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  const formatted = formatter ? formatter(displayValue) : displayValue.toString();

  return (
    <Text
      className={cn("text-text-primary font-bold text-2xl font-mono", className)}
      {...props}
    >
      {prefix}
      {formatted}
      {suffix}
    </Text>
  );
}
