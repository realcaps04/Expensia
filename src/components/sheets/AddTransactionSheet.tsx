import { useMutation } from "convex/react";
import {
  Briefcase,
  Building2,
  Calendar,
  Check,
  Clock,
  Loader2,
  NotebookPen,
  Store,
  Trash2,
  User,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import {
  combineDateAndTime,
  formatDisplayDate,
  formatDisplayTime,
  toDateInputValue,
  toTimeInputValue,
} from "../../lib/datetime";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
} from "../../lib/transaction-options";
import type { TransactionRowData } from "../home/RecentTransactions";
import { BottomSheet } from "./BottomSheet";
import { SheetFieldRow, SheetNativeInput, SheetSelect } from "./SheetFieldRow";

type AddTransactionSheetProps = {
  open: boolean;
  onClose: () => void;
  userId: Doc<"users">["_id"] | null;
  variant: "income" | "expense";
  editTransaction?: TransactionRowData | null;
};

const CONFIG = {
  income: {
    title: "Add Income",
    editTitle: "Edit Income",
    subtitle: "Record your earnings and grow financial clarity.",
    editSubtitle: "Update this income entry.",
    saveLabel: "Save Income",
    editSaveLabel: "Update Income",
    iconBg: "bg-emerald-50",
    iconColor: "text-income",
    btnClass: "bg-gradient-to-r from-teal-brand to-teal-deep shadow-[0_10px_24px_rgba(13,148,136,0.28)]",
    sourceLabel: "Source",
    sourcePlaceholder: "Company / Client",
    defaultCategory: "salary",
    defaultPayment: "bank_transfer",
    categories: INCOME_CATEGORIES,
  },
  expense: {
    title: "Add Expense",
    editTitle: "Edit Expense",
    subtitle: "Track your spending and stay in control.",
    editSubtitle: "Update this expense entry.",
    saveLabel: "Save Expense",
    editSaveLabel: "Update Expense",
    iconBg: "bg-rose-50",
    iconColor: "text-expense",
    btnClass: "bg-gradient-to-r from-rose-400 to-rose-500 shadow-[0_10px_24px_rgba(248,113,113,0.32)]",
    sourceLabel: "Merchant",
    sourcePlaceholder: "Store or vendor",
    defaultCategory: "food",
    defaultPayment: "upi",
    categories: EXPENSE_CATEGORIES,
  },
} as const;

function resetForm(variant: "income" | "expense") {
  const cfg = CONFIG[variant];
  return {
    amount: "",
    category: cfg.defaultCategory,
    date: toDateInputValue(),
    time: toTimeInputValue(),
    paymentMethod: cfg.defaultPayment,
    title: "",
    note: "",
  };
}

function formFromTransaction(tx: TransactionRowData) {
  const date = new Date(tx.occurredAt);
  return {
    amount: String(tx.amount),
    category: tx.categoryKey,
    date: toDateInputValue(date),
    time: toTimeInputValue(date),
    paymentMethod: tx.paymentMethod,
    title: tx.title,
    note: tx.note ?? "",
  };
}

