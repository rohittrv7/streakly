import { create } from "zustand";

export interface ReconcileResult {
  at: string;
  plannedCount: number;
  scheduledCount: number;
  cancelledCount: number;
  errors: string[];
}

interface ReconcileState {
  lastResult: ReconcileResult | null;
  setResult: (result: ReconcileResult) => void;
}

export const useReconcileStore = create<ReconcileState>((set) => ({
  lastResult: null,
  setResult: (result) => set({ lastResult: result }),
}));
