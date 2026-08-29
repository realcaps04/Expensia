import { Bell, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import { useCloseOnBack } from "../../hooks/useCloseOnBack";
import { getDisplayName } from "../../lib/session";

function Avatar({ name, picture }: { name: string; picture?: string }) {
  if (picture) {
    return (
      <img
        src={picture}
        alt=""
        className="h-11 w-11 rounded-full border-2 border-white object-cover shadow-soft"
      />
    );
  }

  const initial = name.charAt(0).toUpperCase() || "U";
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-teal-brand to-violet-brand text-sm font-semibold text-white shadow-soft">
      {initial}
    </div>
  );
}

export function HomeHeader() {
  const { user } = useAuth();
  const firstName = user ? getDisplayName(user).split(" ")[0] : "there";
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useCloseOnBack(notificationsOpen, () => setNotificationsOpen(false));

  useEffect(() => {
    if (!notificationsOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!notificationsRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNotificationsOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [notificationsOpen]);

  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center">
        <Avatar name={firstName} picture={user?.picture} />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          aria-label="Search transactions"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-white text-ink-secondary shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-colors hover:text-ink"
        >
          <Search className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>
        <div ref={notificationsRef} className="relative">
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
            aria-haspopup="dialog"
            onClick={() => setNotificationsOpen((open) => !open)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-white text-ink-secondary shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-colors hover:text-ink"
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-teal-brand ring-2 ring-white" />
          </button>
          {notificationsOpen ? (
            <div
              role="dialog"
              aria-label="Notifications"
              className="absolute right-0 top-[calc(100%+0.5rem)] z-20 w-[min(16rem,calc(100vw-2.5rem))] rounded-[16px] border border-surface-border bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.14)]"
            >
              <p className="text-[0.8125rem] font-semibold text-ink">Notifications</p>
              <p className="mt-1.5 text-[0.75rem] leading-relaxed text-ink-secondary">
                The app is in its early stages. Bug fixes are ongoing — please hold on!
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
