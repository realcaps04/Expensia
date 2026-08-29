export function getConvexUrl() {
  return import.meta.env.VITE_CONVEX_URL?.trim() ?? "";
}

export const isConvexEnabled = Boolean(getConvexUrl());
