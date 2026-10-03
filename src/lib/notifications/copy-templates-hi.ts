import type { NudgeCopyParams, BriefCopyParams } from "./copy-templates-en";

export const COPY_TEMPLATES_HI = {
  friendly: {
    pre: {
      titles: (name: string, lead: number) => [
        `${lead === 1 ? "1 min" : `${lead} min`} mein: ${name}`,
        `Taiyaar ho jao: ${name}`,
        `${name} shuru hone wala hai`,
      ],
      bodies: (name: string, lead: number, streak?: number) => [
        streak ? `Taiyaar ho jao. ${streak} din ki streak chal rahi hai.` : `${lead === 1 ? "1 minute" : `${lead} minute`} mein ${name} shuru hone wala hai.`,
        streak ? `Bas ${lead === 1 ? "1 min" : `${lead} min`} door. ${streak} din ka streak banaye rakhein.` : `Agla task ${name} hai, taiyaari kar lijiye.`,
        streak ? `${name} ka time paas hai. ${streak} din ki mehnat jari rakhein.` : `${lead === 1 ? "1 min" : `${lead} min`} mein ${name} ke liye ready ho jao.`,
      ],
    },
    at: {
      titles: (name: string) => [
        `${name} ka time ho gaya`,
        `Abhi karein: ${name}`,
        `Waqt ho gaya: ${name}`,
      ],
      bodies: (name: string, streak?: number) => [
        streak ? `Ek tick aur streak ${streak + 1} din ki.` : `${name} ka waqt ho gaya hai. Abhi complete karein.`,
        streak ? `Momentum banaye rakhein. ${streak + 1} din ka streak lock karein.` : `Thoda waqt nikaalein aur ${name} complete karein.`,
        streak ? `${name} ka reminder. Day ${streak + 1} complete karein.` : `Aapka ${name} scheduled hai, chaliye complete karte hain.`,
      ],
    },
    overdue: {
      titles: (name: string) => [
        `Streak khatre mein hai`,
        `${name} abhi baaki hai`,
        `Yaad rakhein: ${name}`,
      ],
      bodies: (name: string, streak?: number) => [
        streak ? `${name} abhi baaki hai. ${streak} din ki streak aaj bacha lo.` : `${name} abhi baaki hai. Thoda waqt nikaal lijiye.`,
        streak ? `${streak} din ki streak na toote! Midnight se pehle ${name} karein.` : `Din khatam hone se pehle ${name} zaroor kar lijiye.`,
        streak ? `Aapka ${streak} din ka streak wait kar raha hai. Complete karein.` : `${name} complete karke apna din successful banayein.`,
      ],
    },
    streakBroken: {
      titles: () => [
        `Streak toot gayi`,
        `Nayi shuruat aaj`,
        `Phir se shuru karein`,
      ],
      bodies: (details: string) => [
        `${details} kal toot gayi. Aaj se phir shuru karo.`,
        `Kal miss ho gaya. ${details} toot gayi. Aaj wapas track par aao.`,
        `Streak zero ho sakti hai, irada nahi. ${details} toot gayi. Aaj naya din hai.`,
      ],
    },
  },
  strict: {
    pre: {
      titles: (name: string, lead: number) => [
        `${lead === 1 ? "1 min" : `${lead} min`} mein: ${name}`,
        `Dhyan dein: ${name}`,
        `Time hone wala hai: ${name}`,
      ],
      bodies: (name: string, lead: number, streak?: number) => [
        streak ? `${lead === 1 ? "1 min" : `${lead} min`} mein shuru. ${streak} din ki streak par focus rakhein.` : `${lead === 1 ? "1 minute" : `${lead} minute`} mein shuru karo, delay mat karna.`,
        streak ? `${name} aane wala hai. Koi bahana nahi, time par shuru karein.` : `Schedule par bane rahein, ${lead === 1 ? "1 min" : `${lead} min`} mein shuru karein.`,
        streak ? `Time waste mat karo. ${streak} din ka streak barkarar rakho.` : `Taiyaar rahein, ${name} right time par shuru karna hai.`,
      ],
    },
    at: {
      titles: (name: string) => [
        `Abhi karein: ${name}`,
        `Time waste mat karein: ${name}`,
        `${name} ka waqt`,
      ],
      bodies: (name: string, streak?: number) => [
        streak ? `${name} ka time hai. Day ${streak + 1} aaj hi complete karo.` : `${name} ka scheduled time ho gaya. Turant karein.`,
        streak ? `Der mat karo. ${streak} din ki mehnat zaya mat hone do.` : `Abhi shuru karein, baad par mat taaliye.`,
        streak ? `Karna hai toh abhi karo. ${name} complete karo.` : `Commitment pura karein. ${name} abhi karein.`,
      ],
    },
    overdue: {
      titles: (name: string) => [
        `Streak tod rahe ho?`,
        `Overdue hai: ${name}`,
        `Bahana mat banao`,
      ],
      bodies: (name: string, streak?: number) => [
        streak ? `${streak} din ki mehnat ek skip mein mat gawao. ${name} abhi karo.` : `${name} pending hai. Isse abhi pura karo.`,
        streak ? `Aaj chhodoge toh ${streak} din ki streak khatam. Abhi karo.` : `Apna commitment yaad rakhein, ${name} abhi finish karein.`,
        streak ? `Aalas chhoriye. ${streak} din ka record bachana aapke haath mein hai.` : `Time nikalta ja raha hai. ${name} turant karo.`,
      ],
    },
    streakBroken: {
      titles: () => [
        `Streak toot gayi`,
        `Kal skip kiya`,
        `Streak khatam`,
      ],
      bodies: (details: string) => [
        `Kal skip kiya: ${details}. Aaj se phir shuru karo.`,
        `${details} khatam. Aaj phir se zero se shuru karna hoga.`,
        `Consistency toot gayi: ${details}. Aaj koi skip nahi chalega.`,
      ],
    },
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
    day3: { title: "Aapko miss kiya", body: "Aapke streaks intezar kar rahe hain. Ek minute nikaal ke log karein." },
    day7: { title: "Nayi shuruat", body: "Har naya din ek nayi shuruat hai. Wapas aayein aur shuru karein." },
  },
  group: {
    title: (count: number) => `${count} reminders`,
    body: (items: string[]) => items.join(", "),
  },
};
