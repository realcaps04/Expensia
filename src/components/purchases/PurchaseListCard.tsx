import { Calendar, Pencil, ShoppingBasket } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import { formatCurrency } from "../../lib/format";

export type PurchaseListCardData = {
  _id: Id<"purchaseLists">;
  name: string;
  note?: string;
  purchasedAt: number;
  itemCount: number;
  totalQuantity: number;
  totalAmount: number;
  items: Array<{
    _id: Id<"purchaseItems">;
    name: string;
    quantity: number;
    unitPrice: number;
    note?: string;
  }>;
};

type PurchaseListCardProps = {
  list: PurchaseListCardData;
  dateLabel: string;
  onEdit: () => void;
  onOpen: () => void;
};

export function PurchaseListCard({ list, dateLabel, onEdit, onOpen }: PurchaseListCardProps) {
  const preview = list.items.slice(0, 3);

  return (
    <article className="rounded-[20px] bg-white p-4 shadow-[0_4px_24px_rgba(15,23,42,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.28)]">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-brand text-white shadow-[0_4px_12px_rgba(196,94,18,0.25)]">
          <ShoppingBasket className="h-5 w-5" strokeWidth={2} />
        </div>

        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <h3 className="truncate font-display text-[1.0625rem] font-bold leading-tight text-ink">
            {list.name}
          </h3>
          <div className="mt-1 flex items-center gap-1 text-[0.75rem] text-ink-muted">
            <Calendar className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <span>{dateLabel}</span>
          </div>
          <span className="mt-1.5 inline-flex rounded-pill bg-teal-brand/10 px-2.5 py-0.5 text-[0.6875rem] font-semibold text-teal-brand">
            {list.itemCount} {list.itemCount === 1 ? "item" : "items"}
          </span>
        </button>

        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${list.name}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-surface-border bg-white text-ink-muted shadow-sm transition-colors hover:bg-slate-50 hover:text-ink dark:hover:bg-slate-700"
        >
          <Pencil className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <button type="button" onClick={onOpen} className="mt-4 w-full text-left">
        <div className="rounded-[14px] border border-surface-border bg-slate-50 px-3 py-3 dark:border-slate-600/40 dark:bg-slate-800/80">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[0.6875rem] font-medium text-ink-muted">Total</p>
              <p className="mt-0.5 font-display text-[1.125rem] font-bold text-ink">
                {formatCurrency(list.totalAmount)}
              </p>
            </div>
            <p className="text-[0.75rem] text-ink-secondary">
              Qty {list.totalQuantity % 1 === 0 ? list.totalQuantity : list.totalQuantity.toFixed(2)}
            </p>
          </div>

          {preview.length > 0 ? (
            <ul className="mt-3 space-y-1.5 border-t border-surface-border/80 pt-3">
              {preview.map((item) => (
                <li
                  key={item._id}
                  className="flex items-center justify-between gap-2 text-[0.8125rem]"
                >
                  <span className="min-w-0 truncate text-ink">
                    {item.name}
                    <span className="text-ink-muted">
                      {" "}
                      × {item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(2)}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold text-ink">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </span>
                </li>
              ))}
              {list.itemCount > preview.length ? (
                <li className="text-[0.75rem] text-ink-muted">
                  +{list.itemCount - preview.length} more
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
      </button>
    </article>
  );
}

export function formatPurchaseDate(ms: number) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(ms));
}
