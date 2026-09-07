import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCloseOnBack } from "../../hooks/useCloseOnBack";
import {
  BALANCE_PERIOD_PRESETS,
  type BalancePeriod,
  isSameBalancePeriod,
  presetFromKind,
} from "../../lib/balance-period";
import { toDateInputValue } from "../../lib/datetime";
import { DatePicker, MonthPicker } from "../ui/DatePicker";

type BalancePeriodMenuProps = {
  open: boolean;
  onClose: () => void;
  period: BalancePeriod;
  onChange: (period: BalancePeriod) => void;
};

function monthInputValue() {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${m}`;
}

export function BalancePeriodMenu({ open, onClose, period, onChange }: BalancePeriodMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [customDate, setCustomDate] = useState(
    period.kind === "date" ? period.date : toDateInputValue(),
  );
  const [customMonth, setCustomMonth] = useState(
    period.kind === "monthKey" ? period.monthKey : monthInputValue(),
  );

  useCloseOnBack(open, onClose);

  useEffect(() => {
    if (!open) return;
    setCustomDate(period.kind === "date" ? period.date : toDateInputValue());
    setCustomMonth(period.kind === "monthKey" ? period.monthKey : monthInputValue());
  }, [open, period]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (menuRef.current?.contains(target)) return;
      if (target.closest('[role="dialog"]')) return;
      onClose();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const selectPreset = (kind: BalancePeriod["kind"]) => {
    onChange(presetFromKind(kind));
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-[calc(100%+0.5rem)] z-20 w-[min(17rem,calc(100vw-2.5rem))] overflow-hidden rounded-[18px] border border-surface-border bg-white shadow-[0_12px_40px_rgba(15,23,42,0.14)]"
      role="menu"
      aria-label="Balance period"
    >
      <div className="p-1.5">
        {BALANCE_PERIOD_PRESETS.map(({ id, label }) => {
          const active = isSameBalancePeriod(period, presetFromKind(id));
          return (
            <button
              key={id}
              type="button"
              role="menuitem"
              onClick={() => selectPreset(id)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[0.8125rem] font-medium transition-colors ${
                active ? "bg-teal-brand/10 text-teal-deep" : "text-ink hover:bg-slate-50"
              }`}
            >
              {label}
              {active ? <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} /> : null}
            </button>
          );
        })}
      </div>

      <div className="border-t border-surface-border px-3 py-2.5">
        <p className="mb-2 px-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-ink-muted">
          Custom
        </p>
        <div className="space-y-2">
          <div className="space-y-1.5 rounded-xl bg-surface px-3 py-2.5">
            <span className="text-[0.8125rem] font-medium text-ink-secondary">Pick a date</span>
            <DatePicker
              value={customDate}
              max={toDateInputValue()}
              onChange={(date) => {
                setCustomDate(date);
                onChange({ kind: "date", date });
                onClose();
              }}
              ariaLabel="Pick a date"
            />
          </div>
          <div className="space-y-1.5 rounded-xl bg-surface px-3 py-2.5">
            <span className="text-[0.8125rem] font-medium text-ink-secondary">Pick a month</span>
            <MonthPicker
              value={customMonth}
              max={monthInputValue()}
              onChange={(monthKey) => {
                setCustomMonth(monthKey);
                onChange({ kind: "monthKey", monthKey });
                onClose();
              }}
              ariaLabel="Pick a month"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
