import { Calculator } from "lucide-react";
import { useState } from "react";
import { useAvatarSrc } from "../../lib/avatar";
import { getDisplayName } from "../../lib/session";
import { useAuth } from "../../context/AuthProvider";
import type { CreditActivityRowData } from "../../lib/activity-types";
import type { TransactionRowData } from "../../lib/transaction-types";
import { AppSearchBar } from "./AppSearchBar";
import { CalculatorSheet } from "./CalculatorSheet";

function Avatar({ name, picture }: { name: string; picture?: string }) {
  const { src, onError } = useAvatarSrc(picture);
  const initial = name.charAt(0).toUpperCase() || "U";

  if (src) {
    return (
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        onError={onError}
        className="h-11 w-11 rounded-full border-2 border-white object-cover shadow-soft"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-teal-brand to-violet-brand text-sm font-semibold text-white shadow-soft">
      {initial}
    </div>
  );
}

export function HomeHeader({
  onSelectTransaction,
  onSelectCredit,
}: {
  onSelectTransaction?: (tx: TransactionRowData) => void;
  onSelectCredit?: (credit: CreditActivityRowData) => void;
}) {
  const { user } = useAuth();
  const firstName = user ? getDisplayName(user).split(" ")[0] : "there";
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center">
          <Avatar name={firstName} picture={user?.picture} />
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <AppSearchBar
            onSelectTransaction={onSelectTransaction}
            onSelectCredit={onSelectCredit}
          />
          <button
            type="button"
            aria-label="Open calculator"
            onClick={() => setCalculatorOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-surface-border bg-white text-ink-secondary shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-colors hover:text-ink"
          >
            <Calculator className="h-[18px] w-[18px]" strokeWidth={2} />
          </button>
        </div>
      </header>

      <CalculatorSheet open={calculatorOpen} onClose={() => setCalculatorOpen(false)} />
    </>
  );
}
