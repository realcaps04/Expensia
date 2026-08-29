export function isStandaloneApp() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isMobileDevice() {
  return (
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (window.matchMedia("(max-width: 768px)").matches && "ontouchstart" in window)
  );
}

export function isIosSafari() {
  return (
    /iPhone|iPad|iPod/i.test(navigator.userAgent) &&
    !(window as Window & { MSStream?: unknown }).MSStream
  );
}

export const INSTALL_DISMISS_KEY = "expensia-install-dismissed";