export function AddTransactionSheet({
  open,
  onClose,
  userId,
  variant,
  editTransaction = null,
}: AddTransactionSheetProps) {
  const isEdit = editTransaction !== null;
  const cfg = CONFIG[variant];
  const createTx = useMutation(api.transactions.create);
  const updateTx = useMutation(api.transactions.update);
  const removeTx = useMutation(api.transactions.remove);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(cfg.defaultCategory);
  const [date, setDate] = useState(toDateInputValue());
  const [time, setTime] = useState(toTimeInputValue());
  const [paymentMethod, setPaymentMethod] = useState<string>(cfg.defaultPayment);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (editTransaction) {
      const values = formFromTransaction(editTransaction);
      setAmount(values.amount);
      setCategory(values.category);
      setDate(values.date);
      setTime(values.time);
      setPaymentMethod(values.paymentMethod);
      setTitle(values.title);
      setNote(values.note);
    } else {
      const fresh = resetForm(variant);
      setAmount(fresh.amount);
      setCategory(fresh.category);
      setDate(fresh.date);
      setTime(fresh.time);
      setPaymentMethod(fresh.paymentMethod);
      setTitle(fresh.title);
      setNote(fresh.note);
    }
    setError("");
  }, [open, variant, editTransaction]);

  const handleSave = async () => {
    if (!userId) {
      setError("Please sign in to save.");
      return;
    }

    const parsed = Number.parseFloat(amount.replace(/,/g, ""));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (!title.trim()) {
      setError(`Enter a ${cfg.sourceLabel.toLowerCase()}.`);
      return;
    }

    const payload = {
      userId,
      type: variant,
      amount: parsed,
      title: title.trim(),
      category: category as Doc<"transactions">["category"],
      paymentMethod: paymentMethod as Doc<"transactions">["paymentMethod"],
      note: note.trim() || undefined,
      occurredAt: combineDateAndTime(date, time),
    };

    setBusy(true);
    setError("");
    try {
      if (isEdit && editTransaction) {
        await updateTx({
          ...payload,
          transactionId: editTransaction.id as Id<"transactions">,
        });
      } else {
        await createTx(payload);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!userId || !editTransaction) return;
    if (!window.confirm("Delete this transaction?")) return;

    setBusy(true);
    setError("");
    try {
      await removeTx({
        userId,
        transactionId: editTransaction.id as Id<"transactions">,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
    } finally {
      setBusy(false);
    }
  };

  const sheetTitle = isEdit ? cfg.editTitle : cfg.title;
  const sheetSubtitle = isEdit ? cfg.editSubtitle : cfg.subtitle;
  const saveLabel = isEdit ? cfg.editSaveLabel : cfg.saveLabel;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={sheetTitle}
      footer={
        <div className="space-y-2">
          {error ? <p className="text-center text-[0.8125rem] text-rose-500">{error}</p> : null}
          <button
            type="button"
            disabled={busy}
            onClick={handleSave}
            className={`flex w-full items-center justify-center gap-2 rounded-[16px] py-3.5 text-[0.9375rem] font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-60 ${cfg.btnClass}`}
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Check className="h-5 w-5" strokeWidth={2.5} />
                {saveLabel}
              </>
            )}
          </button>
          {isEdit ? (
            <button
              type="button"
              disabled={busy}
              onClick={handleDelete}
              className="flex w-full items-center justify-center gap-2 rounded-[16px] border border-rose-200 bg-rose-50 py-3 text-[0.875rem] font-semibold text-rose-600 transition-colors hover:bg-rose-100 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              Delete Transaction
            </button>
          ) : null}
        </div>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={`mb-3 flex h-16 w-16 items-center justify-center rounded-full ${cfg.iconBg} ${cfg.iconColor}`}
        >
          <Wallet className="h-8 w-8" strokeWidth={1.75} />
        </div>
        <h3 className="font-display text-[1.125rem] font-bold text-ink">{sheetTitle}</h3>
        <p className="mt-1 max-w-[280px] text-[0.8125rem] leading-relaxed text-ink-secondary">
          {sheetSubtitle}
        </p>
      </div>

      <div className="mt-6 rounded-[20px] bg-white px-4 py-2 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
        <label className="block py-4 text-center">
          <span className="sr-only">Amount</span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-[1.75rem] font-semibold text-ink-muted">₹</span>
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
              placeholder="0.00"
              className="w-[180px] bg-transparent text-center font-display text-[2rem] font-bold text-ink placeholder:text-ink-muted/40 focus:outline-none"
            />
          </div>
        </label>

        <SheetFieldRow icon={<Briefcase className="h-4 w-4" />} label="Category">
          <SheetSelect value={category} onChange={setCategory} options={cfg.categories} />
        </SheetFieldRow>

        <SheetFieldRow icon={<Calendar className="h-4 w-4" />} label="Date">
          <SheetNativeInput
            type="date"
            value={date}
            onChange={setDate}
            displayValue={formatDisplayDate(date)}
          />
        </SheetFieldRow>

        <SheetFieldRow icon={<Clock className="h-4 w-4" />} label="Time">
          <SheetNativeInput
            type="time"
            value={time}
            onChange={setTime}
            displayValue={formatDisplayTime(time)}
          />
        </SheetFieldRow>

        <SheetFieldRow icon={<Building2 className="h-4 w-4" />} label="Payment Method">
          <SheetSelect value={paymentMethod} onChange={setPaymentMethod} options={PAYMENT_METHODS} />
        </SheetFieldRow>

        <SheetFieldRow
          icon={
            variant === "income" ? (
              <User className="h-4 w-4" />
            ) : (
              <Store className="h-4 w-4" />
            )
          }
          label={cfg.sourceLabel}
        >
          <SheetNativeInput
            type="text"
            value={title}
            onChange={setTitle}
            placeholder={cfg.sourcePlaceholder}
          />
        </SheetFieldRow>

        <SheetFieldRow icon={<NotebookPen className="h-4 w-4" />} label="Note (Optional)">
          <SheetNativeInput
            type="text"
            value={note}
            onChange={setNote}
            placeholder="Add a note"
          />
        </SheetFieldRow>
      </div>
    </BottomSheet>
  );
}
