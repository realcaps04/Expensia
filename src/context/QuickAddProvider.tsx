import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { AddActionMenuSheet } from "../components/sheets/AddActionMenuSheet";
import { AddCreditSheet } from "../components/sheets/AddCreditSheet";
import { AddTransactionSheet } from "../components/sheets/AddTransactionSheet";
import { useAuth } from "./AuthProvider";
import type { QuickActionSheet } from "../lib/quick-actions";
import { getConvexUserId } from "../lib/session";

type QuickAddContextValue = {
  openMenu: () => void;
  openSheet: (sheet: QuickActionSheet) => void;
};

const QuickAddContext = createContext<QuickAddContextValue | null>(null);

export function QuickAddProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = getConvexUserId(user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState<QuickActionSheet | null>(null);

  const value = useMemo(
    () => ({
      openMenu: () => setMenuOpen(true),
      openSheet: (sheet: QuickActionSheet) => {
        setMenuOpen(false);
        setActiveSheet(sheet);
      },
    }),
    [],
  );

  const closeSheet = () => setActiveSheet(null);

  return (
    <QuickAddContext.Provider value={value}>
      {children}
      <AddActionMenuSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSelect={value.openSheet}
      />
      <AddTransactionSheet
        open={activeSheet === "income"}
        onClose={closeSheet}
        userId={userId}
        variant="income"
      />
      <AddTransactionSheet
        open={activeSheet === "expense"}
        onClose={closeSheet}
        userId={userId}
        variant="expense"
      />
      <AddCreditSheet open={activeSheet === "credit"} onClose={closeSheet} userId={userId} />
    </QuickAddContext.Provider>
  );
}

export function useQuickAdd() {
  const ctx = useContext(QuickAddContext);
  if (!ctx) {
    throw new Error("useQuickAdd must be used within QuickAddProvider");
  }
  return ctx;
}
