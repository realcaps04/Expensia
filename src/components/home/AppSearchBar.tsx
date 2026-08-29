import { useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "../../context/AuthProvider";
import { useCloseOnBack } from "../../hooks/useCloseOnBack";
import { searchAppItems } from "../../lib/app-search";
import type { CreditActivityRowData } from "../../lib/activity-types";
import { mapCreditActivityRow, mapTransactionRow } from "../../lib/convex-mappers";
import { formatCompactDate } from "../../lib/datetime";
import { formatCurrency } from "../../lib/format";
import { getConvexUserId } from "../../lib/session";
import type { TransactionRowData } from "../../lib/transaction-types";

type AppSearchBarProps = {
  onSelectTransaction?: (tx: TransactionRowData) => void;
  onSelectCredit?: (credit: CreditActivityRowData) => void;
};

export function AppSearchBar({ onSelectTransaction, onSelectCredit }: AppSearchBarProps) {
  const { user } = useAuth();
  const userId = getConvexUserId(user);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useCloseOnBack(open, () => closeSearch());

  const transactions = useQuery(
    api.transactions.listAll,
    userId && open ? { userId } : "skip",
  );
  const credits = useQuery(api.credits.list, userId && open ? { userId } : "skip");

  const transactionRows = useMemo(
    () => (transactions ?? []).map(mapTransactionRow),
    [transactions],
  );
  const creditRows = useMemo(
    () => (credits ?? []).map(mapCreditActivityRow),
    [credits],
  );

  const results = useMemo(
    () => searchAppItems(query, transactionRows, creditRows),
    [query, transactionRows, creditRows],
  );

  const showResults = open && query.trim().length > 0;
  const isLoading = open && userId !== null && (transactions === undefined || credits === undefined);

  function closeSearch() {
    setOpen(false);
    setQuery("");
  }

  function openSearch() {
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        closeSearch();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSearch();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleSelect = (result: (typeof results)[number]) => {
    if (result.kind === "transaction") {
      onSelectTransaction?.(result.data);
    } else {
      onSelectCredit?.(result.data);
    }
    closeSearch();
  };

  return (
    <div ref={containerRef} className="relative flex min-w-0 flex-1 items-center justify-end gap-2">
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="search-field"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            className="relative min-w-0 flex-1 overflow-hidden"
          >
            <div className="flex h-10 items-center rounded-full border border-surface-border bg-white pl-3 pr-2 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <Search className="h-4 w-4 shrink-0 text-ink-muted" strokeWidth={2} />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search transactions, credits…"
                aria-label="Search app"
                className="min-w-0 flex-1 bg-transparent px-2 text-[0.8125rem] text-ink placeholder:text-ink-muted/70 focus:outline-none"
              />
              {query ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-slate-100 hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2.5} />
                </button>
              ) : null}
            </div>

            {showResults ? (
              <div className="absolute right-0 top-[calc(100%+0.5rem)] z-30 w-[min(22rem,calc(100vw-2.5rem))] overflow-hidden rounded-[16px] border border-surface-border bg-white shadow-[0_12px_40px_rgba(15,23,42,0.14)]">
                {isLoading ? (
                  <p className="px-4 py-3 text-[0.8125rem] text-ink-muted">Searching…</p>
                ) : results.length === 0 ? (
                  <p className="px-4 py-3 text-[0.8125rem] text-ink-muted">No results found.</p>
                ) : (
                  <ul className="max-h-[min(18rem,50dvh)] overflow-y-auto py-1">
                    {results.map((result) => {
                      const key =
                        result.kind === "transaction" ? `tx-${result.data.id}` : `cr-${result.data.id}`;
                      const title =
                        result.kind === "transaction" ? result.data.title : result.data.name;
                      const meta =
                        result.kind === "transaction"
                          ? `${result.data.category} • ${formatCompactDate(result.data.occurredAt)}`
                          : `${result.data.typeLabel} • ${formatCompactDate(result.data.occurredAt)}`;
                      const amount =
                        result.kind === "transaction"
                          ? formatCurrency(
                              result.data.type === "income"
                                ? result.data.amount
                                : -result.data.amount,
                              { signed: true },
                            )
                          : formatCurrency(-result.data.balance, { signed: true });

                      return (
                        <li key={key}>
                          <button
                            type="button"
                            onClick={() => handleSelect(result)}
                            className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[0.8125rem] font-semibold text-ink">{title}</p>
                              <p className="truncate text-[0.75rem] text-ink-muted">{meta}</p>
                            </div>
                            <span
                              className={`shrink-0 text-[0.8125rem] font-semibold ${
                                result.kind === "transaction" && result.data.type === "income"
                                  ? "text-income"
                                  : "text-expense"
                              }`}
                            >
                              {amount}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        aria-label={open ? "Close search" : "Search"}
        aria-expanded={open}
        onClick={() => (open ? closeSearch() : openSearch())}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-surface-border bg-white text-ink-secondary shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-colors hover:text-ink"
      >
        <Search className="h-[18px] w-[18px]" strokeWidth={2} />
      </button>
    </div>
  );
}
