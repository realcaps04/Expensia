import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";
import type { TransactionRowData } from "../lib/transaction-types";
import { AddTransactionSheet } from "../components/sheets/AddTransactionSheet";
import {
  groupTransactionsByDate,
  TransactionListItem,
} from "../components/transactions/TransactionListItem";
import { useAuth } from "../context/AuthProvider";
import { mapTransactionRow } from "../lib/convex-mappers";
import { formatActivityDateHeader } from "../lib/datetime";
import { getConvexUserId } from "../lib/session";

export function ActivityScreen() {
  const { user } = useAuth();
  const userId = getConvexUserId(user);
  const [editingTransaction, setEditingTransaction] = useState<TransactionRowData | null>(null);

  const transactions = useQuery(api.transactions.listAll, userId ? { userId } : "skip");
  const removeTx = useMutation(api.transactions.remove);

  const rows = (transactions ?? []).map(mapTransactionRow);
  const groups = groupTransactionsByDate(rows);
  const isLoading = userId !== null && transactions === undefined;

  const handleDelete = async (tx: TransactionRowData) => {
    if (!userId) return;
    if (!window.confirm(`Delete "${tx.title}"? This cannot be undone.`)) return;

    try {
      await removeTx({
        userId,
        transactionId: tx.id as Id<"transactions">,
      });
      if (editingTransaction?.id === tx.id) {
        setEditingTransaction(null);
      }
    } catch {
      window.alert("Could not delete this transaction.");
    }
  };

  return (
    <>
      <div className="px-5 pb-6 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex max-w-[390px] flex-col gap-5">
          <div>
            <h1 className="font-display text-[1.375rem] font-bold text-ink">Activity</h1>
            <p className="mt-1 text-[0.8125rem] text-ink-secondary">
              All your income and expense transactions
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-card bg-white/80 shadow-soft" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-card bg-white px-4 py-12 text-center shadow-soft">
              <p className="text-sm font-medium text-ink">No transactions yet</p>
              <p className="mt-1 text-[0.8125rem] text-ink-secondary">
                Add income or expenses from Home to see your activity here.
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <section key={group.key}>
                <h2 className="mb-2 px-1 text-[0.8125rem] font-semibold text-ink-secondary">
                  {formatActivityDateHeader(group.occurredAt)}
                </h2>
                <div className="rounded-card bg-white px-3 py-1 shadow-soft">
                  {group.items.map((tx) => (
                    <TransactionListItem
                      key={tx.id}
                      tx={tx}
                      showActions
                      onEdit={setEditingTransaction}
                      onDelete={handleDelete}
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
    </>
  );
}
