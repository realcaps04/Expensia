import { useMutation } from "convex/react";
import {
  Calendar,
  Check,
  Loader2,
  NotebookPen,
  Package,
  Plus,
  ShoppingBasket,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { parseDateInputToMs, toDateInputValue } from "../../lib/datetime";
import { formatCurrency } from "../../lib/format";
import { BottomSheet } from "./BottomSheet";
import { ConfirmSheet, deleteItemMessage } from "./ConfirmSheet";
import { SheetFieldRow, SheetNativeInput } from "./SheetFieldRow";

export type PurchaseItemFormRow = {
  key: string;
  name: string;
  quantity: string;
  unitPrice: string;
};

export type PurchaseListEditData = {
  id: string;
  name: string;
  note?: string;
  purchasedAt: number;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
};

type AddPurchaseSheetProps = {
  open: boolean;
  onClose: () => void;
  userId: Doc<"users">["_id"] | null;
  editList?: PurchaseListEditData | null;
  onSaved?: (payload: {
    listId: Id<"purchaseLists">;
    isNew: boolean;
    name: string;
    note?: string;
    purchasedAt: number;
    items: Array<{
      name: string;
      quantity: number;
      unitPrice: number;
    }>;
  }) => void;
};

function emptyItem(): PurchaseItemFormRow {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: "",
    quantity: "",
    unitPrice: "",
  };
}

function itemNameKey(name: string) {
  return name.trim().toLowerCase();
}

function findDuplicateName(
  rows: PurchaseItemFormRow[],
  name: string,
  ignoreKey?: string,
) {
  const key = itemNameKey(name);
  if (!key) return null;
  return rows.find((row) => row.key !== ignoreKey && itemNameKey(row.name) === key) ?? null;
}

