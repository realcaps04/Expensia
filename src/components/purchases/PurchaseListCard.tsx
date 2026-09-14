import { Calendar, ShoppingBasket } from "lucide-react";
import type { Id } from "../../../convex/_generated/dataModel";
import type { PurchaseUnit } from "../../lib/purchase-units";

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
    unit?: PurchaseUnit;
    unitPrice: number;
  }>;
};

type PurchaseListCardProps = {
  list: PurchaseListCardData;
  dateLabel: string;
  onOpen: () => void;
};

export function PurchaseListCard({ list, dateLabel, onOpen }: PurchaseListCardProps) {
  return (
    <article className="rounded-[20px] bg-white p-4 shadow-[0_4px_24px_rgba(15,23,42,0.06)] transition-transform active:scale-[0.99] dark:shadow-[0_4px_24px_rgba(0,0,0,0.28)]">
      <button type="button" onClick={onOpen} className="flex w-full items-start gap-3 text-left">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-brand text-white shadow-[0_4px_12px_rgba(196,94,18,0.25)]">
          <ShoppingBasket className="h-5 w-5" strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[1.0625rem] font-bold leading-tight text-ink">
            {list.name}
          </h3>
          <div className="mt-1 flex items-center gap-1 text-[0.75rem] text-ink-muted">
            <Calendar className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            <span>{dateLabel}</span>
          </div>
          <p className="mt-1.5 text-[0.8125rem] font-medium text-ink-secondary">
            {list.itemCount} {list.itemCount === 1 ? "item" : "items"}
          </p>
        </div>
      </button>
    </article>
  );
}

export function formatPurchaseDate(ms: number) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(ms));
}
