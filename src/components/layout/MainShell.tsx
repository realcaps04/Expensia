import { Outlet } from "react-router-dom";
import { BottomNav } from "../navigation/BottomNav";
import { QuickAddProvider, useQuickAdd } from "../../context/QuickAddProvider";

function MainShellContent() {
  const { openMenu } = useQuickAdd();

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F4F6F8]">
      <main className="min-h-0 flex-1 overflow-y-auto pb-[calc(7.5rem+env(safe-area-inset-bottom))]">
        <Outlet />
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
