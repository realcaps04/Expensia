import type { ReactNode } from "react";
import { useMutation } from "convex/react";
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

export function AddCreditSheet({ open, onClose, userId, editCredit = null }: AddCreditSheetProps) {
  const createCredit = useMutation(api.credits.create);
  const updateCredit = useMutation(api.credits.update);
  const removeCredit = useMutation(api.credits.remove);

  const isEdit = editCredit !== null;

  const [mode, setMode] = useState<CreditMode>("loan");
  const [name, setName] = useState("");
  const [issuer, setIssuer] = useState("");
  const [loanAmount, setLoanAmount] = useState("");
  const [loanBalance, setLoanBalance] = useState("");
  const [apr, setApr] = useState("");
  const [emiAmount, setEmiAmount] = useState("");
  const [emiDay, setEmiDay] = useState("1");
  const [startDate, setStartDate] = useState(toDateInputValue());
  const [tenureMonths, setTenureMonths] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [balance, setBalance] = useState("");
  const [lastFour, setLastFour] = useState("");
  const [note, setNote] = useState("");
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
      setApr(numToInput(editCredit.apr));
      setEmiAmount(numToInput(editCredit.minimumPayment));
      setEmiDay(editCredit.dueDay ? String(editCredit.dueDay) : "1");
      setStartDate(
        editCredit.startDate ? toDateInputValue(new Date(editCredit.startDate)) : toDateInputValue(),
      );
      setTenureMonths(numToInput(editCredit.tenureMonths));
      setNote(editCredit.note ?? "");
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
      setApr("");
      setEmiAmount("");
      setEmiDay("1");
      setStartDate(toDateInputValue());
      setTenureMonths("");
      setCreditLimit("");
      setBalance("");
      setLastFour("");
      setNote("");
    }

    setError("");
    setDeleteConfirmOpen(false);
  }, [open, editCredit]);

  const handleSave = async () => {
    if (!userId) {
      setError("Please sign in to save.");
      return;
    }
    if (!name.trim()) {
      setError(mode === "loan" ? "Enter a loan name." : "Enter a card name.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      if (mode === "loan") {
        const amount = parseNum(loanAmount);
        const owed = isEdit ? parseNum(loanBalance) : amount;
        const rate = apr ? parseNum(apr) : undefined;
        const emi = emiAmount ? parseNum(emiAmount) : undefined;
        const tenure = tenureMonths ? Math.round(parseNum(tenureMonths)) : undefined;
        const day = Math.round(parseNum(emiDay));

        if (!Number.isFinite(amount) || amount <= 0) {
          throw new Error("Enter a valid loan amount.");
        }
        if (!Number.isFinite(owed) || owed < 0) {
          throw new Error("Enter a valid remaining balance.");
        }
        if (owed > amount) {
          throw new Error("Remaining balance cannot exceed the loan amount.");
        }
        if (!Number.isFinite(day) || day < 1 || day > 31) {
          throw new Error("EMI day must be between 1 and 31.");
        }

        const payload = {
          userId,
          name: name.trim(),
          type: "personal_loan" as const,
          issuer: issuer.trim() || undefined,
          creditLimit: amount,
          balance: owed,
          minimumPayment: emi,
          dueDay: day,
          apr: rate,
          note: note.trim() || undefined,
          startDate: parseDateInputToMs(startDate),
          tenureMonths: tenure,
        };

        if (isEdit && editCredit) {
          await updateCredit({
            ...payload,
            creditId: editCredit.id as Id<"credits">,
          });
        } else {
          await createCredit({ ...payload, emiPaidCount: 0 });
        }
      } else {
        const limit = parseNum(creditLimit);
        const owed = parseNum(balance);
        const rate = apr ? parseNum(apr) : undefined;
        const day = emiDay ? Math.round(parseNum(emiDay)) : undefined;

        if (!Number.isFinite(limit) || limit <= 0) {
          throw new Error("Enter a valid credit limit.");
        }
        if (!Number.isFinite(owed) || owed < 0) {
          throw new Error("Enter a valid current balance.");
        }
        if (owed > limit) {
          throw new Error("Balance cannot exceed the credit limit.");
        }

        const payload = {
          userId,
          name: name.trim(),
          type: "credit_card" as const,
          issuer: issuer.trim() || undefined,
          creditLimit: limit,
          balance: owed,
          dueDay: day,
          apr: rate,
          lastFour: lastFour.trim() || undefined,
          note: note.trim() || undefined,
        };

        if (isEdit && editCredit) {
          await updateCredit({
            ...payload,
            creditId: editCredit.id as Id<"credits">,
          });
        } else {
          await createCredit(payload);
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
          <Field label={mode === "loan" ? "Loan Name" : "Card Name"}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={mode === "loan" ? "Personal Loan" : "Platinum Card"}
              className={inputClass}
            />
          </Field>

          <Field label="Lender / Bank">
            <input
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              placeholder="Select lender"
              className={inputClass}
            />
          </Field>

          {mode === "loan" ? (
            <>
              <div className="grid grid-cols-2 gap-3">
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
                <Field label="Interest Rate (p.a.)">
                  <div className="relative">
                    <input
                      value={apr}
                      onChange={(e) => setApr(e.target.value.replace(/[^\d.]/g, ""))}
                      inputMode="decimal"
                      placeholder="0"
                      className={`${inputClass} pr-7`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">%</span>
                  </div>
                </Field>
              </div>

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

              <div className="grid grid-cols-2 gap-3">
                <Field label="EMI Amount">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">₹</span>
                    <input
                      value={emiAmount}
                      onChange={(e) => setEmiAmount(e.target.value.replace(/[^\d.]/g, ""))}
                      inputMode="decimal"
                      placeholder="0"
                      className={`${inputClass} pl-7`}
                    />
                  </div>
                </Field>
                <Field label="EMI Day">
                  <select
                    value={emiDay}
                    onChange={(e) => setEmiDay(e.target.value)}
                    className={inputClass}
                  >
                    {Array.from({ length: 31 }, (_, i) => String(i + 1)).map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Start Date">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Tenure (Months)">
                  <input
                    value={tenureMonths}
                    onChange={(e) => setTenureMonths(e.target.value.replace(/\D/g, ""))}
                    inputMode="numeric"
                    placeholder="12"
                    className={inputClass}
                  />
                </Field>
              </div>
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

              <div className="grid grid-cols-2 gap-3">
                <Field label="Due Day">
                  <select
                    value={emiDay}
                    onChange={(e) => setEmiDay(e.target.value)}
                    className={inputClass}
                  >
                    {Array.from({ length: 31 }, (_, i) => String(i + 1)).map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Interest Rate (p.a.)">
                  <div className="relative">
                    <input
                      value={apr}
                      onChange={(e) => setApr(e.target.value.replace(/[^\d.]/g, ""))}
                      inputMode="decimal"
                      placeholder="0"
                      className={`${inputClass} pr-7`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted">%</span>
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

          <Field label="Note (Optional)">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note"
              rows={3}
              className={`${inputClass} resize-none py-3`}
            />
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
