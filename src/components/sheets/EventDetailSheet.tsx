import { CreditCard, Pencil, Receipt, Wallet } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import { formatCurrency } from "../../lib/format";
import { BottomSheet } from "./BottomSheet";

export type EventRef = {
  eventId: Id<"events">;
  name: string;
  note?: string;
  incomeTotal: number;
  expenseTotal: number;
  creditTotal: number;
  net: number;
  itemCount: number;
};

type EventDetailSheetProps = {
  open: boolean;
  onClose: () => void;
  event: EventRef;
  isNew?: boolean;
  onEdit: () => void;
  onAddIncome: () => void;
  onAddExpense: () => void;
  onAddCredit: () => void;
};

function AddEntryButton({
  label,
  description,
  icon: Icon,
  iconBg,
  iconColor,
  onClick,
}: {
  label: string;
  description: string;
  icon: typeof Wallet;
  iconBg: string;
  iconColor: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-[18px] bg-white px-4 py-3.5 text-left shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition-transform active:scale-[0.99]"
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${iconBg} ${iconColor}`}
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[0.9375rem] font-semibold text-ink">{label}</p>
        <p className="mt-0.5 text-[0.8125rem] text-ink-secondary">{description}</p>
      </div>
    </button>
  );
}

export function EventDetailSheet({
  open,
  onClose,
  event,
  isNew = false,
  onEdit,
  onAddIncome,
  onAddExpense,
  onAddCredit,
}: EventDetailSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={isNew ? "Event created" : event.name}
    >
      <div className="pb-2">
        {!isNew && event.note ? (
          <p className="mb-4 text-[0.8125rem] leading-relaxed text-ink-secondary">{event.note}</p>
        ) : null}

        {isNew ? (
          <p className="text-center text-[0.8125rem] leading-relaxed text-ink-secondary">
            <span className="font-semibold text-ink">{event.name}</span> is ready. Add entries
            anytime to track totals.
          </p>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-3 rounded-[16px] bg-slate-50 px-4 py-3 dark:bg-slate-800/50">
          <div>
            <p className="text-[0.6875rem] font-medium text-ink-muted">Income</p>
            <p className="mt-0.5 text-[0.875rem] font-semibold text-income">
              {formatCurrency(event.incomeTotal, { signed: true })}
            </p>
          </div>
          <div>
            <p className="text-[0.6875rem] font-medium text-ink-muted">Expenses</p>
            <p className="mt-0.5 text-[0.875rem] font-semibold text-expense">
              {formatCurrency(-event.expenseTotal, { signed: true })}
            </p>
          </div>
          <div>
            <p className="text-[0.6875rem] font-medium text-ink-muted">Credit</p>
            <p className="mt-0.5 text-[0.875rem] font-semibold text-sky-600">
              {formatCurrency(-event.creditTotal, { signed: true })}
            </p>
          </div>
          <div>
            <p className="text-[0.6875rem] font-medium text-ink-muted">Net</p>
            <p
              className={`mt-0.5 text-[0.875rem] font-semibold ${
                event.net >= 0 ? "text-ink" : "text-expense"
              }`}
            >
              {formatCurrency(event.net, { signed: true })}
            </p>
          </div>
        </div>

        <p className="mt-5 text-[0.75rem] font-semibold uppercase tracking-wide text-ink-muted">
          Add to this event
        </p>

        <div className="mt-2 space-y-2">
          <AddEntryButton
            label="Add Income"
            description="Record money coming in"
            icon={Wallet}
            iconBg="bg-emerald-50"
            iconColor="text-income"
            onClick={onAddIncome}
          />
          <AddEntryButton
            label="Add Expense"
            description="Record money going out"
            icon={Receipt}
            iconBg="bg-rose-50"
            iconColor="text-expense"
            onClick={onAddExpense}
          />
          <AddEntryButton
            label="Add Credit"
            description="Link a loan or card"
            icon={CreditCard}
            iconBg="bg-sky-50"
            iconColor="text-sky-600"
            onClick={onAddCredit}
          />
        </div>

        {!isNew ? (
          <button
            type="button"
            onClick={onEdit}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-[16px] border border-surface-border bg-white py-3 text-[0.875rem] font-semibold text-ink transition-colors hover:bg-slate-50"
          >
            <Pencil className="h-4 w-4" strokeWidth={2} />
            Edit Event
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full rounded-[16px] py-3 text-[0.875rem] font-semibold text-ink-secondary transition-colors hover:text-ink"
          >
            Done for now
          </button>
        )}
      </div>
    </BottomSheet>
  );
}

export function eventToRef(event: {
  _id: Id<"events">;
  name: string;
  note?: string;
  incomeTotal: number;
  expenseTotal: number;
  creditTotal: number;
  net: number;
  itemCount: number;
}): EventRef {
  return {
    eventId: event._id,
    name: event.name,
    note: event.note,
    incomeTotal: event.incomeTotal,
    expenseTotal: event.expenseTotal,
    creditTotal: event.creditTotal,
    net: event.net,
    itemCount: event.itemCount,
  };
}

export function emptyEventRef(eventId: Id<"events">, name: string, note?: string): EventRef {
  return {
    eventId,
    name,
    note,
    incomeTotal: 0,
    expenseTotal: 0,
    creditTotal: 0,
    net: 0,
    itemCount: 0,
  };
}
