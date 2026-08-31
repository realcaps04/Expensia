import {
  ArrowDownRight,
  ArrowUpFromLine,
  ArrowUpRight,
  Calendar,
  CreditCard,
  Equal,
  Pencil,
  Users,
} from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import { formatCurrency } from "../../lib/format";

export type EventCardData = {
  _id: Id<"events">;
  name: string;
  note?: string;
  createdAt: number;
  incomeTotal: number;
  expenseTotal: number;
  creditTotal: number;
  net: number;
  itemCount: number;
};

type EventCardProps = {
  event: EventCardData;
  monthLabel: string;
  onEdit: () => void;
  onOpen: () => void;
  onAddIncome: () => void;
  onAddExpense: () => void;
  onAddCredit: () => void;
};

function MetricCell({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof ArrowUpRight;
  label: string;
  value: string;
  tone: "income" | "expense" | "credit" | "net";
}) {
  const tones = {
    income: { icon: "text-teal-brand", value: "text-teal-brand" },
    expense: { icon: "text-rose-400", value: "text-rose-400" },
    credit: { icon: "text-sky-400", value: "text-sky-400" },
    net: { icon: "text-ink-muted", value: "text-ink" },
  } as const;

  return (
    <div className="rounded-[14px] border border-surface-border bg-slate-50 px-3 py-2.5 dark:border-slate-600/40 dark:bg-slate-800/80">
      <div className="flex items-center gap-1.5">
        <Icon className={`h-3.5 w-3.5 ${tones[tone].icon}`} strokeWidth={2.25} />
        <span className="text-[0.6875rem] font-medium text-ink-muted">{label}</span>
      </div>
      <p className={`mt-1 font-display text-[0.9375rem] font-bold ${tones[tone].value}`}>
        {value}
      </p>
    </div>
  );
}

function ActionButton({
  label,
  icon: Icon,
  tone,
  onClick,
}: {
  label: string;
  icon: typeof ArrowUpFromLine;
  tone: "income" | "expense" | "credit";
  onClick: () => void;
}) {
  const tones = {
    income:
      "bg-teal-50 text-teal-brand hover:bg-teal-100/80 dark:bg-teal-brand/15 dark:text-teal-light dark:hover:bg-teal-brand/25",
    expense:
      "bg-rose-50 text-rose-500 hover:bg-rose-100/80 dark:bg-rose-500/15 dark:text-rose-300 dark:hover:bg-rose-500/25",
    credit:
      "bg-sky-50 text-sky-600 hover:bg-sky-100/80 dark:bg-sky-500/15 dark:text-sky-300 dark:hover:bg-sky-500/25",
  } as const;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 rounded-[14px] py-2.5 text-[0.6875rem] font-semibold transition-colors ${tones[tone]}`}
    >
      <Icon className="h-4 w-4" strokeWidth={2.25} />
      {label}
    </button>
  );
}

export function EventCard({
  event,
  monthLabel,
  onEdit,
  onOpen,
  onAddIncome,
  onAddExpense,
  onAddCredit,
}: EventCardProps) {
  return (
    <article className="rounded-[20px] bg-white p-4 shadow-[0_4px_24px_rgba(15,23,42,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.28)]">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-brand text-white shadow-[0_4px_12px_rgba(13,148,136,0.25)]">
          <Users className="h-5 w-5" strokeWidth={2} />
        </div>

        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <h3 className="truncate font-display text-[1.0625rem] font-bold leading-tight text-ink">
            {event.name}
          </h3>
          <div className="mt-1 flex items-center gap-1 text-[0.75rem] text-ink-muted">
            <Calendar className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <span>{monthLabel}</span>
          </div>
          <span className="mt-1.5 inline-flex rounded-pill bg-teal-brand/10 px-2.5 py-0.5 text-[0.6875rem] font-semibold text-teal-brand">
            {event.itemCount} {event.itemCount === 1 ? "Item" : "Items"}
          </span>
        </button>

        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${event.name}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-surface-border bg-white text-ink-muted shadow-sm transition-colors hover:bg-slate-50 hover:text-ink dark:hover:bg-slate-700"
        >
          <Pencil className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <button type="button" onClick={onOpen} className="mt-4 w-full text-left">
        <div className="grid grid-cols-2 gap-2">
          <MetricCell
            icon={ArrowUpRight}
            label="Income"
            value={formatCurrency(event.incomeTotal, { signed: true })}
            tone="income"
          />
          <MetricCell
            icon={ArrowDownRight}
            label="Expenses"
            value={formatCurrency(-event.expenseTotal, { signed: true })}
            tone="expense"
          />
          <MetricCell
            icon={CreditCard}
            label="Credit"
            value={formatCurrency(-event.creditTotal, { signed: true })}
            tone="credit"
          />
          <MetricCell
            icon={Equal}
            label="Net"
            value={formatCurrency(event.net, { signed: true })}
            tone="net"
          />
        </div>
      </button>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <ActionButton label="Income" icon={ArrowUpFromLine} tone="income" onClick={onAddIncome} />
        <ActionButton
          label="Expense"
          icon={ArrowDownRight}
          tone="expense"
          onClick={onAddExpense}
        />
        <ActionButton label="Credit" icon={CreditCard} tone="credit" onClick={onAddCredit} />
      </div>
    </article>
  );
}

export function formatEventMonth(ms: number) {
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date(ms));
}
