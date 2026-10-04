export interface ComputeScrollTargetParams {
  inputBottom: number;
  keyboardTop: number;
  margin?: number;
  contentHeight: number;
  viewportHeight: number;
  currentScroll?: number;
}

export interface ComputeScrollTargetResult {
  targetScroll: number;
  shouldScroll: boolean;
}

/**
 * Pure helper calculating scroll target to keep a focused input visible
 * at roughly `margin` (default 24px) above the keyboard.
 */
export function computeScrollTarget(
  params: ComputeScrollTargetParams
): ComputeScrollTargetResult {
  const {
    inputBottom,
    keyboardTop,
    margin = 24,
    contentHeight,
    viewportHeight,
    currentScroll = 0,
  } = params;

  // If keyboard is at or below viewport, no obstruction
  if (keyboardTop >= viewportHeight || keyboardTop <= 0) {
    return { targetScroll: currentScroll, shouldScroll: false };
  }

  const effectiveKeyboardTop = keyboardTop;
  const neededClearance = inputBottom + margin;

  // Input is already comfortably above the keyboard
  if (neededClearance <= effectiveKeyboardTop) {
    return { targetScroll: currentScroll, shouldScroll: false };
  }

  // Calculate required scroll delta
  const delta = neededClearance - effectiveKeyboardTop;
  let newScroll = currentScroll + delta;

  // Available visible height above keyboard
  const visibleHeight = Math.max(1, effectiveKeyboardTop);
  const maxScroll = Math.max(0, contentHeight - visibleHeight);

  // Clamp within [0, maxScroll]
  newScroll = Math.min(newScroll, maxScroll);
  newScroll = Math.max(0, newScroll);

  const shouldScroll = Math.abs(newScroll - currentScroll) > 1;

  return {
    targetScroll: Math.round(newScroll),
    shouldScroll,
  };
}
