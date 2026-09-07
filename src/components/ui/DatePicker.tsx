import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { useCloseOnBack } from "../../hooks/useCloseOnBack";
import { formatDisplayDate, formatMonthHeader, toDateInputValue } from "../../lib/datetime";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

function parseKey(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function clampDate(date: Date, min?: string, max?: string) {
  let next = date;
  if (min) {
    const minDate = parseKey(min);
    if (next < minDate) next = minDate;
  }
  if (max) {
    const maxDate = parseKey(max);
    if (next > maxDate) next = maxDate;
  }
  return next;
}

function isDisabled(date: Date, min?: string, max?: string) {
  if (min && date < parseKey(min)) return true;
  if (max && date > parseKey(max)) return true;
  return false;
}

type PanelCoords = {
  left: number;
  top: number;
  bottom: number;
  openUp: boolean;
};

function usePickerPanel(open: boolean, wrapRef: RefObject<HTMLDivElement | null>) {
  const [coords, setCoords] = useState<PanelCoords | null>(null);

  const updateCoords = () => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const panelH = 360;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < panelH && rect.top > spaceBelow;
    const width = 300;
    const left = Math.min(Math.max(12, rect.right - width), window.innerWidth - width - 12);
    setCoords({
      left: Math.max(12, left),
      top: rect.bottom + 6,
      bottom: window.innerHeight - rect.top + 6,
      openUp,
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    updateCoords();
    const onReposition = () => updateCoords();
    window.addEventListener("resize", onReposition);
    document.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      document.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  return coords;
}

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  variant?: "field" | "input";
  displayValue?: string;
  ariaLabel?: string;
  allowClear?: boolean;
  placeholder?: string;
};

export function DatePicker({
  value,
  onChange,
  min,
  max,
  variant = "input",
  displayValue,
  ariaLabel = "Pick a date",
  allowClear = false,
  placeholder = "Select date",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const coords = usePickerPanel(open, wrapRef);
  const selected = value ? parseKey(value) : null;
  const [view, setView] = useState(() => selected ?? new Date());

  useCloseOnBack(open, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    setView(selected ?? clampDate(new Date(), min, max));
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (wrapRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const days = useMemo(() => {
    const year = view.getFullYear();
    const month = view.getMonth();
    const first = new Date(year, month, 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }, [view]);

  const label =
    displayValue ??
    (value ? formatDisplayDate(value) : placeholder);

  const triggerClass =
    variant === "field"
      ? "-mr-8 flex w-full min-w-0 items-center bg-transparent pr-8 text-left text-[0.875rem] font-semibold text-ink focus:outline-none"
      : "flex w-full items-center justify-between gap-2 rounded-[12px] border border-surface-border bg-white px-3 py-2.5 text-left text-[0.8125rem] font-medium text-ink shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-colors focus:border-teal-brand/40 focus:outline-none focus:ring-2 focus:ring-teal-brand/15";

  const today = toDateInputValue();
  const canGoPrev = !min || new Date(view.getFullYear(), view.getMonth(), 0) >= parseKey(min);
  const canGoNext =
    !max || new Date(view.getFullYear(), view.getMonth() + 1, 1) <= parseKey(max);

  return (
    <div ref={wrapRef} className="relative block">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)}
        className={triggerClass}
      >
        <span className={`min-w-0 truncate ${!value ? "font-normal text-ink-muted" : ""}`}>
          {label}
        </span>
      </button>

      {open && coords && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={panelRef}
              role="dialog"
              aria-label={ariaLabel}
              className="fixed z-[120] w-[300px] overflow-hidden rounded-[18px] border border-surface-border bg-white p-3 shadow-[0_16px_48px_rgba(15,23,42,0.18)]"
              style={{
                left: coords.left,
                ...(coords.openUp ? { bottom: coords.bottom } : { top: coords.top }),
              }}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="px-1 font-display text-[0.9375rem] font-semibold text-ink">
                  {MONTHS[view.getMonth()]} {view.getFullYear()}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Previous month"
                    disabled={!canGoPrev}
                    onClick={() =>
                      setView((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-[var(--bg-muted)] hover:text-ink disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next month"
                    disabled={!canGoNext}
                    onClick={() =>
                      setView((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-[var(--bg-muted)] hover:text-ink disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
                  </button>
                </div>
              </div>

              <div className="mb-1 grid grid-cols-7 gap-0.5">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="py-1 text-center text-[0.6875rem] font-semibold text-ink-muted"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {days.map((date) => {
                  const key = toDateInputValue(date);
                  const inMonth = date.getMonth() === view.getMonth();
                  const selectedDay = selected ? sameDay(date, selected) : false;
                  const isToday = sameDay(date, new Date());
                  const disabled = isDisabled(date, min, max);

                  return (
                    <button
                      key={key + String(inMonth)}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        onChange(key);
                        setOpen(false);
                      }}
                      className={`flex h-9 items-center justify-center rounded-[10px] text-[0.8125rem] font-semibold transition-colors ${
                        selectedDay
                          ? "bg-teal-brand text-white shadow-sm"
                          : disabled
                            ? "cursor-not-allowed text-ink-muted/35"
                            : inMonth
                              ? isToday
                                ? "bg-teal-brand/10 text-teal-deep hover:bg-teal-brand/15"
                                : "text-ink hover:bg-[var(--bg-muted)]"
                              : "text-ink-muted/55 hover:bg-[var(--bg-muted)]"
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-surface-border pt-2.5">
                {allowClear ? (
                  <button
                    type="button"
                    onClick={() => {
                      onChange("");
                      setOpen(false);
                    }}
                    className="rounded-lg px-2 py-1.5 text-[0.75rem] font-semibold text-ink-muted transition-colors hover:text-ink"
                  >
                    Clear
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  disabled={isDisabled(new Date(), min, max)}
                  onClick={() => {
                    onChange(today);
                    setOpen(false);
                  }}
                  className="rounded-lg px-2 py-1.5 text-[0.75rem] font-semibold text-teal-brand transition-colors hover:text-teal-deep disabled:opacity-40"
                >
                  Today
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

type MonthPickerProps = {
  value: string;
  onChange: (value: string) => void;
  max?: string;
  ariaLabel?: string;
};

export function MonthPicker({
  value,
  onChange,
  max,
  ariaLabel = "Pick a month",
}: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const coords = usePickerPanel(open, wrapRef);
  const [year, setYear] = useState(() => {
    if (value) return Number(value.split("-")[0]);
    return new Date().getFullYear();
  });

  useCloseOnBack(open, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    setYear(value ? Number(value.split("-")[0]) : new Date().getFullYear());
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (wrapRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const maxYear = max ? Number(max.split("-")[0]) : new Date().getFullYear() + 5;
  const maxMonth = max ? Number(max.split("-")[1]) : 12;
  const label = value ? formatMonthHeader(value) : "Select month";

  return (
    <div ref={wrapRef} className="relative block">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-2 rounded-[12px] border border-surface-border bg-white px-3 py-2.5 text-left text-[0.8125rem] font-medium text-ink shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
      >
        <span className="min-w-0 truncate">{label}</span>
      </button>

      {open && coords && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={panelRef}
              role="dialog"
              aria-label={ariaLabel}
              className="fixed z-[120] w-[280px] overflow-hidden rounded-[18px] border border-surface-border bg-white p-3 shadow-[0_16px_48px_rgba(15,23,42,0.18)]"
              style={{
                left: coords.left,
                ...(coords.openUp ? { bottom: coords.bottom } : { top: coords.top }),
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <button
                  type="button"
                  aria-label="Previous year"
                  onClick={() => setYear((y) => y - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink-secondary hover:bg-[var(--bg-muted)] hover:text-ink"
                >
                  <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
                </button>
                <p className="font-display text-[0.9375rem] font-semibold text-ink">{year}</p>
                <button
                  type="button"
                  aria-label="Next year"
                  disabled={year >= maxYear}
                  onClick={() => setYear((y) => y + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink-secondary hover:bg-[var(--bg-muted)] hover:text-ink disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {MONTHS.map((month, index) => {
                  const monthKey = `${year}-${String(index + 1).padStart(2, "0")}`;
                  const disabled = year > maxYear || (year === maxYear && index + 1 > maxMonth);
                  const active = value === monthKey;
                  return (
                    <button
                      key={month}
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        onChange(monthKey);
                        setOpen(false);
                      }}
                      className={`rounded-[12px] px-2 py-2.5 text-[0.75rem] font-semibold transition-colors ${
                        active
                          ? "bg-teal-brand text-white"
                          : disabled
                            ? "cursor-not-allowed text-ink-muted/35"
                            : "bg-[var(--bg-muted)] text-ink hover:bg-teal-brand/10 hover:text-teal-deep"
                      }`}
                    >
                      {month.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
