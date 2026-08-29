const STORAGE_KEY = "expensia-password-reset";

export type PasswordResetSession = {
  email: string;
  expiresAt?: number;
  resetToken?: string;
};

export function savePasswordResetSession(session: PasswordResetSession) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadPasswordResetSession(): PasswordResetSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PasswordResetSession;
  } catch {
    return null;
  }
}

export function clearPasswordResetSession() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function getPasswordResetEmail(fallback?: string) {
  return loadPasswordResetSession()?.email ?? fallback ?? "";
}
