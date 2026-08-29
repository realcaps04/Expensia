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

export function BottomNav({ onAddClick }: { onAddClick: () => void }) {
  return (
    <nav
      className="pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-50 w-[calc(100%-2rem)] max-w-[calc(430px-2rem)] -translate-x-1/2"
      aria-label="Main navigation"
    >
      <div className="pointer-events-auto relative pt-7">
        <button
          type="button"
          aria-label="Quick add"
          onClick={onAddClick}
          className="absolute left-1/2 top-0 z-10 flex h-[3.75rem] w-[3.75rem] -translate-x-1/2 items-center justify-center rounded-full bg-gradient-to-b from-teal-brand to-teal-deep text-white shadow-[0_10px_28px_rgba(20,184,166,0.42)] transition-transform active:scale-95"
        >
          <Plus className="h-7 w-7" strokeWidth={2.5} />
        </button>

        <div className="relative h-[4.75rem] overflow-hidden rounded-[28px] border border-white/70 bg-white/50 shadow-[0_12px_40px_rgba(15,23,42,0.12)] backdrop-blur-2xl backdrop-saturate-150">
          <div className="relative grid h-full grid-cols-5 items-end px-3 pb-1.5 pt-3">
            {LEFT_NAV.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}

            <div aria-hidden />

            {RIGHT_NAV.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
