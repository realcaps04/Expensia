import { useMutation, useQuery } from "convex/react";
import { useMemo, useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";
import { ActivityFilterBar } from "../components/activity/ActivityFilterBar";
import { ActivityListItem } from "../components/activity/ActivityListItem";
import { AddTransactionSheet } from "../components/sheets/AddTransactionSheet";
import { ConfirmSheet, deleteItemMessage } from "../components/sheets/ConfirmSheet";
import { useAuth } from "../context/AuthProvider";
import {
  DEFAULT_ACTIVITY_FILTERS,
  filterActivityItems,
  getAvailableCategories,
  getAvailableMonths,
  groupActivityItems,
} from "../lib/activity-filters";
import { activityTimestamp } from "../lib/activity-types";
import type { CreditActivityRowData } from "../lib/activity-types";
import { mapCreditActivityRow, mapTransactionRow } from "../lib/convex-mappers";
import { formatActivityDateHeader, formatMonthHeader } from "../lib/datetime";
import { formatCurrency } from "../lib/format";
import { getConvexUserId } from "../lib/session";
import type { TransactionRowData } from "../lib/transaction-types";

function groupHeading(
  groupBy: typeof DEFAULT_ACTIVITY_FILTERS.groupBy,
  group: ReturnType<typeof groupActivityItems>[number],
) {
  if (groupBy === "month") return formatMonthHeader(group.key);
  if (groupBy === "date") return formatActivityDateHeader(activityTimestamp(group.items[0]!));
  return group.label;
}

export function ActivityScreen() {
  const { user } = useAuth();
  const userId = getConvexUserId(user);
  const [editingTransaction, setEditingTransaction] = useState<TransactionRowData | null>(null);
  const [filters, setFilters] = useState(DEFAULT_ACTIVITY_FILTERS);
  const [deleteTarget, setDeleteTarget] = useState<
    | { kind: "transaction"; item: TransactionRowData }
    | { kind: "credit"; item: CreditActivityRowData }
    | null
  >(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const transactions = useQuery(api.transactions.listAll, userId ? { userId } : "skip");
  const credits = useQuery(api.credits.list, userId ? { userId } : "skip");
  const removeTx = useMutation(api.transactions.remove);
  const removeCredit = useMutation(api.credits.remove);

  const allItems = useMemo(() => {
    const txItems = (transactions ?? []).map((tx) => ({
      kind: "transaction" as const,
      data: mapTransactionRow(tx),
    }));
    const creditItems = (credits ?? []).map((credit) => ({
      kind: "credit" as const,
      data: mapCreditActivityRow(credit),
    }));
    return [...txItems, ...creditItems].sort(
      (a, b) => activityTimestamp(b) - activityTimestamp(a),
    );
  }, [transactions, credits]);

  const filteredItems = useMemo(
    () => filterActivityItems(allItems, filters),
    [allItems, filters],
  );

  const groups = useMemo(
    () => groupActivityItems(filteredItems, filters.groupBy),
    [filteredItems, filters.groupBy],
  );

  const months = useMemo(() => getAvailableMonths(allItems), [allItems]);
  const categories = useMemo(() => getAvailableCategories(allItems), [allItems]);
  const isLoading =
    userId !== null && (transactions === undefined || credits === undefined);

  const handleDeleteTransaction = (tx: TransactionRowData) => {
    setDeleteTarget({ kind: "transaction", item: tx });
  };

  const handleDeleteCredit = (credit: CreditActivityRowData) => {
    setDeleteTarget({ kind: "credit", item: credit });
  };

  const confirmDelete = async () => {
    if (!userId || !deleteTarget) return;

    setDeleteBusy(true);
    try {
      if (deleteTarget.kind === "transaction") {
        await removeTx({
          userId,
          transactionId: deleteTarget.item.id as Id<"transactions">,
        });
        if (editingTransaction?.id === deleteTarget.item.id) {
          setEditingTransaction(null);
        }
      } else {
        await removeCredit({
          userId,
          creditId: deleteTarget.item.id as Id<"credits">,
        });
      }
      setDeleteTarget(null);
    } catch {
      window.alert(
        deleteTarget.kind === "transaction"
          ? "Could not delete this transaction."
          : "Could not delete this credit account.",
      );
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <>
      <div className="px-5 pb-6 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex max-w-[390px] flex-col gap-5">
          <div>
            <h1 className="font-display text-[1.375rem] font-bold text-ink">Activity</h1>
            <p className="mt-1 text-[0.8125rem] text-ink-secondary">
              Browse and manage transactions and credit accounts
            </p>
          </div>

          {!isLoading && allItems.length > 0 ? (
            <ActivityFilterBar
              filters={filters}
              onChange={setFilters}
              months={months}
              categories={categories}
            />
          ) : null}

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-card bg-white/80 shadow-soft" />
              ))}
            </div>
          ) : allItems.length === 0 ? (
            <div className="rounded-card bg-white px-4 py-12 text-center shadow-soft">
              <p className="text-sm font-medium text-ink">No activity yet</p>
              <p className="mt-1 text-[0.8125rem] text-ink-secondary">
                Add income, expenses, or credit accounts from Home to see them here.
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-card bg-white px-4 py-12 text-center shadow-soft">
              <p className="text-sm font-medium text-ink">No matches</p>
              <p className="mt-1 text-[0.8125rem] text-ink-secondary">
                Try changing your filters to see more activity.
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <section key={group.key}>
                <div className="mb-2 flex items-center justify-between gap-3 px-1">
                  <h2 className="text-[0.8125rem] font-semibold text-ink-secondary">
                    {groupHeading(filters.groupBy, group)}
                  </h2>
                  <span
                    className={`text-[0.8125rem] font-semibold ${
                      group.total >= 0 ? "text-income" : "text-expense"
                    }`}
                  >
                    {formatCurrency(group.total, { signed: true })}
                  </span>
                </div>
                <div className="rounded-card bg-white px-3 py-1 shadow-soft">
                  {group.items.map((item) => (
                    <ActivityListItem
                      key={`${item.kind}-${item.data.id}`}
                      item={item}
                      showActions
                      onEditTransaction={setEditingTransaction}
                      onDeleteTransaction={handleDeleteTransaction}
                      onDeleteCredit={handleDeleteCredit}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>

      <AddTransactionSheet
        open={editingTransaction !== null}
        onClose={() => setEditingTransaction(null)}
        userId={userId}
        variant={editingTransaction?.type ?? "expense"}
        editTransaction={editingTransaction}
      />

      <ConfirmSheet
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete item?"
        message={
          deleteTarget
            ? deleteItemMessage(
                deleteTarget.kind === "transaction"
                  ? deleteTarget.item.title
                  : deleteTarget.item.name,
              )
            : ""
        }
        confirmLabel="Delete"
        busy={deleteBusy}
      />
    </>
  );
}
