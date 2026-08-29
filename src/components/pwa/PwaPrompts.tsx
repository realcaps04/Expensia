import { Download, Share, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { UPDATE_DISMISS_SESSION_KEY } from "../../lib/app-updates";
import {
  INSTALL_DISMISS_KEY,
  isIosSafari,
  isMobileDevice,
  isStandaloneApp,
} from "../../lib/pwa";
import { AppUpdatePrompt } from "./AppUpdatePrompt";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function scheduleUpdateChecks(registration: ServiceWorkerRegistration) {
  const check = () => {
    void registration.update();
  };

  check();
  window.setInterval(check, 60 * 60 * 1000);

  const onVisible = () => {
    if (document.visibilityState === "visible") {
      check();
    }
  };

  document.addEventListener("visibilitychange", onVisible);
  window.addEventListener("focus", check);

  return () => {
    document.removeEventListener("visibilitychange", onVisible);
    window.removeEventListener("focus", check);
  };
}

export function PwaPrompts() {
  const [installOpen, setInstallOpen] = useState(false);
  const [iosGuide, setIosGuide] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [updateOpen, setUpdateOpen] = useState(false);
  const iosTimerRef = useRef<number | null>(null);
  const cleanupChecksRef = useRef<(() => void) | null>(null);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      cleanupChecksRef.current?.();
      if (!registration) return;
      cleanupChecksRef.current = scheduleUpdateChecks(registration);
    },
    onNeedRefresh() {
      if (sessionStorage.getItem(UPDATE_DISMISS_SESSION_KEY)) return;
      setUpdateOpen(true);
    },
  });

  useEffect(() => {
    if (needRefresh && !sessionStorage.getItem(UPDATE_DISMISS_SESSION_KEY)) {
      setUpdateOpen(true);
    }
  }, [needRefresh]);

  useEffect(() => {
    return () => {
      cleanupChecksRef.current?.();
    };
  }, []);

  useEffect(() => {
    if (isStandaloneApp() || !isMobileDevice()) return;
    if (localStorage.getItem(INSTALL_DISMISS_KEY)) return;

    const onInstallPrompt = (event: Event) => {
      event.preventDefault();
      if (iosTimerRef.current !== null) {
        window.clearTimeout(iosTimerRef.current);
        iosTimerRef.current = null;
      }
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setInstallOpen(true);
      setIosGuide(false);
    };

    window.addEventListener("beforeinstallprompt", onInstallPrompt);

    iosTimerRef.current = window.setTimeout(() => {
      if (isIosSafari() && !isStandaloneApp() && !localStorage.getItem(INSTALL_DISMISS_KEY)) {
        setIosGuide(true);
        setInstallOpen(true);
      }
    }, 2500);

    return () => {
      window.removeEventListener("beforeinstallprompt", onInstallPrompt);
      if (iosTimerRef.current !== null) {
        window.clearTimeout(iosTimerRef.current);
      }
    };
  }, []);

  const dismissInstall = () => {
    setInstallOpen(false);
    localStorage.setItem(INSTALL_DISMISS_KEY, "1");
  };

  const installApp = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismissInstall();
  };

  const dismissUpdate = () => {
    setUpdateOpen(false);
    setNeedRefresh(false);
    sessionStorage.setItem(UPDATE_DISMISS_SESSION_KEY, "1");
  };

  const applyUpdate = async () => {
    sessionStorage.removeItem(UPDATE_DISMISS_SESSION_KEY);
    await updateServiceWorker(true);
  };

  return (
    <>
      <AppUpdatePrompt
        open={updateOpen && needRefresh}
        onDismiss={dismissUpdate}
        onUpdate={applyUpdate}
      />

      {installOpen && !isStandaloneApp() ? (
        <div className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div
            role="dialog"
            aria-labelledby="install-title"
            className="relative mx-auto max-w-shell rounded-[20px] border border-surface-border bg-white p-4 shadow-soft"
          >
            <button
              type="button"
              aria-label="Dismiss install prompt"
              onClick={dismissInstall}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-slate-100 hover:text-ink-secondary"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3 pr-8">
              {iosGuide ? (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-teal-brand">
                  <Share className="h-5 w-5" />
                </span>
              ) : (
                <img src="/logo.png" alt="" className="h-11 w-11 shrink-0 object-contain" />
              )}
              <div className="min-w-0 flex-1">
                <p id="install-title" className="font-display font-semibold text-ink">
                  Install Expensia
                </p>
                <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-secondary">
                  {iosGuide
                    ? "Add Expensia to your Home Screen: tap Share, then Add to Home Screen."
                    : "Install Expensia on your phone for quick access and an app-like experience."}
                </p>
                {iosGuide ? (
                  <button
                    type="button"
                    onClick={dismissInstall}
                    className="mt-3 rounded-[12px] border border-surface-border px-4 py-2.5 text-sm font-semibold text-ink-secondary transition-colors hover:bg-slate-50"
                  >
                    Got it
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void installApp()}
                    className="gradient-btn mt-3 inline-flex items-center gap-2 rounded-[12px] px-4 py-2.5 text-sm font-semibold text-white shadow-btn"
                  >
                    <Download className="h-4 w-4" />
                    Install app
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
