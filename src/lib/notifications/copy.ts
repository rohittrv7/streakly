import type { SupportedLanguage } from "./types";

export function stringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickVariant<T>(variants: T[], seed: string): T {
  const index = stringHash(seed) % variants.length;
  return variants[index];
}

export interface NudgeCopyParams {
  pendingHabits: number;
  pendingTasks: number;
  streakAtRiskHabit?: { name: string; streak: number };
}

export interface BriefCopyParams {
  scheduledHabits: number;
  scheduledTasks: number;
}

export const NOTIFICATION_COPY = {
  en: {
    habitReminder: {
      titles: ["Time for your habit", "Keep the momentum", "Habit check-in"],
      bodies: (habitName: string) => [
        `Ready to complete ${habitName}?`,
        `A quick session of ${habitName} keeps you on track.`,
        `Don't break the chain on ${habitName}.`,
      ],
    },
    taskReminder: {
      titles: ["Upcoming task", "Task reminder", "Plan reminder"],
      bodies: (taskTitle: string) => [
        `Starting soon: ${taskTitle}`,
        `${taskTitle} is scheduled in a few minutes.`,
        `Get ready for ${taskTitle}.`,
      ],
    },
    eveningNudge: {
      title: "Evening check-in",
      genericBody: "Review your habits and close out your goals for today.",
      dynamicBody: ({ pendingHabits, pendingTasks, streakAtRiskHabit }: NudgeCopyParams) => {
        if (streakAtRiskHabit && streakAtRiskHabit.streak >= 3) {
          return `${streakAtRiskHabit.streak}-day streak at risk for ${streakAtRiskHabit.name}. Finish it before midnight!`;
        }
        const parts: string[] = [];
        if (pendingHabits > 0) parts.push(`${pendingHabits} habit${pendingHabits > 1 ? "s" : ""}`);
        if (pendingTasks > 0) parts.push(`${pendingTasks} task${pendingTasks > 1 ? "s" : ""}`);
        return `${parts.join(" and ")} left today. You've got this!`;
      },
    },
    morningBrief: {
      title: "Morning briefing",
      body: ({ scheduledHabits, scheduledTasks }: BriefCopyParams) => {
        const parts: string[] = [];
        if (scheduledHabits > 0) parts.push(`${scheduledHabits} habit${scheduledHabits > 1 ? "s" : ""}`);
        if (scheduledTasks > 0) parts.push(`${scheduledTasks} task${scheduledTasks > 1 ? "s" : ""}`);
        return parts.length > 0
          ? `Today you have ${parts.join(" and ")} lined up.`
          : "Your day is open. Set an intention or relax.";
      },
    },
    comeback: {
      day3: {
        title: "We miss you",
        body: "Your streaks are waiting. Take a moment to log your progress.",
      },
      day7: {
        title: "Fresh start",
        body: "A new week begins today. Step back in and start strong.",
      },
    },
  },
  hinglish: {
    habitReminder: {
      titles: ["Aapka habit reminder", "Momentum banaye rakhein", "Habit ka waqt"],
      bodies: (habitName: string) => [
        `Kya aap ${habitName} ke liye tayar hain?`,
        `${habitName} complete karke track par rahein.`,
        `${habitName} ka streak miss mat hone dena.`,
      ],
    },
    taskReminder: {
      titles: ["Task aane wala hai", "Task reminder", "Plan reminder"],
      bodies: (taskTitle: string) => [
        `Jald shuru ho raha hai: ${taskTitle}`,
        `${taskTitle} kuch hi minute me scheduled hai.`,
        `${taskTitle} ke liye ready ho jayein.`,
      ],
    },
    eveningNudge: {
      title: "Shaam ka review",
      genericBody: "Aaj ke habits check karein aur din complete karein.",
      dynamicBody: ({ pendingHabits, pendingTasks, streakAtRiskHabit }: NudgeCopyParams) => {
        if (streakAtRiskHabit && streakAtRiskHabit.streak >= 3) {
          return `${streakAtRiskHabit.streak} din ka streak, ab mat todna: ${streakAtRiskHabit.name} bacha hai!`;
        }
        const parts: string[] = [];
        if (pendingHabits > 0) parts.push(`${pendingHabits} habit`);
        if (pendingTasks > 0) parts.push(`${pendingTasks} task`);
        return `Aaj ${parts.join(" aur ")} bache hain. Finish kar lijiye!`;
      },
    },
    morningBrief: {
      title: "Subah ka briefing",
      body: ({ scheduledHabits, scheduledTasks }: BriefCopyParams) => {
        const parts: string[] = [];
        if (scheduledHabits > 0) parts.push(`${scheduledHabits} habit`);
        if (scheduledTasks > 0) parts.push(`${scheduledTasks} task`);
        return parts.length > 0
          ? `Aaj aapke ${parts.join(" aur ")} scheduled hain.`
          : "Aaj ka din open hai. Naya goal banayein ya aaram karein.";
      },
    },
    comeback: {
      day3: {
        title: "Aapko miss kiya",
        body: "Aapke streaks intezar kar rahe hain. Ek minute nikaal ke log karein.",
      },
      day7: {
        title: "Nayi shuruat",
        body: "Har naya din ek nayi shuruat hai. Wapas aayein aur shuru karein.",
      },
    },
  },
};

export function getHabitReminderCopy(
  habitName: string,
  seed: string,
  lang: SupportedLanguage = "en"
): { title: string; body: string } {
  const table = NOTIFICATION_COPY[lang] || NOTIFICATION_COPY.en;
  const title = pickVariant(table.habitReminder.titles, seed);
  const bodies = table.habitReminder.bodies(habitName);
  const body = pickVariant(bodies, seed);
  return { title, body };
}

export function getTaskReminderCopy(
  taskTitle: string,
  seed: string,
  lang: SupportedLanguage = "en"
): { title: string; body: string } {
  const table = NOTIFICATION_COPY[lang] || NOTIFICATION_COPY.en;
  const title = pickVariant(table.taskReminder.titles, seed);
  const bodies = table.taskReminder.bodies(taskTitle);
  const body = pickVariant(bodies, seed);
  return { title, body };
}
