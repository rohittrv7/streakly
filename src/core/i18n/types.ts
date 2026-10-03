import type { FocusTranslationSchema, NotificationTranslationSchema } from "./types-features";
import type {
  TabsTranslationSchema,
  TodayTranslationSchema,
  HabitsTranslationSchema,
  PlannerTranslationSchema,
  StatsTranslationSchema,
  YouTubeTranslationSchema,
} from "./types-screens";

export * from "./types-features";
export * from "./types-screens";

export type Language = "en" | "hinglish";

export interface TranslationSchema {
  tabs: TabsTranslationSchema;
  common: {
    save: string;
    cancel: string;
    done: string;
    delete: string;
    edit: string;
    back: string;
    close: string;
    retry: string;
    loading: string;
    empty: string;
    confirm: string;
    error: string;
    success: string;
    all: string;
    undo: string;
    today: string;
    yesterday: string;
    tomorrow: string;
    day: string;
    days: string;
    new: string;
    create: string;
    update: string;
    remove: string;
    active: string;
    min: string;
    hour: string;
    somethingWentWrong: string;
    unexpectedError: string;
    restartApp: string;
    dbInitTimeout: string;
    dbError: string;
    dbLoading: string;
    mobileOnlyTitle: string;
    mobileOnlyDesc: string;
    retryInit: string;
  };
  today: TodayTranslationSchema;
  habits: HabitsTranslationSchema;
  planner: PlannerTranslationSchema;
  categories: {
    study: string;
    fitness: string;
    reading: string;
    work: string;
    custom: string;
  };
  youtube: YouTubeTranslationSchema;
  focus: FocusTranslationSchema;
  stats: StatsTranslationSchema;
  notifications: NotificationTranslationSchema;
  settings: {
    title: string;
    preferences: string;
    appearance: string;
    accentColor: string;
    language: string;
    english: string;
    hinglish: string;
    haptics: string;
    notifications: string;
    focus: string;
    data: string;
    exportBackup: string;
    importBackup: string;
    deleteAll: string;
    about: string;
    developer: string;
    uiGallery: string;
    reseed: string;
    youtubeApiKey: string;
    youtubeApiKeyHelp: string;
    appLanguage: string;
    streakSaved: string;
  };
  about: {
    appName: string;
    version: string;
    howStreaksWork: string;
    howStreaksWorkSummary: string;
    privacyNote: string;
    privacyNoteSummary: string;
    streaksModalTitle: string;
    streaksExplanation: string;
    privacyModalTitle: string;
    privacyExplanation: string;
  };
}
