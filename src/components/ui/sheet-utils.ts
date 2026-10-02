export type SheetSize = "auto" | "tall" | "full";

export interface SheetHeightConfig {
  maxHeight: number;
  height?: number;
}

export function resolveSheetHeight(
  size: SheetSize = "auto",
  screenHeight: number,
  topInset = 0
): SheetHeightConfig {
  const safeScreenHeight = Math.max(0, screenHeight);
  const fullHeight = Math.max(0, safeScreenHeight - topInset);
  const tallHeight = Math.round(safeScreenHeight * 0.85);

  if (size === "full") {
    return {
      maxHeight: fullHeight,
      height: fullHeight,
    };
  }

  if (size === "tall") {
    return {
      maxHeight: tallHeight,
      height: tallHeight,
    };
  }

  // 'auto': fits content up to 85% of screen height
  return {
    maxHeight: tallHeight,
  };
}
