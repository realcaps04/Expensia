import { ChevronRight, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

type ProfileMenuRowProps = {
  icon: LucideIcon;
  label: string;
  to?: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
};

export function ProfileMenuRow({
  icon: Icon,
  label,
  to,
  onClick,
  trailing,
  danger = false,
  disabled = false,
}: ProfileMenuRowProps) {
  const className = `flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors ${
    danger ? "text-expense" : "text-ink"
  } ${disabled ? "cursor-not-allowed opacity-50" : "active:bg-slate-50"}`;

  const content = (
    <>
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          danger ? "bg-rose-50 text-expense" : "bg-slate-50 text-ink-secondary"
        }`}
      >
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1 text-[0.9375rem] font-medium">{label}</span>
      {trailing ?? (
        <ChevronRight className="h-5 w-5 shrink-0 text-ink-muted" strokeWidth={2} />
      )}
    </>
  );

  if (to && !disabled) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      {content}
    </button>
  );
}

export function ProfileMenuSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="mb-2 px-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-ink-muted">
        {title}
      </p>
      <div className="overflow-hidden rounded-card bg-white shadow-soft">{children}</div>
    </section>
  );
}

export function ProfileMenuDivider() {
  return <div className="mx-4 border-t border-surface-border" />;
}
