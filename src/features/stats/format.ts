export function formatMinutes(minutes: number): string {
  if (!minutes || minutes <= 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${remainingMinutes}m`;
}

export function formatPercent(percent: number): string {
  const rounded = Math.round(percent);
  return `${rounded}%`;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  const p = plural || `${singular}s`;
  return `${count} ${count === 1 ? singular : p}`;
}

export function formatDelta(delta: number | null): { text: string; direction: "up" | "down" | "neutral" } {
  if (delta === null || isNaN(delta)) {
    return { text: "--", direction: "neutral" };
  }
  const rounded = Math.round(delta);
  if (rounded > 0) {
    return { text: `+${rounded} pts`, direction: "up" };
  }
  if (rounded < 0) {
    return { text: `${rounded} pts`, direction: "down" };
  }
  return { text: "0 pts", direction: "neutral" };
}
