// Core TypeScript types and interfaces
export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: string; // JSON or specific format
  reminderTime?: string;
  createdAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  category: "Study" | "Fitness" | "Reading" | "Work" | "Custom";
  date: string; // YYYY-MM-DD
  timeSlot?: string;
  isCompleted: boolean;
}
