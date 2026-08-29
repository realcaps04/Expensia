import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getConvexUserId } from "../lib/session";
import {
  applyTheme,
  loadStoredTheme,
  saveStoredTheme,
  watchSystemTheme,
  type ThemePreference,
} from "../lib/theme";
import { useAuth } from "./AuthProvider";

type ThemeContextValue = {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = getConvexUserId(user);
  const convexUser = useQuery(api.users.getUser, userId ? { userId } : "skip");
  const [theme, setThemeState] = useState<ThemePreference>(() => loadStoredTheme());

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next);
    saveStoredTheme(next);
    applyTheme(next);
  }, []);

  useEffect(() => {
    if (convexUser?.settings?.theme) {
      setThemeState(convexUser.settings.theme);
      saveStoredTheme(convexUser.settings.theme);
      applyTheme(convexUser.settings.theme);
    }
  }, [convexUser?.settings?.theme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    return watchSystemTheme(() => applyTheme("system"));
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
