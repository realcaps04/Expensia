import type { ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import { Check, CreditCard, Landmark, Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import type { CreditActivityRowData } from "../../lib/activity-types";
import { parseDateInputToMs, toDateInputValue } from "../../lib/datetime";
import { BottomSheet } from "./BottomSheet";
import { ConfirmSheet, deleteItemMessage } from "./ConfirmSheet";

type AddCreditSheetProps = {
  open: boolean;
  onClose: () => void;
  userId: Doc<"users">["_id"] | null;
  editCredit?: CreditActivityRowData | null;
  defaultEventId?: Id<"events">;
};

type CreditMode = "loan" | "credit_card";

function parseNum(value: string) {
  const n = Number.parseFloat(value.replace(/,/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

function numToInput(value: number | undefined) {
  return value !== undefined && value > 0 ? String(value) : "";
}

function creditModeFromType(type: CreditActivityRowData["type"]): CreditMode {
  return type === "credit_card" ? "credit_card" : "loan";
}

export function AddCreditSheet({ open, onClose, userId, editCredit = null, defaultEventId }: AddCreditSheetProps) {
  const createCredit = useMutation(api.credits.create);
  const updateCredit = useMutation(api.credits.update);
  const removeCredit = useMutation(api.credits.remove);
  const events = useQuery(api.events.list, userId && open ? { userId } : "skip");

  const isEdit = editCredit !== null;

  const [mode, setMode] = useState<CreditMode>("loan");
  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [loanBalance, setLoanBalance] = useState("");
  const [startDate, setStartDate] = useState(toDateInputValue());
  const [creditLimit, setCreditLimit] = useState("");
  const [balance, setBalance] = useState("");
  const [lastFour, setLastFour] = useState("");
  const [note, setNote] = useState("");
  const [addAsIncome, setAddAsIncome] = useState(false);
  const [eventId, setEventId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (editCredit) {
      const editMode = creditModeFromType(editCredit.type);
      setMode(editMode);
      setName(editCredit.name);
      setIssuer(editCredit.issuer ?? "");
      setStartDate(
        editCredit.startDate ? toDateInputValue(new Date(editCredit.startDate)) : toDateInputValue(),
      );
      setNote(editCredit.note ?? "");
      setEventId(editCredit.eventId ?? "");
      setLastFour(editCredit.lastFour ?? "");

      if (editMode === "loan") {
        setLoanAmount(numToInput(editCredit.creditLimit));
        setLoanBalance(numToInput(editCredit.balance));
      } else {
        setCreditLimit(numToInput(editCredit.creditLimit));
        setBalance(numToInput(editCredit.balance));
      }
    } else {
      setMode("loan");
      setName("");
      setIssuer("");
      setLoanAmount("");
      setLoanBalance("");
      setStartDate(toDateInputValue());
      setCreditLimit("");
      setBalance("");
      setLastFour("");
      setNote("");
      setEventId(defaultEventId ?? "");
      setAddAsIncome(false);
    }

    setError("");
    setDeleteConfirmOpen(false);
  }, [open, editCredit, defaultEventId]);

  const handleSave = async () => {
    if (!userId) {
      setError("Please sign in to save.");
      return;
    }
    if (!name.trim()) {
      setError(mode === "loan" ? "Enter a loan provider name." : "Enter a card name.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      if (mode === "loan") {
        const amount = parseNum(loanAmount);
        const owed = isEdit ? parseNum(loanBalance) : amount;

        if (!Number.isFinite(amount) || amount <= 0) {
          throw new Error("Enter a valid loan amount.");
        }
        if (!Number.isFinite(owed) || owed < 0) {
          throw new Error("Enter a valid remaining balance.");
        }
        if (owed > amount) {
          throw new Error("Remaining balance cannot exceed the loan amount.");
        }

        const parsedEventId = eventId ? (eventId as Id<"events">) : undefined;

        const payload = {
          userId,
          name: name.trim(),
          type: "personal_loan" as const,
          creditLimit: amount,
          balance: owed,
          note: note.trim() || undefined,
          startDate: parseDateInputToMs(startDate),
          eventId: parsedEventId,
        };

        if (isEdit && editCredit) {
          await updateCredit({
            ...payload,
            creditId: editCredit.id as Id<"credits">,
          });
        } else {
          await createCredit({ ...payload, emiPaidCount: 0, addAsIncome });
        }
      } else {
        const limit = parseNum(creditLimit);
        const owed = parseNum(balance);

        if (!Number.isFinite(limit) || limit <= 0) {
          throw new Error("Enter a valid credit limit.");
        }
        if (!Number.isFinite(owed) || owed < 0) {
          throw new Error("Enter a valid current balance.");
        }
        if (owed > limit) {
          throw new Error("Balance cannot exceed the credit limit.");
        }

        const parsedEventId = eventId ? (eventId as Id<"events">) : undefined;

        const payload = {
          userId,
          name: name.trim(),
          type: "credit_card" as const,
          issuer: issuer.trim() || undefined,
          creditLimit: limit,
          balance: owed,
          lastFour: lastFour.trim() || undefined,
          note: note.trim() || undefined,
          eventId: parsedEventId,
        };

        if (isEdit && editCredit) {
          await updateCredit({
            ...payload,
            creditId: editCredit.id as Id<"credits">,
          });
        } else {
          await createCredit({ ...payload, addAsIncome });
        }
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!userId || !editCredit) return;

    setBusy(true);
    setError("");
    try {
      await removeCredit({
        userId,
        creditId: editCredit.id as Id<"credits">,
      });
      setDeleteConfirmOpen(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
    } finally {
      setBusy(false);
    }
  };

  const sheetTitle = isEdit
    ? mode === "loan"
      ? "Edit Loan"
      : "Edit Credit Card"
    : "Add Loan / Credit";

  const saveLabel = isEdit
    ? mode === "loan"
      ? "Update Loan"
      : "Update Credit Card"
    : mode === "loan"
      ? "Save Loan"
      : "Save Credit Card";

  return (
    <>
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
              className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-teal-brand to-teal-deep py-3.5 text-[0.9375rem] font-semibold text-white shadow-[0_10px_24px_rgba(13,148,136,0.28)] transition-transform active:scale-[0.98] disabled:opacity-60"
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
                onClick={() => setDeleteConfirmOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-[16px] border border-rose-200 bg-rose-50 py-3 text-[0.875rem] font-semibold text-rose-600 transition-colors hover:bg-rose-100 disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>
            ) : null}
          </div>
        }
      >
        {!isEdit ? (
          <div className="mb-5 flex rounded-[14px] bg-white p-1 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
            {(
              [
                { id: "loan" as const, label: "Loan", icon: Landmark },
                { id: "credit_card" as const, label: "Credit Card", icon: CreditCard },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-[12px] py-2.5 text-[0.8125rem] font-semibold transition-colors ${
                  mode === id ? "bg-teal-brand text-white shadow-sm" : "text-ink-secondary"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="space-y-4 rounded-[20px] bg-white p-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
          <Field label={mode === "loan" ? "Loan Provider Name" : "Card Name"}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={mode === "loan" ? "HDFC Bank" : "Platinum Card"}
              className={inputClass}
            />
          </Field>

          {mode === "credit_card" ? (
            <Field label="Lender / Bank">
              <input
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="Select lender"
                className={inputClass}
              />
            </Field>
          ) : null}

          {mode === "loan" ? (
            <>
              <Field label="Loan Amount">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">₹</span>
                  <input
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value.replace(/[^\d.]/g, ""))}
                    inputMode="decimal"
                    placeholder="0"
                    className={`${inputClass} pl-7`}
                  />
                </div>
              </Field>

              {isEdit ? (
                <Field label="Remaining Balance">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">₹</span>
                    <input
                      value={loanBalance}
                      onChange={(e) => setLoanBalance(e.target.value.replace(/[^\d.]/g, ""))}
                      inputMode="decimal"
                      placeholder="0"
                      className={`${inputClass} pl-7`}
                    />
                  </div>
                </Field>
              ) : null}

              <Field label="Start Date">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Credit Limit">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">₹</span>
                    <input
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(e.target.value.replace(/[^\d.]/g, ""))}
                      inputMode="decimal"
                      placeholder="0"
                      className={`${inputClass} pl-7`}
                    />
                  </div>
                </Field>
                <Field label="Current Balance">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">₹</span>
                    <input
                      value={balance}
                      onChange={(e) => setBalance(e.target.value.replace(/[^\d.]/g, ""))}
                      inputMode="decimal"
                      placeholder="0"
                      className={`${inputClass} pl-7`}
                    />
                  </div>
                </Field>
              </div>

              <Field label="Last 4 Digits (Optional)">
                <input
                  value={lastFour}
                  onChange={(e) => setLastFour(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  inputMode="numeric"
                  placeholder="1234"
                  maxLength={4}
                  className={inputClass}
                />
              </Field>
            </>
          )}

          {!isEdit ? (
            <label className="flex cursor-pointer items-start gap-3 rounded-[12px] border border-surface-border bg-surface px-3 py-3">
              <input
                type="checkbox"
                checked={addAsIncome}
                onChange={(e) => setAddAsIncome(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-surface-border text-teal-brand focus:ring-teal-brand/30"
              />
              <span className="min-w-0">
                <span className="block text-[0.8125rem] font-semibold text-ink">
                  Also add as income
                </span>
                <span className="mt-0.5 block text-[0.75rem] leading-relaxed text-ink-secondary">
                  Creates a matching income entry for the {mode === "loan" ? "loan amount" : "credit limit"}.
                </span>
              </span>
            </label>
          ) : null}

          <Field label="Note (Optional)">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note"
              rows={3}
              className={`${inputClass} resize-none py-3`}
            />
          </Field>

          <Field label="Event (Optional)">
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              disabled={!userId || events === undefined}
              className={inputClass}
            >
              <option value="">No event</option>
              {(events ?? []).map((event) => (
                <option key={event._id} value={event._id}>
                  {event.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </BottomSheet>

      <ConfirmSheet
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete item?"
        message={editCredit ? deleteItemMessage(editCredit.name) : ""}
        confirmLabel="Delete"
        busy={busy}
      />
    </>
  );
}

const inputClass =
  "w-full rounded-[12px] border border-surface-border bg-white px-3 py-2.5 text-[0.875rem] text-ink placeholder:text-ink-muted/70 focus:border-teal-brand/40 focus:outline-none focus:ring-2 focus:ring-teal-brand/15";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.75rem] font-semibold text-ink-secondary">{label}</span>
      {children}
    </label>
  );
}
