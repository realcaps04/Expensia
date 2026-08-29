import { Download, RefreshCw, Share, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import {
  INSTALL_DISMISS_KEY,
  isIosSafari,
  isMobileDevice,
  isStandaloneApp,
} from "../../lib/pwa";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaPrompts() {
  const [installOpen, setInstallOpen] = useState(false);
  const [iosGuide, setIosGuide] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const iosTimerRef = useRef<number | null>(null);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      registration.update();
      window.setInterval(() => registration.update(), 60 * 60 * 1000);
    },
  });

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

  return (
    <>
      {needRefresh ? (
        <div className="fixed inset-x-0 top-0 z-[60] px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="mx-auto flex max-w-shell items-center justify-between gap-3 rounded-[16px] bg-white px-4 py-3 shadow-soft">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-teal-brand">
                <RefreshCw className="h-4 w-4" />
              </span>
              <p className="text-sm text-ink-secondary">A new version of Expensia is ready.</p>
            </div>
            <button
              type="button"
              onClick={() => setNeedRefresh(false)}
              className="shrink-0 rounded-[12px] border border-surface-border px-3 py-2 text-sm font-semibold text-ink-secondary"
            >
              Later
            </button>
            <button
              type="button"
              onClick={() => void updateServiceWorker(true)}
              className="shrink-0 rounded-[12px] bg-teal-brand px-3 py-2 text-sm font-semibold text-white"
            >
              Update
            </button>
          </div>
        </div>
      ) : null}

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
