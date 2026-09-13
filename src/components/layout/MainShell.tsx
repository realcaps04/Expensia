import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AuthBackground } from "../brand/AuthBackground";
import { BottomNav } from "../navigation/BottomNav";
import { QuickAddProvider, useQuickAdd } from "../../context/QuickAddProvider";

function tabIndexFromPath(pathname: string) {
  if (pathname.startsWith("/home/profile")) return 3;
  if (pathname.startsWith("/home/insights")) return 2;
  if (pathname.startsWith("/home/activity")) return 1;
  if (pathname === "/home" || pathname === "/home/") return 0;
  if (pathname.startsWith("/home/events") || pathname.startsWith("/home/purchases")) return 1;
  return 0;
}

function routeKeyFromPath(pathname: string) {
  if (pathname.startsWith("/home/profile")) return "profile";
  if (pathname.startsWith("/home/insights")) return "insights";
  if (pathname.startsWith("/home/activity")) return "activity";
  if (pathname.startsWith("/home/events")) return "events";
  if (pathname.startsWith("/home/purchases")) return "purchases";
  return "home";
}

function MainShellContent() {
  const { openMenu } = useQuickAdd();
  const location = useLocation();
  const routeKey = routeKeyFromPath(location.pathname);
  const tabIndex = tabIndexFromPath(location.pathname);
  const prevTabIndex = useRef(tabIndex);
  const directionRef = useRef(1);

  if (tabIndex !== prevTabIndex.current) {
    directionRef.current = tabIndex >= prevTabIndex.current ? 1 : -1;
    prevTabIndex.current = tabIndex;
  }

  const direction = directionRef.current;

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-surface">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <AuthBackground />
      </div>
      <main className="relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={routeKey}
            initial={{ opacity: 0, x: direction * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -22 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav onAddClick={openMenu} />
    </div>
  );
}

export function MainShell() {
  return (
    <QuickAddProvider>
      <MainShellContent />
    </QuickAddProvider>
  );
}
