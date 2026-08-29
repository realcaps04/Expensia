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
  User,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Doc } from "../../../convex/_generated/dataModel";
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
import { BottomSheet } from "./BottomSheet";
import { SheetFieldRow, SheetNativeInput, SheetSelect } from "./SheetFieldRow";

type AddTransactionSheetProps = {
  open: boolean;
  onClose: () => void;
  userId: Doc<"users">["_id"] | null;
  variant: "income" | "expense";
};

const CONFIG = {
  income: {
    title: "Add Income",
    subtitle: "Record your earnings and grow financial clarity.",
    saveLabel: "Save Income",
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
    subtitle: "Track your spending and stay in control.",
    saveLabel: "Save Expense",
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

export function AddTransactionSheet({ open, onClose, userId, variant }: AddTransactionSheetProps) {
  const cfg = CONFIG[variant];
  const createTx = useMutation(api.transactions.create);

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
    if (open) {
      const fresh = resetForm(variant);
      setAmount(fresh.amount);
      setCategory(fresh.category);
      setDate(fresh.date);
      setTime(fresh.time);
      setPaymentMethod(fresh.paymentMethod);
      setTitle(fresh.title);
      setNote(fresh.note);
      setError("");
    }
  }, [open, variant]);

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

    setBusy(true);
    setError("");
    try {
      await createTx({
        userId,
        type: variant,
        amount: parsed,
        title: title.trim(),
        category: category as Doc<"transactions">["category"],
        paymentMethod: paymentMethod as Doc<"transactions">["paymentMethod"],
        note: note.trim() || undefined,
        occurredAt: combineDateAndTime(date, time),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={cfg.title}
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
                {cfg.saveLabel}
              </>
            )}
          </button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={`mb-3 flex h-16 w-16 items-center justify-center rounded-full ${cfg.iconBg} ${cfg.iconColor}`}
        >
          <Wallet className="h-8 w-8" strokeWidth={1.75} />
        </div>
        <h3 className="font-display text-[1.125rem] font-bold text-ink">{cfg.title}</h3>
        <p className="mt-1 max-w-[280px] text-[0.8125rem] leading-relaxed text-ink-secondary">
          {cfg.subtitle}
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
