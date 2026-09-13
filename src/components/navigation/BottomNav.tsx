import { LayoutGroup, motion } from "framer-motion";
import { Activity, Home, PieChart, Plus, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const LEFT_NAV = [
  { to: "/home", label: "Home", icon: Home, end: true, id: "home" },
  { to: "/home/activity", label: "Activity", icon: Activity, end: false, id: "activity" },
] as const;

const RIGHT_NAV = [
  { to: "/home/insights", label: "Insights", icon: PieChart, end: false, id: "insights" },
  { to: "/home/profile", label: "Profile", icon: User, end: false, id: "profile" },
] as const;

function NavItem({
  to,
  label,
  icon: Icon,
  end,
  id,
}: {
  to: string;
  label: string;
  icon: typeof Home;
  end: boolean;
  id: string;
}) {
  const location = useLocation();
  const isProfile = id === "profile";
  const forceActive =
    isProfile &&
    (location.pathname === "/home/profile" || location.pathname.startsWith("/home/profile/"));

  return (
    <NavLink
      to={to}
      end={end}
      aria-label={label}
      className={({ isActive }) => {
        const active = forceActive || isActive;
        return `relative z-10 flex h-full items-center justify-center no-underline ${
          active ? "text-white" : "text-ink-muted"
        }`;
      }}
    >
      {({ isActive }) => {
        const active = forceActive || isActive;
        return (
          <>
            {active ? (
              <motion.span
                layoutId="bottom-nav-glass"
                className="absolute inset-x-1 inset-y-1 rounded-full bg-[#E87820] shadow-[0_4px_14px_rgba(232,120,32,0.4)]"
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
              />
            ) : null}
            <motion.span
              animate={{ scale: active ? 1.08 : 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className="relative z-10 flex items-center justify-center"
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.35 : 1.9} />
            </motion.span>
          </>
        );
      }}
    </NavLink>
  );
}

export function BottomNav({ onAddClick }: { onAddClick: () => void }) {
  return (
    <nav
      className="pointer-events-none fixed bottom-[max(2rem,calc(env(safe-area-inset-bottom)+1.25rem))] left-1/2 z-50 w-[calc(100%-2rem)] max-w-[calc(430px-2rem)] -translate-x-1/2"
      aria-label="Main navigation"
    >
      <div className="pointer-events-auto relative pt-3.5">
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2">
          <motion.button
            type="button"
            aria-label="Quick add"
            onClick={onAddClick}
            whileTap={{ scale: 0.94 }}
            className="flex h-[3.25rem] w-[3.25rem] items-center justify-center rounded-full bg-gradient-to-b from-[#E87820] to-[#C45E12] text-white shadow-[0_10px_28px_rgba(232,120,32,0.42)]"
          >
            <Plus className="h-6 w-6" strokeWidth={2.5} />
          </motion.button>
        </div>

        <div className="relative h-[3.5rem] overflow-hidden rounded-full border border-white/50 bg-white/20 shadow-[0_8px_32px_rgba(15,23,42,0.1)] backdrop-blur-xl backdrop-saturate-150 dark:border-white/25 dark:bg-white/[0.06] dark:shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-transparent dark:from-white/[0.08]"
            aria-hidden
          />
          <LayoutGroup id="bottom-nav">
            <div className="relative grid h-full grid-cols-5 items-stretch px-2 py-0.5">
              {LEFT_NAV.map((item) => (
                <NavItem key={item.to} {...item} />
              ))}

              <div aria-hidden />

              {RIGHT_NAV.map((item) => (
                <NavItem key={item.to} {...item} />
              ))}
            </div>
          </LayoutGroup>
        </div>
      </div>
    </nav>
  );
}
