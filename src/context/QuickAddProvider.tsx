import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { AddActionMenuSheet } from "../components/sheets/AddActionMenuSheet";
import { AddCreditSheet } from "../components/sheets/AddCreditSheet";
import { AddTransactionSheet } from "../components/sheets/AddTransactionSheet";
import { useAuth } from "./AuthProvider";
import type { QuickActionSheet } from "../lib/quick-actions";
import { getConvexUserId } from "../lib/session";
import type { Id } from "../../convex/_generated/dataModel";

export type QuickAddSheetOptions = {
  eventId?: Id<"events">;
};

type QuickAddContextValue = {
  openMenu: () => void;
  openSheet: (sheet: QuickActionSheet, options?: QuickAddSheetOptions) => void;
};

const QuickAddContext = createContext<QuickAddContextValue | null>(null);

export function QuickAddProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = getConvexUserId(user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState<QuickActionSheet | null>(null);
  const [sheetOptions, setSheetOptions] = useState<QuickAddSheetOptions>({});

  const value = useMemo(
    () => ({
      openMenu: () => setMenuOpen(true),
      openSheet: (sheet: QuickActionSheet, options?: QuickAddSheetOptions) => {
        setMenuOpen(false);
        setSheetOptions(options ?? {});
        setActiveSheet(sheet);
      },
    }),
    [],
  );

  const closeSheet = () => {
    setActiveSheet(null);
    setSheetOptions({});
  };

  const defaultEventId = sheetOptions.eventId;

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
        defaultEventId={defaultEventId}
      />
      <AddTransactionSheet
        open={activeSheet === "expense"}
        onClose={closeSheet}
        userId={userId}
        variant="expense"
        defaultEventId={defaultEventId}
      />
      <AddCreditSheet
        open={activeSheet === "credit"}
        onClose={closeSheet}
        userId={userId}
        defaultEventId={defaultEventId}
      />
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
