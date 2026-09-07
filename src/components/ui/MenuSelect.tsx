import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCloseOnBack } from "../../hooks/useCloseOnBack";

export type MenuSelectOption = { value: string; label: string };

type MenuSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: readonly MenuSelectOption[];
  disabled?: boolean;
  ariaLabel?: string;
  variant?: "input" | "field";
};

const PANEL_CLASS =
  "max-h-56 overflow-y-auto rounded-[14px] border border-surface-border bg-white p-1.5 shadow-[0_12px_40px_rgba(15,23,42,0.14)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

export function MenuSelect({
  value,
  onChange,
  options,
  disabled,
  ariaLabel,
  variant = "input",
}: MenuSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{
    left: number;
    width: number;
    top: number;
    bottom: number;
    openUp: boolean;
  } | null>(null);
  const selected = options.find((option) => option.value === value) ?? options[0];
  const listId = useId();

  useCloseOnBack(open, () => setOpen(false));

  const updateCoords = () => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = Math.max(rect.width, variant === "field" ? 220 : rect.width);
    const left = Math.min(Math.max(12, rect.left), Math.max(12, window.innerWidth - width - 12));
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < 224 && rect.top > spaceBelow;
    setCoords({
      left,
      width,
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

  const triggerClass =
    variant === "field"
      ? "-mr-8 flex w-full min-w-0 items-center justify-between gap-2 bg-transparent pr-8 text-left text-[0.875rem] font-semibold text-ink focus:outline-none disabled:opacity-50"
      : "flex w-full items-center justify-between gap-2 rounded-[12px] border border-surface-border bg-white px-3 py-2.5 text-left text-[0.8125rem] font-medium text-ink shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-colors focus:border-teal-brand/40 focus:outline-none focus:ring-2 focus:ring-teal-brand/15 disabled:opacity-50";

  return (
    <div ref={wrapRef} className="relative block">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen((current) => !current);
        }}
        className={triggerClass}
      >
        <span className="min-w-0 truncate">{selected?.label ?? "Select"}</span>
        {variant === "input" ? (
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-ink-muted transition-transform ${open ? "rotate-180" : ""}`}
            strokeWidth={2.5}
            aria-hidden
          />
        ) : null}
      </button>

      {open && coords && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={panelRef}
              id={listId}
              role="listbox"
              aria-label={ariaLabel}
              className={`fixed z-[120] ${PANEL_CLASS}`}
              style={{
                left: coords.left,
                width: coords.width,
                ...(coords.openUp ? { bottom: coords.bottom } : { top: coords.top }),
              }}
            >
              {options.map((option) => {
                const active = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-[0.8125rem] font-medium transition-colors ${
                      active
                        ? "bg-teal-brand/10 text-teal-deep"
                        : "text-ink hover:bg-slate-50"
                    }`}
                  >
                    <span className="min-w-0 truncate">{option.label}</span>
                    {active ? <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} /> : null}
                  </button>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
