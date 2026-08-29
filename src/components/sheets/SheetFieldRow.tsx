import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

type SheetFieldRowProps = {
  icon: ReactNode;
  label: string;
  children: ReactNode;
};

export function SheetFieldRow({ icon, label, children }: SheetFieldRowProps) {
  return (
    <div className="flex items-center gap-3 border-b border-surface-border/80 py-3.5 last:border-b-0">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-ink-muted">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.6875rem] font-medium text-ink-muted">{label}</p>
        <div className="mt-0.5">{children}</div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-ink-muted/70" aria-hidden />
    </div>
  );
}

type SheetSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  disabled?: boolean;
};

export function SheetSelect({ value, onChange, options, disabled }: SheetSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full appearance-none bg-transparent text-[0.875rem] font-semibold text-ink focus:outline-none disabled:opacity-50"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

type SheetNativeInputProps = {
  type: "date" | "time" | "text";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  displayValue?: string;
};

export function SheetNativeInput({
  type,
  value,
  onChange,
  placeholder,
  displayValue,
}: SheetNativeInputProps) {
  if (type === "text") {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[0.875rem] font-semibold text-ink placeholder:font-normal placeholder:text-ink-muted focus:outline-none"
      />
    );
  }

  return (
    <div className="relative">
      <span className="pointer-events-none text-[0.875rem] font-semibold text-ink">
        {displayValue ?? value}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0"
      />
    </div>
  );
}
