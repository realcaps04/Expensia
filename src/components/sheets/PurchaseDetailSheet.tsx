import { Pencil } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import { formatCurrency } from "../../lib/format";
import { formatPurchaseDate } from "../purchases/PurchaseListCard";
import { BottomSheet } from "./BottomSheet";

export type PurchaseDetailData = {
  listId: Id<"purchaseLists">;
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

type PurchaseDetailSheetProps = {
  open: boolean;
  onClose: () => void;
  list: PurchaseDetailData;
  isNew?: boolean;
  onEdit: () => void;
};

export function PurchaseDetailSheet({
  open,
  onClose,
  list,
  isNew = false,
  onEdit,
}: PurchaseDetailSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title={isNew ? "List saved" : list.name}>
      <div className="pb-2">
        {!isNew && list.note ? (
          <p className="mb-4 text-[0.8125rem] leading-relaxed text-ink-secondary">{list.note}</p>
        ) : null}

        <div className="rounded-[18px] bg-white px-4 py-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-[1.0625rem] font-bold text-ink">{list.name}</p>
              <p className="mt-1 text-[0.75rem] text-ink-muted">
                {formatPurchaseDate(list.purchasedAt)} · {list.itemCount}{" "}
                {list.itemCount === 1 ? "item" : "items"}
              </p>
            </div>
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 rounded-pill bg-teal-brand/10 px-3 py-1.5 text-[0.75rem] font-semibold text-teal-brand"
            >
              <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
              Edit
            </button>
          </div>

          <div className="mt-4 flex items-end justify-between border-t border-surface-border/80 pt-3">
            <div>
              <p className="text-[0.6875rem] font-medium text-ink-muted">Total</p>
              <p className="font-display text-[1.25rem] font-bold text-ink">
                {formatCurrency(list.totalAmount)}
              </p>
            </div>
            <p className="text-[0.75rem] text-ink-secondary">
              Qty{" "}
              {list.totalQuantity % 1 === 0
                ? list.totalQuantity
                : list.totalQuantity.toFixed(2)}
            </p>
          </div>
        </div>

        <ul className="mt-3 space-y-2">
          {list.items.map((item) => (
            <li
              key={item._id}
              className="rounded-[16px] bg-white px-4 py-3 shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[0.875rem] font-semibold text-ink">{item.name}</p>
                  <p className="mt-0.5 text-[0.75rem] text-ink-muted">
                    {item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(2)} ×{" "}
                    {formatCurrency(item.unitPrice)}
                    {item.note ? ` · ${item.note}` : ""}
                  </p>
                </div>
                <p className="shrink-0 font-display text-[0.9375rem] font-bold text-ink">
                  {formatCurrency(item.quantity * item.unitPrice)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </BottomSheet>
  );
}
