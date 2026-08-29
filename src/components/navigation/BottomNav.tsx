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

/** White bar with rounded corners and a center semicircular notch for the FAB. */
function NavBarCurve() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 top-0 h-[4.25rem] w-full"
      viewBox="0 0 390 68"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <filter id="navShadow" x="-20%" y="-40%" width="140%" height="180%">
          <feDropShadow dx="0" dy="-2" stdDeviation="8" floodColor="#0F172A" floodOpacity="0.07" />
        </filter>
      </defs>
      <path
        filter="url(#navShadow)"
        fill="#FFFFFF"
        d="
          M 0 18
          Q 0 0 18 0
          L 156 0
          A 34 34 0 0 1 234 0
          L 372 0
          Q 390 0 390 18
          L 390 68
          L 0 68
          Z
        "
      />
    </svg>
  );
}

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
        `flex flex-col items-center justify-end gap-1 pb-0.5 text-[0.6875rem] font-medium transition-colors ${
          isActive ? "text-teal-brand" : "text-ink-muted"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.25 : 1.85} />
          {label}
        </>
      )}
    </NavLink>
  );
}

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 w-full max-w-shell -translate-x-1/2 pb-[max(0.625rem,env(safe-area-inset-bottom))]"
      aria-label="Main navigation"
    >
      <div className="relative h-[4.75rem]">
        <NavBarCurve />

        <div className="relative grid h-full grid-cols-5 items-end px-3 pt-3">
          {LEFT_NAV.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}

          <div className="relative flex justify-center">
            <button
              type="button"
              aria-label="Add transaction"
              className="absolute -top-7 flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-full bg-gradient-to-b from-teal-brand to-teal-deep text-white shadow-[0_10px_28px_rgba(20,184,166,0.42)] transition-transform active:scale-95"
            >
              <Plus className="h-7 w-7" strokeWidth={2.5} />
            </button>
          </div>

          {RIGHT_NAV.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>
      </div>
    </nav>
  );
}
