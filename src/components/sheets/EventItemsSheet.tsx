import { useMutation, useQuery } from "convex/react";
import { useMemo, useState, type ReactNode } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { ActivityListItem } from "../activity/ActivityListItem";
import { useAuth } from "../../context/AuthProvider";
import type { CreditActivityRowData } from "../../lib/activity-types";
import { mapCreditActivityRow, mapTransactionRow } from "../../lib/convex-mappers";
import { formatCurrency } from "../../lib/format";
import { getConvexUserId } from "../../lib/session";
import type { TransactionRowData } from "../../lib/transaction-types";
import { AddCreditSheet } from "./AddCreditSheet";
import { AddTransactionSheet } from "./AddTransactionSheet";
import { BottomSheet } from "./BottomSheet";
import { ConfirmSheet, deleteItemMessage } from "./ConfirmSheet";

type EventItemsSheetProps = {
  open: boolean;
  onClose: () => void;
  eventId: Id<"events">;
  eventName: string;
};

function Section({
  title,
  total,
  tone,
  children,
}: {
  title: string;
  total: number;
  tone: "income" | "expense" | "credit";
  children: ReactNode;
}) {
  const totalClass =
    tone === "income" ? "text-income" : tone === "expense" ? "text-expense" : "text-credit";

  return (
    <section>
      <div className="mb-2 flex items-center justify-between gap-3 px-1">
        <h3 className="text-[0.8125rem] font-semibold text-ink-secondary">{title}</h3>
        <span className={`text-[0.8125rem] font-semibold ${totalClass}`}>
          {formatCurrency(total, { signed: true })}
        </span>
      </div>
      <div className="rounded-card bg-white px-3 py-1 shadow-soft">{children}</div>
    </section>
  );
}

export function EventItemsSheet({ open, onClose, eventId, eventName }: EventItemsSheetProps) {
  const { user } = useAuth();
  const userId = getConvexUserId(user);
  const transactions = useQuery(
    api.transactions.listAll,
    open && userId ? { userId } : "skip",
  );
  const creditRows = useQuery(api.credits.list, open && userId ? { userId } : "skip");
  const removeTx = useMutation(api.transactions.remove);
  const removeCredit = useMutation(api.credits.remove);

  const [editingTransaction, setEditingTransaction] = useState<TransactionRowData | null>(null);
  const [editingCredit, setEditingCredit] = useState<CreditActivityRowData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<
    | { kind: "transaction"; item: TransactionRowData }
    | { kind: "credit"; item: CreditActivityRowData }
    | null
  >(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const eventTransactions = useMemo(
    () => (transactions ?? []).filter((tx) => tx.eventId === eventId),
    [transactions, eventId],
  );
  const income = useMemo(
    () =>
      eventTransactions
        .filter((tx) => tx.type === "income")
        .sort((a, b) => b.occurredAt - a.occurredAt)
        .map(mapTransactionRow),
    [eventTransactions],
  );
  const expenses = useMemo(
    () =>
      eventTransactions
        .filter((tx) => tx.type === "expense")
        .sort((a, b) => b.occurredAt - a.occurredAt)
        .map(mapTransactionRow),
    [eventTransactions],
  );
  const credits = useMemo(
    () =>
      (creditRows ?? [])
        .filter((credit) => credit.eventId === eventId && !credit.isArchived)
        .sort((a, b) => (b.startDate ?? b.createdAt) - (a.startDate ?? a.createdAt))
        .map(mapCreditActivityRow),
    [creditRows, eventId],
  );

  const incomeTotal = income.reduce((sum, tx) => sum + tx.amount, 0);
  const expenseTotal = expenses.reduce((sum, tx) => sum + tx.amount, 0);
  const creditTotal = credits.reduce((sum, credit) => sum + credit.balance, 0);
  const isLoading = open && userId !== null && (transactions === undefined || creditRows === undefined);
  const isEmpty = !isLoading && income.length === 0 && expenses.length === 0 && credits.length === 0;

  const confirmDelete = async () => {
    if (!userId || !deleteTarget) return;
    setDeleteBusy(true);
    try {
      if (deleteTarget.kind === "transaction") {
        await removeTx({
          userId,
          transactionId: deleteTarget.item.id as Id<"transactions">,
        });
        if (editingTransaction?.id === deleteTarget.item.id) setEditingTransaction(null);
      } else {
        await removeCredit({
          userId,
          creditId: deleteTarget.item.id as Id<"credits">,
        });
        if (editingCredit?.id === deleteTarget.item.id) setEditingCredit(null);
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
      <BottomSheet open={open} onClose={onClose} title={eventName}>
        {isLoading ? (
          <div className="space-y-3 pb-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-card bg-white/80" />
            ))}
          </div>
        ) : isEmpty ? (
          <p className="px-1 py-8 text-center text-[0.8125rem] text-ink-secondary">
            No items added to this event yet.
          </p>
        ) : (
          <div className="space-y-4 pb-2">
            {income.length > 0 ? (
              <Section title="Income" total={incomeTotal} tone="income">
                {income.map((tx) => (
                  <ActivityListItem
                    key={tx.id}
                    item={{ kind: "transaction", data: tx }}
                    showActions
                    onEditTransaction={(row) => {
                      setEditingCredit(null);
                      setEditingTransaction(row);
                    }}
                    onDeleteTransaction={(row) => setDeleteTarget({ kind: "transaction", item: row })}
                  />
                ))}
              </Section>
            ) : null}
            {expenses.length > 0 ? (
              <Section title="Expenses" total={-expenseTotal} tone="expense">
                {expenses.map((tx) => (
                  <ActivityListItem
                    key={tx.id}
                    item={{ kind: "transaction", data: tx }}
                    showActions
                    onEditTransaction={(row) => {
                      setEditingCredit(null);
                      setEditingTransaction(row);
                    }}
                    onDeleteTransaction={(row) => setDeleteTarget({ kind: "transaction", item: row })}
                  />
                ))}
              </Section>
            ) : null}
            {credits.length > 0 ? (
              <Section title="Credit" total={-creditTotal} tone="credit">
                {credits.map((credit) => (
                  <ActivityListItem
                    key={credit.id}
                    item={{ kind: "credit", data: credit }}
                    showActions
                    onEditCredit={(row) => {
                      setEditingTransaction(null);
                      setEditingCredit(row);
                    }}
                    onDeleteCredit={(row) => setDeleteTarget({ kind: "credit", item: row })}
                  />
                ))}
              </Section>
            ) : null}
          </div>
        )}
      </BottomSheet>

      <AddTransactionSheet
        open={editingTransaction !== null}
        onClose={() => setEditingTransaction(null)}
        userId={userId}
        variant={editingTransaction?.type ?? "expense"}
        editTransaction={editingTransaction}
        elevated
      />

      <AddCreditSheet
        open={editingCredit !== null}
        onClose={() => setEditingCredit(null)}
        userId={userId}
        editCredit={editingCredit}
        elevated
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
