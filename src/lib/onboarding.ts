import { hasActiveSession } from "./session";

const WELCOME_KEY = "expensia-welcome-seen";

export function hasSeenWelcome() {
  return localStorage.getItem(WELCOME_KEY) === "1";
}

export function markWelcomeSeen() {
  localStorage.setItem(WELCOME_KEY, "1");
}

export function getInitialRoute() {
  if (!hasSeenWelcome()) return "/";
  if (hasActiveSession()) return "/home";
  return "/login";
}
