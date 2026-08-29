import type { InputHTMLAttributes, ReactNode } from "react";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  label: string;
  icon?: ReactNode;
  trailing?: ReactNode;
};

export function TextField({ label, icon, trailing, id, ...props }: TextFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={fieldId} className="text-[0.8125rem] font-semibold text-ink">
        {label}
      </label>
      <div className="relative flex items-center">
        {icon ? (
          <span className="pointer-events-none absolute left-4 text-ink-muted" aria-hidden>
            {icon}
          </span>
        ) : null}
        <input
          id={fieldId}
          className={`w-full rounded-[14px] border border-surface-border bg-white py-3.5 text-[0.9375rem] text-ink placeholder:text-ink-muted/70 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors focus:border-teal-brand/40 focus:outline-none focus:ring-2 focus:ring-teal-brand/15 ${icon ? "pl-11" : "pl-4"} ${trailing ? "pr-11" : "pr-4"}`}
          {...props}
        />
        {trailing ? <span className="absolute right-3 flex items-center">{trailing}</span> : null}
      </div>
    </div>
  );
}
