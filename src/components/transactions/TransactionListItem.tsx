import {
  Briefcase,
  Car,
  Pencil,
  ShoppingBag,
  Trash2,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import type { TransactionIcon } from "../../lib/convex-mappers";
import { formatCurrency } from "../../lib/format";
import type { TransactionRowData } from "../../lib/transaction-types";

const ICONS: Record<TransactionIcon, { Icon: LucideIcon; bg: string; color: string }> = {
  briefcase: { Icon: Briefcase, bg: "bg-emerald-50", color: "text-income" },
  food: { Icon: UtensilsCrossed, bg: "bg-rose-50", color: "text-expense" },
  transport: { Icon: Car, bg: "bg-sky-50", color: "text-sky-600" },
  shopping: { Icon: ShoppingBag, bg: "bg-amber-50", color: "text-amber-600" },
};

type TransactionListItemProps = {
  tx: TransactionRowData;
  onEdit: (tx: TransactionRowData) => void;
  onDelete?: (tx: TransactionRowData) => void;
  showActions?: boolean;
};

export function TransactionListItem({
  tx,
  onEdit,
  onDelete,
  showActions = false,
}: TransactionListItemProps) {
  const { Icon, bg, color } = ICONS[tx.icon];
  const signedAmount = tx.type === "income" ? tx.amount : -tx.amount;

  return (
    <div className="flex items-center gap-2 rounded-[16px] px-1 py-3">
      <button
        type="button"
        onClick={() => onEdit(tx)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left transition-colors active:opacity-80"
      >
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${bg} ${color}`}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.9375rem] font-semibold text-ink">{tx.title}</p>
          <p className="mt-0.5 text-[0.75rem] text-ink-muted">
            {tx.category} • {tx.time}
          </p>
        </div>
        <span
          className={`shrink-0 text-[0.9375rem] font-semibold ${
            tx.type === "income" ? "text-income" : "text-expense"
          }`}
        >
          {formatCurrency(signedAmount, { signed: true })}
        </span>
      </button>

      {showActions ? (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label={`Edit ${tx.title}`}
            onClick={() => onEdit(tx)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-slate-100 hover:text-teal-brand"
          >
            <Pencil className="h-4 w-4" strokeWidth={2} />
          </button>
          {onDelete ? (
            <button
              type="button"
              aria-label={`Delete ${tx.title}`}
              onClick={() => onDelete(tx)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-rose-50 hover:text-expense"
            >
              <Trash2 className="h-4 w-4" strokeWidth={2} />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function groupTransactionsByDate(transactions: TransactionRowData[]) {
  const groups = new Map<string, TransactionRowData[]>();

  for (const tx of transactions) {
    const key = new Date(tx.occurredAt).toDateString();
    const list = groups.get(key) ?? [];
    list.push(tx);
    groups.set(key, list);
  }

  return [...groups.entries()].map(([key, items]) => ({
    key,
    items,
    occurredAt: items[0]?.occurredAt ?? 0,
  }));
}
