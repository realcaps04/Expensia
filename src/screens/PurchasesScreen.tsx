import { useQuery } from "convex/react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import {
  formatPurchaseDate,
  PurchaseListCard,
  type PurchaseListCardData,
} from "../components/purchases/PurchaseListCard";
import { PurchasesEmptyFooter } from "../components/purchases/PurchasesEmptyFooter";
import {
  AddPurchaseSheet,
  type PurchaseListEditData,
} from "../components/sheets/AddPurchaseSheet";
import {
  PurchaseDetailSheet,
  type PurchaseDetailData,
} from "../components/sheets/PurchaseDetailSheet";
import { useAuth } from "../context/AuthProvider";
import { getConvexUserId } from "../lib/session";

type SortMode = "recent" | "name";
type PurchaseListRow = PurchaseListCardData & {
  note?: string;
  items: Array<{
    _id: Id<"purchaseItems">;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
};

function toDetail(list: PurchaseListRow): PurchaseDetailData {
  return {
    listId: list._id,
    name: list.name,
    note: list.note,
    purchasedAt: list.purchasedAt,
    itemCount: list.itemCount,
    totalQuantity: list.totalQuantity,
    totalAmount: list.totalAmount,
    items: list.items,
  };
}

function toEdit(list: PurchaseListRow): PurchaseListEditData {
  return {
    id: list._id,
    name: list.name,
    note: list.note,
    purchasedAt: list.purchasedAt,
    items: list.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  };
}

export function PurchasesScreen() {
  const { user } = useAuth();
  const userId = getConvexUserId(user);
  const lists = useQuery(api.purchases.listWithTotals, userId ? { userId } : "skip");
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editList, setEditList] = useState<PurchaseListEditData | null>(null);
  const [detailList, setDetailList] = useState<PurchaseDetailData | null>(null);
  const [detailIsNew, setDetailIsNew] = useState(false);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("recent");

  const isLoading = userId !== null && lists === undefined;

  const filteredLists = useMemo(() => {
    const rows = (lists ?? []) as PurchaseListRow[];
    const query = search.trim().toLowerCase();
    let next = query
      ? rows.filter(
          (list) =>
            list.name.toLowerCase().includes(query) ||
            list.note?.toLowerCase().includes(query) ||
            list.items.some((item) => item.name.toLowerCase().includes(query)),
        )
      : rows;

    if (sortMode === "name") {
      next = [...next].sort((a, b) => a.name.localeCompare(b.name));
    }

    return next;
  }, [lists, search, sortMode]);

  const openCreate = () => {
    setEditList(null);
    setEditSheetOpen(true);
  };

  const openEdit = (list: PurchaseListRow) => {
    setDetailList(null);
    setEditList(toEdit(list));
    setEditSheetOpen(true);
  };

  const openDetail = (list: PurchaseListRow) => {
    setDetailIsNew(false);
    setDetailList(toDetail(list));
  };

  const liveDetail = detailList
    ? ((lists ?? []) as PurchaseListRow[]).find((row) => row._id === detailList.listId)
    : undefined;

  const toggleSort = () => {
    setSortMode((mode) => (mode === "recent" ? "name" : "recent"));
  };

  return (
    <div className="px-5 pb-6 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="mx-auto flex max-w-[390px] flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-[1.625rem] font-bold tracking-tight text-ink">
              Purchases
            </h1>
            <p className="mt-1 text-[0.8125rem] text-ink-secondary">
              Lists with item name, quantity, and price
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-teal-brand px-4 py-2.5 text-[0.8125rem] font-semibold text-white shadow-[0_4px_14px_rgba(196,94,18,0.28)] transition-transform active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            New List
          </button>
        </div>

        {!isLoading && (lists ?? []).length > 0 ? (
          <div className="flex items-center gap-2">
            <label className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
                strokeWidth={2}
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search purchases..."
                className="w-full rounded-[14px] border border-transparent bg-white py-3 pl-10 pr-4 text-[0.875rem] text-ink shadow-[0_2px_12px_rgba(15,23,42,0.05)] placeholder:text-ink-muted/70 focus:border-teal-brand/30 focus:outline-none focus:ring-2 focus:ring-teal-brand/15"
              />
            </label>
            <button
              type="button"
              onClick={toggleSort}
              aria-label={sortMode === "recent" ? "Sort by name" : "Sort by recent"}
              title={sortMode === "recent" ? "Sorted by recent" : "Sorted A–Z"}
              className={`flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[14px] border bg-white shadow-[0_2px_12px_rgba(15,23,42,0.05)] transition-colors ${
                sortMode === "name"
                  ? "border-teal-brand/40 text-teal-brand"
                  : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              <SlidersHorizontal className="h-[18px] w-[18px]" strokeWidth={2} />
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-[220px] animate-pulse rounded-[20px] bg-white/80 shadow-soft"
              />
            ))}
          </div>
        ) : (lists ?? []).length === 0 ? (
          <PurchasesEmptyFooter onCreate={openCreate} variant="empty" />
        ) : filteredLists.length === 0 ? (
          <section className="rounded-[20px] bg-white px-6 py-10 text-center shadow-soft">
            <p className="font-display text-[1rem] font-semibold text-ink">No matches</p>
            <p className="mt-1 text-[0.8125rem] text-ink-secondary">
              Try a different search term.
            </p>
          </section>
        ) : (
          <>
            <div className="space-y-4">
              {filteredLists.map((list) => (
                <PurchaseListCard
                  key={list._id}
                  list={list}
                  dateLabel={formatPurchaseDate(list.purchasedAt)}
                  onOpen={() => openDetail(list)}
                />
              ))}
            </div>

            {!search.trim() ? (
              <PurchasesEmptyFooter onCreate={openCreate} variant="end-of-list" />
            ) : null}
          </>
        )}
      </div>

      <AddPurchaseSheet
        open={editSheetOpen}
        onClose={() => {
          setEditSheetOpen(false);
          setEditList(null);
        }}
        userId={userId}
        editList={editList}
        onSaved={(payload) => {
          if (!payload.isNew) return;
          const totalAmount = payload.items.reduce(
            (sum, item) => sum + item.quantity * item.unitPrice,
            0,
          );
          const totalQuantity = payload.items.reduce((sum, item) => sum + item.quantity, 0);
          setDetailIsNew(true);
          setDetailList({
            listId: payload.listId,
            name: payload.name,
            note: payload.note,
            purchasedAt: payload.purchasedAt,
            itemCount: payload.items.length,
            totalQuantity,
            totalAmount,
            items: payload.items.map((item, index) => ({
              _id: `${payload.listId}_${index}` as Id<"purchaseItems">,
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          });
        }}
      />

      {detailList ? (
        <PurchaseDetailSheet
          open
          onClose={() => {
            setDetailList(null);
            setDetailIsNew(false);
          }}
          list={liveDetail ? toDetail(liveDetail) : detailList}
          isNew={detailIsNew}
          onEdit={() => {
            setDetailList(null);
            setDetailIsNew(false);
            if (liveDetail) {
              setEditList(toEdit(liveDetail));
            } else {
              setEditList({
                id: detailList.listId,
                name: detailList.name,
                note: detailList.note,
                purchasedAt: detailList.purchasedAt,
                items: detailList.items.map((item) => ({
                  name: item.name,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                })),
              });
            }
            setEditSheetOpen(true);
          }}
        />
      ) : null}
    </div>
  );
}
