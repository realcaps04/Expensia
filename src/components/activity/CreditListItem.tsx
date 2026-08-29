import { CreditCard, Landmark, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "../../lib/format";
import type { CreditActivityRowData } from "../../lib/activity-types";

type CreditListItemProps = {
  credit: CreditActivityRowData;
  onEdit?: (credit: CreditActivityRowData) => void;
  onDelete?: (credit: CreditActivityRowData) => void;
  showActions?: boolean;
};

export function CreditListItem({
  credit,
  onEdit,
  onDelete,
  showActions = false,
}: CreditListItemProps) {
  const Icon = credit.type === "personal_loan" ? Landmark : CreditCard;
  const subtitle = [credit.typeLabel, credit.issuer, credit.time].filter(Boolean).join(" • ");

  return (
    <div className="flex items-start gap-2 rounded-[16px] px-1 py-3">
      <button
        type="button"
        onClick={() => onEdit?.(credit)}
        className="flex min-w-0 flex-1 items-start gap-3 text-left transition-colors active:opacity-80"
      >
        <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="break-words text-[0.9375rem] font-semibold leading-snug text-ink">
            {credit.name}
          </p>
          {credit.note?.trim() ? (
            <p className="mt-0.5 break-words text-[0.75rem] leading-snug text-ink-secondary">
              {credit.note.trim()}
            </p>
          ) : null}
          <p className="mt-0.5 text-[0.75rem] text-ink-muted">{subtitle}</p>
        </div>
        <div className="mt-0.5 shrink-0 text-right">
          <span className="text-[0.9375rem] font-semibold text-sky-700">
            {formatCurrency(credit.balance)}
          </span>
          <p className="mt-0.5 text-[0.6875rem] text-ink-muted">owed</p>
        </div>
      </button>

      {showActions ? (
        <div className="flex shrink-0 items-start gap-1 pt-0.5">
          <button
            type="button"
            aria-label={`Edit ${credit.name}`}
            onClick={() => onEdit?.(credit)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-slate-100 hover:text-teal-brand"
          >
            <Pencil className="h-4 w-4" strokeWidth={2} />
          </button>
          {onDelete ? (
            <button
              type="button"
              aria-label={`Delete ${credit.name}`}
              onClick={() => onDelete(credit)}
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
