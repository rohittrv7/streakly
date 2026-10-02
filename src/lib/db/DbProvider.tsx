import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import { getDb } from "./client";
import { runMigrations } from "./migrations";
import { seedDatabase } from "./seed";
import { THEME_COLORS } from "@/lib/theme";
import { Screen, Text, Button } from "@/components/ui";

interface DbContextValue {
  isReady: boolean;
  error: Error | null;
  retry: () => void;
}

const DbContext = createContext<DbContextValue>({
  isReady: false,
  error: null,
  retry: () => {},
});

export const useDb = () => useContext(DbContext);

interface DbProviderProps {
  children: React.ReactNode;
  onReady?: () => void;
}

const INIT_TIMEOUT_MS = 10000;

export function DbProvider({ children, onReady }: DbProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimeoutTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const initDb = async () => {
    if (Platform.OS === "web") {
      return;
    }

    clearTimeoutTimer();
    setError(null);
    setIsReady(false);

    timeoutRef.current = setTimeout(() => {
      const timeoutErr = new Error(
        "Database initialization timed out. Tap Retry to try again."
      );
      console.error("[DbProvider] Startup timeout reached:", timeoutErr);
      setError(timeoutErr);
    }, INIT_TIMEOUT_MS);

    try {
      const db = await getDb();
      await runMigrations(db);
      if (__DEV__) {
        await seedDatabase();
      }
      clearTimeoutTimer();
      setIsReady(true);
      onReady?.();
    } catch (err) {
      clearTimeoutTimer();
      console.error("[DbProvider] Initialization failed:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      onReady?.();
    }
  };

  useEffect(() => {
    if (Platform.OS === "web") {
      onReady?.();
      return;
    }
    initDb();

    return () => {
      clearTimeoutTimer();
    };
  }, []);

  // Web fallback: Inform users that Streakly is built for mobile
  if (Platform.OS === "web") {
    return (
      <Screen className="items-center justify-center">
        <View className="items-center justify-center max-w-[340px] px-6">
          <Text variant="title" className="text-center mb-3">
            Streakly is built for mobile
          </Text>
          <Text
            variant="body"
            className="text-text-secondary text-center leading-relaxed"
          >
            Open it in Expo Go on your phone or an Android/iOS emulator.
          </Text>
        </View>
      </Screen>
    );
  }

  // Error state with real error message and retry button
  if (error) {
    return (
      <Screen className="items-center justify-center px-6">
        <View className="items-center justify-center max-w-[340px] w-full">
          <Text variant="title" className="text-coral text-center mb-2">
            Database Error
          </Text>
          <Text
            variant="body"
            className="text-text-secondary text-center mb-6 leading-relaxed"
          >
            {error.message || "Failed to initialize local SQLite database."}
          </Text>
          <Button
            title="Retry Initialization"
            variant="primary"
            onPress={initDb}
            className="w-full"
          />
        </View>
      </Screen>
    );
  }

  // Loading state: plain muted text on dark background, using theme tokens
  if (!isReady) {
    return (
      <Screen className="items-center justify-center">
        <View className="items-center justify-center">
          <ActivityIndicator size="large" color={THEME_COLORS.primary} />
          <Text
            variant="caption"
            className="text-text-secondary mt-4 font-semibold tracking-wider text-center"
          >
            Loading Streakly Data...
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <DbContext.Provider value={{ isReady, error, retry: initDb }}>
      {children}
    </DbContext.Provider>
  );
}
