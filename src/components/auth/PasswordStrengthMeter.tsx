import { passwordStrengthLabel } from "../../lib/password-strength";

type PasswordStrengthMeterProps = {
  password: string;
};

const BAR_COLORS = {
  Weak: ["bg-rose-400", "bg-slate-200", "bg-slate-200"],
  Fair: ["bg-amber-400", "bg-amber-400", "bg-slate-200"],
  Strong: ["bg-teal-brand", "bg-teal-brand", "bg-teal-brand"],
} as const;

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  if (!password) return null;

  const label = passwordStrengthLabel(password);
  const colors = BAR_COLORS[label];

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1.5">
          {colors.map((color, index) => (
            <span key={index} className={`h-1.5 flex-1 rounded-full ${color}`} />
          ))}
        </div>
        <span className="text-[0.75rem] font-semibold text-ink-secondary">{label}</span>
      </div>
      <p className="mt-2 text-[0.75rem] leading-relaxed text-ink-muted">
        Password must be at least 8 characters with a mix of letters, numbers &amp; symbols.
      </p>
    </div>
  );
}
