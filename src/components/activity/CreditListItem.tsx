import { CreditCard, Landmark, Trash2 } from "lucide-react";
import { formatCurrency } from "../../lib/format";
import type { CreditActivityRowData } from "../../lib/activity-types";

type CreditListItemProps = {
  credit: CreditActivityRowData;
  onDelete?: (credit: CreditActivityRowData) => void;
  showActions?: boolean;
};

export function CreditListItem({ credit, onDelete, showActions = false }: CreditListItemProps) {
  const Icon = credit.type === "personal_loan" ? Landmark : CreditCard;
  const subtitle = [credit.typeLabel, credit.issuer, credit.time].filter(Boolean).join(" • ");

  return (
    <div className="flex items-center gap-2 rounded-[16px] px-1 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.9375rem] font-semibold text-ink">{credit.name}</p>
          <p className="mt-0.5 text-[0.75rem] text-ink-muted">{subtitle}</p>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-[0.9375rem] font-semibold text-sky-700">
            {formatCurrency(credit.balance)}
          </span>
          <p className="mt-0.5 text-[0.6875rem] text-ink-muted">owed</p>
        </div>
      </div>

      {showActions && onDelete ? (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label={`Delete ${credit.name}`}
            onClick={() => onDelete(credit)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-rose-50 hover:text-expense"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
