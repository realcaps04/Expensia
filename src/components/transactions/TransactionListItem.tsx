import {
  Banknote,
  Briefcase,
  Car,
  CircleEllipsis,
  Clapperboard,
  HeartPulse,
  Pencil,
  Receipt,
  ShoppingBag,
  Trash2,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { TransactionIcon } from "../../lib/convex-mappers";
import { formatCompactDate } from "../../lib/datetime";
import { formatCurrency } from "../../lib/format";
import type { TransactionRowData } from "../../lib/transaction-types";

const ICON_BG = "bg-transparent";

const ICONS: Record<TransactionIcon, { Icon: LucideIcon; bg: string; color: string }> = {
  salary: { Icon: Banknote, bg: ICON_BG, color: "text-income" },
  freelance: { Icon: Briefcase, bg: ICON_BG, color: "text-sky-600" },
  other_income: { Icon: Wallet, bg: ICON_BG, color: "text-income" },
  food: { Icon: UtensilsCrossed, bg: ICON_BG, color: "text-income" },
  transport: { Icon: Car, bg: ICON_BG, color: "text-violet-brand" },
  shopping: { Icon: ShoppingBag, bg: ICON_BG, color: "text-expense" },
  bills: { Icon: Receipt, bg: ICON_BG, color: "text-amber-600" },
  entertainment: { Icon: Clapperboard, bg: ICON_BG, color: "text-purple-500" },
  health: { Icon: HeartPulse, bg: ICON_BG, color: "text-pink-500" },
  other: { Icon: CircleEllipsis, bg: ICON_BG, color: "text-ink-muted" },
};

type TransactionListItemProps = {
  tx: TransactionRowData;
  onEdit: (tx: TransactionRowData) => void;
  onDelete?: (tx: TransactionRowData) => void;
  showActions?: boolean;
  variant?: "default" | "activity";
};

export function TransactionListItem({
  tx,
  onEdit,
  onDelete,
  showActions = false,
  variant = "default",
}: TransactionListItemProps) {
  const { Icon, bg, color } = ICONS[tx.icon] ?? ICONS.other;
  const signedAmount = tx.type === "income" ? tx.amount : -tx.amount;
  const meta = `${tx.category} • ${formatCompactDate(tx.occurredAt)}`;

  return (
    <div className="flex items-start gap-2 rounded-[16px] px-1 py-3">
      <button
        type="button"
        onClick={() => onEdit(tx)}
        className="flex min-w-0 flex-1 items-start gap-3 text-left transition-colors active:opacity-80"
      >
        <div
          className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${bg} ${color}`}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">
          <p
            className={`text-[0.9375rem] font-semibold leading-snug text-ink ${
              variant === "activity" ? "truncate" : "break-words"
            }`}
          >
            {tx.title}
          </p>
          {tx.note?.trim() ? (
            <p
              className={`mt-0.5 text-[0.75rem] leading-snug text-ink-secondary ${
                variant === "activity" ? "truncate" : "break-words"
              }`}
            >
              {tx.note.trim()}
            </p>
          ) : null}
          <p
            className={`mt-0.5 text-[0.75rem] text-ink-muted ${
              variant === "activity" ? "truncate whitespace-nowrap" : ""
            }`}
          >
            {meta}
          </p>
        </div>
        <span
          className={`mt-0.5 shrink-0 text-[0.9375rem] font-semibold ${
            tx.type === "income" ? "text-income" : "text-expense"
          }`}
        >
          {formatCurrency(signedAmount, { signed: true })}
        </span>
      </button>

      {showActions ? (
        <div className="flex shrink-0 items-start gap-1 pt-0.5">
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
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-orange-50 hover:text-expense"
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
