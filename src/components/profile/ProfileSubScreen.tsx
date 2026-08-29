import { ArrowLeft, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

type ProfileSubScreenProps = {
  title: string;
  backTo?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function ProfileSubScreen({
  title,
  backTo = "/home/profile",
  action,
  children,
  footer,
}: ProfileSubScreenProps) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-full flex-col px-5 pb-6 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="mx-auto flex w-full max-w-[390px] flex-1 flex-col">
        <header className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(backTo)}
            aria-label="Go back"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-white text-ink-secondary shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </button>
          <h1 className="min-w-0 flex-1 font-display text-[1.125rem] font-bold text-ink">{title}</h1>
          {action ? <div className="shrink-0">{action}</div> : <div className="w-10" />}
        </header>

        <div className="flex-1 space-y-5">{children}</div>

        {footer ? <div className="mt-6 shrink-0">{footer}</div> : null}
      </div>
    </div>
  );
}

export function ProfileField({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.75rem] font-medium text-ink-muted">{label}</span>
      <div className="flex items-center gap-3 rounded-[14px] border border-surface-border bg-white px-3.5 py-3 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
        {Icon ? <Icon className="h-[18px] w-[18px] shrink-0 text-ink-muted" strokeWidth={2} /> : null}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </label>
  );
}

export function ProfileToggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-pill transition-colors ${
        disabled ? "cursor-not-allowed bg-slate-200 opacity-60" : checked ? "bg-teal-brand" : "bg-slate-200"
      }`}
    >
      <span
        className={`pointer-events-none absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
          checked && !disabled ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export function ProfileCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-card bg-white shadow-soft ${className}`}>{children}</div>
  );
}

export function ProfileSelect({
  value,
  onChange,
  options,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={`relative shrink-0 ${className}`}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-[7.25rem] appearance-none rounded-[12px] border border-surface-border bg-white py-2 pl-3 pr-9 text-[0.8125rem] font-semibold text-ink shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-colors focus:border-teal-brand/40 focus:outline-none focus:ring-2 focus:ring-teal-brand/15"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
        strokeWidth={2.5}
        aria-hidden
      />
    </div>
  );
}
