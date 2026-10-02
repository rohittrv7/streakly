# Streakly ⚡

> **A focused, local-first habit, planner, and focus tracking app designed for mobile.** Built with Expo, React Native, SQLite, NativeWind v4, and Reanimated.

---

## 📱 Features

- **Daily & Weekly Habit Streaks**: Schedule by daily, specific weekdays, or times per week. Streak freezes, auto-freeze on inactivity, and weekly targets.
- **Planner & Day Timeline**: Today's hourly schedule, drag/reorder checklists, YouTube study and reference playlist integration with video card embeds.
- **Deep Focus Timer**: Pomodoro & custom focus modes (focus, short break, long break) linked to tasks with auto-stop session logging (>= 60s logged to SQLite).
- **Interactive Visual Stats**: Custom charts built with `react-native-svg` and `react-native-reanimated` for habit consistency, completion heatmaps, and focus duration.
- **Dynamic Accent Themes**: 5 curated WCAG AA-compliant accent colors (Lime, Coral, Sky, Mint, Amber) using NativeWind CSS variables that update the entire UI instantly.
- **Lightweight Typed i18n**: Roman Hinglish and English localization out of the box with zero runtime library overhead.
- **Backup & Restore**: Schema-validated JSON export/import with referential integrity checks and a 10-minute undo snapshot.
- **Local Smart Notifications**: Rolling 7-day schedule with quiet hours, morning briefs, evening nudges, and habit reminders.

---

## 🛠 Tech Stack

- **Framework**: [Expo SDK](https://expo.dev/) (Expo Router v4, Continuous Native Generation)
- **Runtime**: React Native (Fabric architecture)
- **Local Database**: `expo-sqlite` (WAL mode, foreign keys, indexed queries)
- **Styling**: [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS with CSS variables for dynamic accents)
- **Animation**: `react-native-reanimated` with `useReducedMotion` support
- **Icons**: `phosphor-react-native`
- **State Management**: `zustand` (selectors, fast subscriptions)
- **Graphics & Charts**: `react-native-svg`
- **Notifications**: `expo-notifications` (local scheduled notifications)

---

## 📁 Directory Structure

```text
├── src/
│   ├── app/                      # Expo Router screens and navigators
│   │   ├── (tabs)/               # Tab screens: today, habits, planner, focus, stats
│   │   ├── _layout.tsx           # Root layout with theme provider & error boundary
│   │   └── settings.tsx          # Settings screen
│   ├── components/ui/            # Design system primitives (Button, Card, Sheet, etc.)
│   ├── core/
│   │   ├── i18n/                 # Dictionaries (en, hinglish), t(), plural, useT()
│   │   └── utils/                # Date utilities, haptics wrapper, math
│   ├── features/
│   │   ├── habits/               # Habit store, SQLite repo, streak engine, cards
│   │   ├── planner/              # Tasks, checklists, YouTube playlist embeds, day strip
│   │   ├── focus/                # Pure timer state machine, audio, session logging
│   │   ├── stats/                # Ranges, custom SVG BarChart & LineChart
│   │   └── settings/             # Preferences store, backup export/import/delete
│   └── lib/
│       ├── db/                   # SQLite connection, migrations, demo & stress seeds
│       ├── notifications/        # Reconcile engine, planning, channels, copy
│       └── theme/                # Tokens, accent color store, WCAG contrast utilities
├── scripts/
│   └── generate-assets.js        # Programmatic icon and splash generator
└── __tests__/                    # Jest unit tests for logic, streak, backup, i18n
```

---

## 📐 Architecture Rules

1. **Strict Layering**: No SQL in React components or screens. All database operations are encapsulated in `repo.ts` files with parameterized statements.
2. **Design Tokens Only**: No hard-coded hex colors in components. UI chrome uses `accent` tokens and `useAccent()` for SVGs, while habit category colors remain stable user data.
3. **Accessibility**: Minimum 44px touch targets on interactive controls. Respects `useReducedMotion` across all animations and charts. Safe-area insets applied on all edges.
4. **File Size Limit**: Every source file stays strictly under 200 lines to ensure maintainability and modularity.
5. **Atomic Transactions**: Multi-table updates, database migrations, and backup restores are executed inside SQLite transactions (`db.withTransactionAsync`).

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or bun
- Expo Go on an iOS or Android device, or an Android/iOS emulator

### Installation

```bash
git clone <repository-url>
cd tracker
npm install
```

### Running the App

```bash
# Start Expo development server
npx expo start

# Run on Android emulator / connected device
npx expo run:android

# Run on iOS simulator (macOS only)
npx expo run:ios
```

---

## 🧪 Testing & Validation

```bash
# Typecheck
npx tsc --noEmit

# Run Jest unit test suite
npm test

# Diagnose Expo dependencies & config
npx expo-doctor

# Verify production export
npx expo export --platform android
```

---

## 🔄 Demo Data & Stress Testing

- **Demo Data**: When running in `__DEV__`, the app automatically populates rich demo habits and tasks on first launch. You can reset and reseed at any time via **Settings → Developer → Reset & Reseed Demo Data**.
- **Stress Seed**: Test UI performance and chart rendering under heavy scale (40 habits, 3000 completions, 1500 tasks, 600 focus sessions) by tapping **Settings → Developer → Run Stress Seed**.

---

## 🎨 Asset Generation

All app icons, adaptive icon layers, notification silhouettes, and splash screens are generated programmatically:

```bash
node scripts/generate-assets.js
```

---

## ⚠️ Known Limitations

- **Local-Only Storage**: All data is stored directly in SQLite on the local device. There is no cloud sync or account login. Backups can be exported and transferred manually as JSON.
- **Expo Go Limitations**: Advanced native notification triggers, foreground service audio, and full background wakeups require a development build (`npx expo run:android` / `npx expo run:ios`).
