import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type AuthBackButtonProps = {
  to?: string;
  label?: string;
};

export function AuthBackButton({ to = "/login", label = "Back" }: AuthBackButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => navigate(to)}
      className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-white text-ink-secondary shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-colors hover:text-ink"
    >
      <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2} />
    </button>
  );
}
