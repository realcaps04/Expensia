const DEFAULT_CONVEX_URL = "https://fiery-capybara-393.convex.cloud";

export function getConvexUrl() {
  return import.meta.env.VITE_CONVEX_URL?.trim() || DEFAULT_CONVEX_URL;
}

export const isConvexEnabled = true;
