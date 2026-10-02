export const MIN_DURATION_SEC = 10;
export const MAX_DURATION_SEC = 180 * 60; // 10,800 seconds (3 hours)

export function shouldLogSession(durationSeconds: number): boolean {
  return durationSeconds >= 60;
}

export function formatClock(ms: number): string {
  const totalSeconds = Math.ceil(Math.max(0, ms) / 1000);
  if (totalSeconds >= 3600) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatDurationLabel(sec: number): string {
  const clamped = Math.max(0, Math.round(sec));
  if (clamped < 60) return `${clamped} sec`;

  const hours = Math.floor(clamped / 3600);
  const remainingSec = clamped % 3600;
  const minutes = Math.floor(remainingSec / 60);
  const seconds = remainingSec % 60;

  if (hours > 0) {
    if (minutes > 0 && seconds > 0) return `${hours} h ${minutes} min ${seconds} sec`;
    if (minutes > 0) return `${hours} h ${minutes} min`;
    if (seconds > 0) return `${hours} h ${seconds} sec`;
    return `${hours} h`;
  }

  if (seconds > 0) {
    return `${minutes} min ${seconds} sec`;
  }
  return `${minutes} min`;
}

export function stepDurationSec(current: number, direction: 1 | -1): number {
  let next: number;
  if (direction === 1) {
    if (current < 60) {
      next = Math.floor(current / 10) * 10 + 10;
    } else if (current < 600) {
      next = Math.floor(current / 30) * 30 + 30;
    } else {
      next = Math.floor(current / 300) * 300 + 300;
    }
  } else {
    if (current <= 60) {
      const remainder = current % 10;
      next = remainder === 0 ? current - 10 : current - remainder;
    } else if (current <= 600) {
      const remainder = current % 30;
      next = remainder === 0 ? current - 30 : current - remainder;
    } else {
      const remainder = current % 300;
      next = remainder === 0 ? current - 300 : current - remainder;
    }
  }

  return Math.min(MAX_DURATION_SEC, Math.max(MIN_DURATION_SEC, next));
}
