import { useQuery } from "convex/react";
import { ChevronRight, ShoppingBasket } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { formatCurrency } from "../../lib/format";

type PurchasesHomeCardProps = {
  userId: Id<"users"> | null;
};

export function PurchasesHomeCard({ userId }: PurchasesHomeCardProps) {
  const lists = useQuery(api.purchases.listWithTotals, userId ? { userId } : "skip");
  const rows = lists ?? [];
  const listCount = rows.length;
  const itemCount = rows.reduce((sum, list) => sum + list.itemCount, 0);
  const totalAmount = rows.reduce((sum, list) => sum + list.totalAmount, 0);
  const isLoading = userId !== null && lists === undefined;

  return (
    <Link
      to="/home/purchases"
      className="flex items-center gap-3 rounded-[20px] bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition-transform active:scale-[0.99]"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-brand/10 text-teal-brand">
        <ShoppingBasket className="h-5 w-5" strokeWidth={2} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="font-display text-[0.9375rem] font-semibold text-ink">Purchases</p>
        <p className="mt-0.5 text-[0.75rem] text-ink-secondary">
          {isLoading
            ? "Loading your lists…"
            : listCount === 0
              ? "View and manage shopping lists"
              : `${listCount} ${listCount === 1 ? "list" : "lists"} · ${itemCount} ${
                  itemCount === 1 ? "item" : "items"
                } · ${formatCurrency(totalAmount)}`}
        </p>
      </div>

      <span className="inline-flex shrink-0 items-center gap-0.5 text-[0.8125rem] font-semibold text-teal-brand">
        Manage
        <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
      </span>
    </Link>
  );
}
