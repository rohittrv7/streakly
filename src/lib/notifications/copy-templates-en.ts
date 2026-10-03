export interface NudgeCopyParams {
  pendingHabits: number;
  pendingTasks: number;
  streakAtRiskHabit?: { name: string; streak: number };
}

export interface BriefCopyParams {
  scheduledHabits: number;
  scheduledTasks: number;
}

export const COPY_TEMPLATES_EN = {
  friendly: {
    pre: {
      titles: (name: string, lead: number) => [
        `${name} in ${lead === 1 ? "1m" : `${lead}m`}`,
        `Upcoming: ${name}`,
        `${name} starting soon`,
      ],
      bodies: (name: string, lead: number, streak?: number) => [
        streak ? `In ${lead === 1 ? "1 min" : `${lead} mins`}. Your ${streak}-day streak is going strong.` : `Coming up in ${lead === 1 ? "1 minute" : `${lead} minutes`}. Get ready!`,
        streak ? `Just ${lead === 1 ? "1 minute" : `${lead} minutes`} away. Protect your ${streak}-day streak.` : `Get ready for ${name} in ${lead === 1 ? "1 minute" : `${lead} minutes`}.`,
        streak ? `Almost time for ${name}. Keep that ${streak}-day momentum.` : `Time to wrap up and focus on ${name} soon.`,
      ],
    },
    at: {
      titles: (name: string) => [
        `Time for ${name}`,
        `${name} now`,
        `Momentum time: ${name}`,
      ],
      bodies: (name: string, streak?: number) => [
        streak ? `One checkmark and your streak hits ${streak + 1} days.` : `Take a moment to complete ${name} now.`,
        streak ? `Keep it going! Log ${name} for a ${streak + 1}-day streak.` : `It is time for ${name}. You got this!`,
        streak ? `Time for ${name}. Add day ${streak + 1} to your record.` : `Your scheduled time for ${name} is right now.`,
      ],
    },
    overdue: {
      titles: (name: string) => [
        `Streak at risk`,
        `Do not forget ${name}`,
        `Still time for ${name}`,
      ],
      bodies: (name: string, streak?: number) => [
        streak ? `${name} is still pending. Save your ${streak}-day streak today.` : `${name} is still waiting. Take a quick moment now.`,
        streak ? `Keep your ${streak}-day streak alive! Finish ${name} before midnight.` : `There is still time to finish ${name} today.`,
        streak ? `Your ${streak}-day streak needs you. Log ${name} before the day ends.` : `A quick session of ${name} keeps your momentum on track.`,
      ],
    },
    streakBroken: {
      titles: () => [
        `Streak broke`,
        `Fresh start today`,
        `Reset and rebuild`,
      ],
      bodies: (details: string) => [
        `${details} broke yesterday. Start again today!`,
        `Yesterday was tough. ${details} broke. Get back on track today.`,
        `Streaks reset, but habits stay. ${details} broke. Day 1 begins now.`,
      ],
    },
  },
  strict: {
    pre: {
      titles: (name: string, lead: number) => [
        `${name} in ${lead === 1 ? "1m" : `${lead}m`}`,
        `Get ready: ${name}`,
        `Upcoming: ${name}`,
      ],
      bodies: (name: string, lead: number, streak?: number) => [
        streak ? `Starts in ${lead === 1 ? "1 minute" : `${lead} minutes`}. Do not risk your ${streak}-day streak.` : `Starts in ${lead === 1 ? "1 minute" : `${lead} minutes`}. No distractions.`,
        streak ? `${lead === 1 ? "1 minute" : `${lead} minutes`} until ${name}. Plan ahead to keep your streak.` : `Be ready to start ${name} on time in ${lead === 1 ? "1 min" : `${lead} mins`}.`,
        streak ? `Almost time. Consistency built your ${streak}-day streak.` : `Get set for ${name}. Stay on schedule.`,
      ],
    },
    at: {
      titles: (name: string) => [
        `Time to act: ${name}`,
        `${name} scheduled now`,
        `No excuses: ${name}`,
      ],
      bodies: (name: string, streak?: number) => [
        streak ? `Time for ${name}. Make today day ${streak + 1}, do not delay.` : `It is time for ${name}. Get it done now.`,
        streak ? `Execute ${name} now. Protect your ${streak}-day streak.` : `Start ${name} now. Stick to your commitment.`,
        streak ? `Action beats intention. Log ${name} right away.` : `Scheduled time has arrived. Do ${name} without delay.`,
      ],
    },
    overdue: {
      titles: (name: string) => [
        `Breaking your streak?`,
        `Overdue: ${name}`,
        `Do not lose momentum`,
      ],
      bodies: (name: string, streak?: number) => [
        streak ? `Do not waste ${streak} days of work on a single skip. Do ${name} now.` : `${name} is overdue. Get it finished now.`,
        streak ? `Skipping today breaks your ${streak}-day streak. Step up.` : `You committed to ${name}. Follow through before midnight.`,
        streak ? `Excuses will not save your ${streak}-day streak. Finish ${name}.` : `Do not let today slip away. Complete ${name} now.`,
      ],
    },
    streakBroken: {
      titles: () => [
        `Streak broken`,
        `Reset to zero`,
        `Lost your streak`,
      ],
      bodies: (details: string) => [
        `Skipped yesterday: ${details}. Rebuild from day 1.`,
        `${details} ended. The only fix is starting right now.`,
        `Yesterday slipped: ${details}. No excuses today.`,
      ],
    },
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
      return `${parts.join(" and ")} left today. You got this!`;
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
    day3: { title: "We miss you", body: "Your streaks are waiting. Take a moment to log your progress." },
    day7: { title: "Fresh start", body: "A new week begins today. Step back in and start strong." },
  },
  group: {
    title: (count: number) => `${count} reminders`,
    body: (items: string[]) => items.join(", "),
  },
};
