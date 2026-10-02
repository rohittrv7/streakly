import type { SupportedLanguage, NotificationTone } from "./types";
import { COPY_TEMPLATES } from "./copy-templates";

export { COPY_TEMPLATES, type NudgeCopyParams, type BriefCopyParams } from "./copy-templates";

export function stringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function pickVariant<T>(variants: T[], seed: string): T {
  const index = stringHash(seed) % variants.length;
  return variants[index];
}

export function getPreReminderCopy(
  name: string,
  lead: number,
  seed: string,
  streak?: number,
  tone: NotificationTone = "friendly",
  lang: SupportedLanguage = "en"
): { title: string; body: string } {
  const table = (COPY_TEMPLATES[lang] || COPY_TEMPLATES.en)[tone].pre;
  const titles = table.titles(name, lead);
  const bodies = table.bodies(name, lead, streak);
  return {
    title: pickVariant(titles, seed),
    body: pickVariant(bodies, seed),
  };
}

export function getAtReminderCopy(
  name: string,
  seed: string,
  streak?: number,
  tone: NotificationTone = "friendly",
  lang: SupportedLanguage = "en"
): { title: string; body: string } {
  const table = (COPY_TEMPLATES[lang] || COPY_TEMPLATES.en)[tone].at;
  const titles = table.titles(name);
  const bodies = table.bodies(name, streak);
  return {
    title: pickVariant(titles, seed),
    body: pickVariant(bodies, seed),
  };
}

export function getOverdueReminderCopy(
  name: string,
  seed: string,
  streak?: number,
  tone: NotificationTone = "friendly",
  lang: SupportedLanguage = "en"
): { title: string; body: string } {
  const table = (COPY_TEMPLATES[lang] || COPY_TEMPLATES.en)[tone].overdue;
  const titles = table.titles(name);
  const bodies = table.bodies(name, streak);
  return {
    title: pickVariant(titles, seed),
    body: pickVariant(bodies, seed),
  };
}

export function getStreakBrokenCopy(
  details: string,
  seed: string,
  tone: NotificationTone = "friendly",
  lang: SupportedLanguage = "en"
): { title: string; body: string } {
  const table = (COPY_TEMPLATES[lang] || COPY_TEMPLATES.en)[tone].streakBroken;
  const titles = table.titles();
  const bodies = table.bodies(details);
  return {
    title: pickVariant(titles, seed),
    body: pickVariant(bodies, seed),
  };
}

export function getGroupedReminderCopy(
  items: string[],
  lang: SupportedLanguage = "en"
): { title: string; body: string } {
  const table = (COPY_TEMPLATES[lang] || COPY_TEMPLATES.en).group;
  return {
    title: table.title(items.length),
    body: table.body(items),
  };
}

// Backwards compatibility for existing tests and code
export const NOTIFICATION_COPY = COPY_TEMPLATES;

export function getHabitReminderCopy(
  habitName: string,
  seed: string,
  lang: SupportedLanguage = "en"
): { title: string; body: string } {
  return getAtReminderCopy(habitName, seed, undefined, "friendly", lang);
}

export function getTaskReminderCopy(
  taskTitle: string,
  seed: string,
  lang: SupportedLanguage = "en"
): { title: string; body: string } {
  return getAtReminderCopy(taskTitle, seed, undefined, "friendly", lang);
}
