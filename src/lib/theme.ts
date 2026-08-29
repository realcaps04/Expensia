export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "expensia-theme";
const DEFAULT_THEME: ThemePreference = "light";

export function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function resolveTheme(preference: ThemePreference): "light" | "dark" {
  if (preference === "system") return getSystemTheme();
  return preference;
}

export function loadStoredTheme(): ThemePreference {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
  } catch {
    // ignore
  }
  return DEFAULT_THEME;
}

export function saveStoredTheme(theme: ThemePreference) {
  localStorage.setItem(STORAGE_KEY, theme);
}

export function applyTheme(preference: ThemePreference) {
  if (typeof document === "undefined") return;

  const resolved = resolveTheme(preference);
  const root = document.documentElement;

  root.classList.toggle("dark", resolved === "dark");
  root.dataset.theme = preference;

  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute("content", resolved === "dark" ? "#0F172A" : "#FAFAF8");
}

export function initTheme() {
  applyTheme(loadStoredTheme());
}

export function watchSystemTheme(onChange: (resolved: "light" | "dark") => void) {
  if (typeof window === "undefined") return () => {};

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => onChange(getSystemTheme());

  media.addEventListener("change", handler);
  return () => media.removeEventListener("change", handler);
}
