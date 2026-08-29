import {
  Briefcase,
  Car,
  ChevronRight,
  ShoppingBag,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Doc } from "../../../convex/_generated/dataModel";
import type { TransactionIcon } from "../../lib/convex-mappers";
import { formatCurrency } from "../../lib/format";

const ICONS: Record<TransactionIcon, { Icon: LucideIcon; bg: string; color: string }> = {
  briefcase: { Icon: Briefcase, bg: "bg-emerald-50", color: "text-income" },
  food: { Icon: UtensilsCrossed, bg: "bg-rose-50", color: "text-expense" },
  transport: { Icon: Car, bg: "bg-sky-50", color: "text-sky-600" },
  shopping: { Icon: ShoppingBag, bg: "bg-amber-50", color: "text-amber-600" },
};

export type TransactionRowData = {
  id: string;
  title: string;
  category: string;
  categoryKey: Doc<"transactions">["category"];
  type: "income" | "expense";
  amount: number;
  paymentMethod: Doc<"transactions">["paymentMethod"];
  note?: string;
  occurredAt: number;
  time: string;
  icon: TransactionIcon;
};

function TransactionRow({
  tx,
  onEdit,
}: {
  tx: TransactionRowData;
  onEdit: (tx: TransactionRowData) => void;
}) {
  const { Icon, bg, color } = ICONS[tx.icon];
  const signedAmount = tx.type === "income" ? tx.amount : -tx.amount;

  return (
    <button
      type="button"
      onClick={() => onEdit(tx)}
      className="flex w-full items-center gap-3 rounded-[16px] px-1 py-3 text-left transition-colors hover:bg-slate-50 active:bg-slate-100"
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${bg} ${color}`}>
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.9375rem] font-semibold text-ink">{tx.title}</p>
        <p className="mt-0.5 text-[0.75rem] text-ink-muted">
          {tx.category} • {tx.time}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <span
          className={`text-[0.9375rem] font-semibold ${
            tx.type === "income" ? "text-income" : "text-expense"
          }`}
        >
          {formatCurrency(signedAmount, { signed: true })}
        </span>
        <ChevronRight className="h-4 w-4 text-ink-muted/60" strokeWidth={2} />
      </div>
    </button>
  );
}

type RecentTransactionsProps = {
  transactions: TransactionRowData[];
  onEditTransaction: (tx: TransactionRowData) => void;
};

export function RecentTransactions({ transactions, onEditTransaction }: RecentTransactionsProps) {
  return (
    <section>
      <div className="mb-1 flex items-center justify-between gap-3 px-1">
        <h2 className="font-display text-[1rem] font-semibold text-ink">Recent Transactions</h2>
        <Link
          to="/home/activity"
          className="text-[0.8125rem] font-semibold text-teal-brand transition-colors hover:text-teal-deep"
        >
          View all
        </Link>
      </div>

      <div className="rounded-card bg-white px-3 py-1 shadow-soft">
        {transactions.length === 0 ? (
          <div className="px-2 py-8 text-center">
            <p className="text-sm font-medium text-ink">Nothing here yet</p>
            <p className="mt-1 text-[0.8125rem] text-ink-secondary">
              Start tracking your money and your financial story will appear here.
            </p>
          </div>
        ) : (
          transactions.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} onEdit={onEditTransaction} />
          ))
        )}
      </div>
    </section>
  );
}