export function AddPurchaseSheet({
  open,
  onClose,
  userId,
  editList = null,
  onSaved,
}: AddPurchaseSheetProps) {
  const isEdit = editList !== null;
  const createList = useMutation(api.purchases.create);
  const updateList = useMutation(api.purchases.update);
  const removeList = useMutation(api.purchases.remove);

  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [purchasedAt, setPurchasedAt] = useState(toDateInputValue());
  const [items, setItems] = useState<PurchaseItemFormRow[]>([emptyItem()]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [highlightedKey, setHighlightedKey] = useState<string | null>(null);
  const lastCardRef = useRef<HTMLDivElement>(null);
  const lastNameInputRef = useRef<HTMLInputElement>(null);
  const itemCardRefs = useRef(new Map<string, HTMLDivElement>());
  const shouldScrollToLatest = useRef(false);
  const scrollToKey = useRef<string | null>(null);
  const highlightTimerRef = useRef<number | null>(null);

  const focusExistingItem = (key: string) => {
    scrollToKey.current = key;
    if (highlightTimerRef.current !== null) {
      window.clearTimeout(highlightTimerRef.current);
    }
    setHighlightedKey(key);
    highlightTimerRef.current = window.setTimeout(() => {
      setHighlightedKey((current) => (current === key ? null : current));
      highlightTimerRef.current = null;
    }, 1800);
  };

  useEffect(() => {
    if (scrollToKey.current) {
      const key = scrollToKey.current;
      scrollToKey.current = null;
      shouldScrollToLatest.current = false;
      requestAnimationFrame(() => {
        itemCardRefs.current.get(key)?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }

    if (!shouldScrollToLatest.current) return;
    shouldScrollToLatest.current = false;

    requestAnimationFrame(() => {
      lastCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      lastNameInputRef.current?.focus({ preventScroll: true });
    });
  }, [items]);

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current !== null) {
        window.clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

  const addItem = () => {
    const last = items[items.length - 1];
    const duplicate = findDuplicateName(items, last.name, last.key);
    if (duplicate) {
      setError(`"${duplicate.name.trim()}" is already on this list.`);
      focusExistingItem(duplicate.key);
      return;
    }

    setError("");
    shouldScrollToLatest.current = true;
    setItems((rows) => [...rows, emptyItem()]);
  };

  useEffect(() => {
    if (!open) return;
    if (editList) {
      setName(editList.name);
      setNote(editList.note ?? "");
      setPurchasedAt(toDateInputValue(new Date(editList.purchasedAt)));
      setItems(
        editList.items.length > 0
          ? editList.items.map((item) => ({
              key: `${item.name}-${item.unitPrice}-${Math.random().toString(36).slice(2, 6)}`,
              name: item.name,
              quantity: String(item.quantity),
              unitPrice: String(item.unitPrice),
            }))
          : [emptyItem()],
      );
    } else {
      setName("");
      setNote("");
      setPurchasedAt(toDateInputValue());
      setItems([emptyItem()]);
    }
    setError("");
    setDeleteConfirmOpen(false);
    setHighlightedKey(null);
    scrollToKey.current = null;
    shouldScrollToLatest.current = false;
  }, [open, editList]);

  const runningTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const qty = Number(item.quantity);
      const price = Number(item.unitPrice);
      if (!Number.isFinite(qty) || !Number.isFinite(price)) return sum;
      return sum + qty * price;
    }, 0);
  }, [items]);

  const updateItem = (key: string, patch: Partial<PurchaseItemFormRow>) => {
    setError("");
    setItems((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const removeItem = (key: string) => {
    setError("");
    setItems((rows) => (rows.length <= 1 ? rows : rows.filter((row) => row.key !== key)));
  };

  const handleSave = async () => {
    if (!userId) {
      setError("Please sign in to save.");
      return;
    }
    if (!name.trim()) {
      setError("Enter a list name.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const filledItems = items.filter(
        (item) => item.name.trim() || item.quantity.trim() || item.unitPrice.trim(),
      );
      if (filledItems.length === 0) {
        throw new Error("Add at least one purchase item.");
      }

      const seenNames = new Map<string, { name: string; key: string }>();
      const parsedItems = filledItems.map((item, index) => {
        const itemName = item.name.trim();
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unitPrice);
        if (!itemName) throw new Error(`Enter a name for item ${index + 1}.`);

        const key = itemNameKey(itemName);
        const existing = seenNames.get(key);
        if (existing) {
          focusExistingItem(existing.key);
          throw new Error(
            `"${existing.name}" is already on this list. Duplicate items are not allowed.`,
          );
        }
        seenNames.set(key, { name: itemName, key: item.key });

        if (!Number.isFinite(quantity) || quantity <= 0) {
          throw new Error(`Enter a valid quantity for "${itemName}".`);
        }
        if (!Number.isFinite(unitPrice) || unitPrice < 0) {
          throw new Error(`Enter a valid price for "${itemName}".`);
        }
        return {
          name: itemName,
          quantity,
          unitPrice,
        };
      });

      if (isEdit && editList) {
        await updateList({
          userId,
          listId: editList.id as Id<"purchaseLists">,
          name: name.trim(),
          note: note.trim() || undefined,
          purchasedAt: parseDateInputToMs(purchasedAt),
          items: parsedItems,
        });
        onSaved?.({
          listId: editList.id as Id<"purchaseLists">,
          isNew: false,
          name: name.trim(),
          note: note.trim() || undefined,
          purchasedAt: parseDateInputToMs(purchasedAt),
          items: parsedItems,
        });
      } else {
        const listId = await createList({
          userId,
          name: name.trim(),
          note: note.trim() || undefined,
          purchasedAt: parseDateInputToMs(purchasedAt),
          items: parsedItems,
        });
        onSaved?.({
          listId,
          isNew: true,
          name: name.trim(),
          note: note.trim() || undefined,
          purchasedAt: parseDateInputToMs(purchasedAt),
          items: parsedItems,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!userId || !editList) return;

    setBusy(true);
    setError("");
    try {
      await removeList({
        userId,
        listId: editList.id as Id<"purchaseLists">,
      });
      setDeleteConfirmOpen(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
    } finally {
      setBusy(false);
    }
  };

  const title = isEdit ? "Edit Purchases" : "Add Purchases";

  return (
    <>
      <BottomSheet
        open={open}
        onClose={onClose}
        title={title}
        footer={
          <div className="space-y-2">
            {error ? <p className="text-center text-[0.8125rem] text-orange-500">{error}</p> : null}
            <div className="flex items-center justify-between px-1 text-[0.8125rem]">
              <span className="text-ink-secondary">List total</span>
              <span className="font-display font-bold text-ink">{formatCurrency(runningTotal)}</span>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleSave()}
              className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-teal-brand to-teal-deep py-3.5 text-[0.9375rem] font-semibold text-white shadow-[0_10px_24px_rgba(196,94,18,0.28)] transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Check className="h-5 w-5" strokeWidth={2.5} />
                  {isEdit ? "Update List" : "Save List"}
                </>
              )}
            </button>
            {isEdit ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => setDeleteConfirmOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-[16px] border border-orange-200 bg-orange-50 py-3 text-[0.875rem] font-semibold text-orange-600 transition-colors hover:bg-orange-100 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                Delete List
              </button>
            ) : null}
          </div>
        }
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-teal-brand/10 text-teal-brand">
            <ShoppingBasket className="h-8 w-8" strokeWidth={1.75} />
          </div>
          <h3 className="font-display text-[1.125rem] font-bold text-ink">{title}</h3>
          <p className="mt-1 max-w-[280px] text-[0.8125rem] leading-relaxed text-ink-secondary">
            Build a shopping list with item name, quantity, and price for each purchase.
          </p>
        </div>

        <div className="mt-6 rounded-[20px] bg-white px-4 py-2 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
          <SheetFieldRow icon={<ShoppingBasket className="h-4 w-4" />} label="List Name">
            <SheetNativeInput
              type="text"
              value={name}
              onChange={setName}
              placeholder="e.g. Weekly groceries"
            />
          </SheetFieldRow>

          <SheetFieldRow icon={<Calendar className="h-4 w-4" />} label="Purchase Date">
            <SheetNativeInput type="date" value={purchasedAt} onChange={setPurchasedAt} />
          </SheetFieldRow>

          <SheetFieldRow icon={<NotebookPen className="h-4 w-4" />} label="Note (Optional)">
            <SheetNativeInput
              type="text"
              value={note}
              onChange={setNote}
              placeholder="Store or trip details"
            />
          </SheetFieldRow>
        </div>

        <div className="mt-4 space-y-3">
          <p className="px-1 text-[0.8125rem] font-semibold text-ink">Items</p>

          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isHighlighted = highlightedKey === item.key;

            return (
              <div
                key={item.key}
                ref={(node) => {
                  if (node) itemCardRefs.current.set(item.key, node);
                  else itemCardRefs.current.delete(item.key);
                  if (isLast) lastCardRef.current = node;
                }}
                className={`rounded-[20px] bg-white px-4 py-3 shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition-[box-shadow] duration-300 ${
                  isHighlighted
                    ? "ring-2 ring-orange-400 shadow-[0_0_0_4px_rgba(251,146,60,0.18)]"
                    : ""
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[0.75rem] font-semibold text-ink-muted">
                    <Package className="h-3.5 w-3.5" strokeWidth={2} />
                    Item {index + 1}
                    {isHighlighted ? (
                      <span className="rounded-pill bg-orange-100 px-2 py-0.5 text-[0.6875rem] font-semibold text-orange-600">
                        Already added
                      </span>
                    ) : null}
                  </div>
                  {items.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeItem(item.key)}
                      aria-label={`Remove item ${index + 1}`}
                      className="text-ink-muted transition-colors hover:text-orange-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>

                <label className="block">
                  <span className="text-[0.6875rem] font-medium text-ink-muted">Item name</span>
                  <input
                    ref={isLast ? lastNameInputRef : undefined}
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(item.key, { name: e.target.value })}
                    placeholder="e.g. Milk"
                    className="mt-0.5 w-full bg-transparent text-[0.875rem] font-semibold text-ink placeholder:font-normal placeholder:text-ink-muted focus:outline-none"
                  />
                </label>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-[0.6875rem] font-medium text-ink-muted">Qty</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="any"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.key, { quantity: e.target.value })}
                      placeholder="1"
                      className="mt-0.5 w-full bg-transparent text-[0.875rem] font-semibold text-ink placeholder:font-normal placeholder:text-ink-muted focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[0.6875rem] font-medium text-ink-muted">Unit price</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="any"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.key, { unitPrice: e.target.value })}
                      placeholder="0"
                      className="mt-0.5 w-full bg-transparent text-[0.875rem] font-semibold text-ink placeholder:font-normal placeholder:text-ink-muted focus:outline-none"
                    />
                  </label>
                </div>

                {isLast ? (
                  <button
                    type="button"
                    onClick={addItem}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-[14px] border border-dashed border-teal-brand/40 bg-teal-brand/5 py-2.5 text-[0.8125rem] font-semibold text-teal-brand transition-colors hover:bg-teal-brand/10"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.5} />
                    Add item
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </BottomSheet>

      <ConfirmSheet
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete purchase list?"
        message={editList ? deleteItemMessage(editList.name) : ""}
        confirmLabel="Delete"
        busy={busy}
      />
    </>
  );
}
