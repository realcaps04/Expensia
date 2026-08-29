import type { Id } from "../../convex/_generated/dataModel";
import type { UserProfile } from "./types";

const SESSION_KEY = "expensia-session";

export function loadSession(): UserProfile | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function saveSession(user: UserProfile) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function hasActiveSession() {
  return loadSession() !== null;
}

export function getDisplayName(user: UserProfile | null) {
  if (!user) return "there";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.email.split("@")[0] || "there";
}

export function getConvexUserId(user: UserProfile | null): Id<"users"> | null {
  if (!user?.convexId) return null;
  return user.convexId;
}
