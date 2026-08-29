import { Outlet } from "react-router-dom";
import { BottomNav } from "../navigation/BottomNav";

export function MainShell() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#F4F6F8]">
      <main className="flex-1 overflow-y-auto pb-[calc(5.75rem+env(safe-area-inset-bottom))]">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
