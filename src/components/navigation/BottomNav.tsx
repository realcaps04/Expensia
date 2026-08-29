import { Home, List, PieChart, Plus, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const LEFT_NAV = [
  { to: "/home", label: "Home", icon: Home, end: true },
  { to: "/home/activity", label: "Activity", icon: List, end: false },
] as const;

const RIGHT_NAV = [
  { to: "/home/insights", label: "Insights", icon: PieChart, end: false },
  { to: "/home/profile", label: "Profile", icon: User, end: false },
] as const;

function NavItem({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  end: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-col items-center gap-1 py-2 text-[0.6875rem] font-medium transition-colors ${
          isActive ? "text-teal-brand" : "text-ink-muted"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.25 : 1.75} />
          {label}
        </>
      )}
    </NavLink>
  );
}

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 w-full max-w-shell -translate-x-1/2 border-t border-surface-border bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md"
      aria-label="Main navigation"
    >
      <div className="relative grid grid-cols-5 items-end">
        {LEFT_NAV.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        <div className="flex justify-center pb-1">
          <button
            type="button"
            aria-label="Add transaction"
            className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-teal-brand text-white shadow-[0_8px_24px_rgba(20,184,166,0.45)] transition-transform active:scale-95"
          >
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </button>
        </div>

        {RIGHT_NAV.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </div>
    </nav>
  );
}
