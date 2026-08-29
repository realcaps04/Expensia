import { Bell, Search } from "lucide-react";
import { useAuth } from "../../context/AuthProvider";
import { getDisplayName } from "../../lib/session";
import { getGreeting } from "../../lib/format";

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

  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={firstName} picture={user?.picture} />
        <div className="min-w-0">
          <p className="text-[0.8125rem] text-ink-secondary">{getGreeting()},</p>
          <p className="truncate font-display text-[1.125rem] font-semibold text-ink">
            {firstName}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          aria-label="Search transactions"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-white text-ink-secondary shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-colors hover:text-ink"
        >
          <Search className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-white text-ink-secondary shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-colors hover:text-ink"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-teal-brand ring-2 ring-white" />
        </button>
      </div>
    </header>
  );
}
