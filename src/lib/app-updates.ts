/** Shown in the in-app update popup when a new version is ready. */
export const APP_VERSION = "1.0.0";

export const LATEST_UPDATES = [
  "Credit & loans in Insights spending overview",
  "Edit transactions from Recent Transactions",
  "Add income, expense & credit from quick actions",
  "Frosted glass bottom navigation",
] as const;

/** Session key — stores the script URL of the update the user dismissed. */
export const UPDATE_DISMISS_WORKER_KEY = "expensia-update-dismissed-worker";

export function getDismissedUpdateWorker() {
  try {
    return sessionStorage.getItem(UPDATE_DISMISS_WORKER_KEY);
  } catch {
    return null;
  }
}

export function setDismissedUpdateWorker(scriptUrl: string) {
  try {
    sessionStorage.setItem(UPDATE_DISMISS_WORKER_KEY, scriptUrl);
  } catch {
    // ignore storage failures
  }
}

export function clearDismissedUpdateWorker() {
  try {
    sessionStorage.removeItem(UPDATE_DISMISS_WORKER_KEY);
  } catch {
    // ignore storage failures
  }
}

export function waitingWorkerScriptUrl(registration: ServiceWorkerRegistration | null | undefined) {
  return registration?.waiting?.scriptURL ?? null;
}

export function shouldPromptForUpdate(registration: ServiceWorkerRegistration | null | undefined) {
  const waitingUrl = waitingWorkerScriptUrl(registration);
  if (!waitingUrl) return false;
  return getDismissedUpdateWorker() !== waitingUrl;
}

/** Poll interval while the app tab is visible (ms). */
export const UPDATE_CHECK_INTERVAL_MS = import.meta.env.DEV ? 30_000 : 3 * 60_000;
