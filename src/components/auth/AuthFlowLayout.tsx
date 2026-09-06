import type { FormEvent, ReactNode } from "react";
import { motion } from "framer-motion";
import { AuthBackground } from "../brand/AuthBackground";
import { BrandLockup } from "../brand/ExpensiaLogo";
import { AuthBackButton } from "./AuthBackButton";

type AuthFlowLayoutProps = {
  backTo?: string;
  children: ReactNode;
};

export function AuthPageShell({
  children,
  topPaddingClass = "pt-[max(2.5rem,env(safe-area-inset-top))]",
}: {
  children: ReactNode;
  topPaddingClass?: string;
}) {
  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-surface">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <AuthBackground />
      </div>

      <div
        className={`relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-[max(1.75rem,env(safe-area-inset-bottom))] ${topPaddingClass}`}
      >
        {children}
      </div>
    </div>
  );
}

export function AuthFlowLayout({ backTo = "/login", children }: AuthFlowLayoutProps) {
  return (
    <AuthPageShell topPaddingClass="pt-[max(2rem,env(safe-area-inset-top))]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-[360px]"
      >
        <AuthBackButton to={backTo} />
        <BrandLockup markSize={76} compact showTagline />
        {children}
      </motion.div>
    </AuthPageShell>
  );
}

export function AuthFormError({ message }: { message: string }) {
  return (
    <p className="rounded-[12px] bg-orange-50 px-3 py-2.5 text-[0.8125rem] font-medium text-orange-600">
      {message}
    </p>
  );
}

export function AuthPrimaryButton({
  children,
  disabled,
  type = "submit",
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="gradient-btn mt-1 flex w-full items-center justify-center gap-2 rounded-[14px] py-3.5 text-[0.9375rem] font-semibold text-white shadow-btn transition-transform active:scale-[0.98] disabled:opacity-60"
    >
      {children}
    </button>
  );
}

export function handleAuthSubmit(
  event: FormEvent,
  submit: () => Promise<void>,
  setError: (message: string) => void,
  setBusy: (busy: boolean) => void,
) {
  event.preventDefault();
  setError("");
  setBusy(true);
  void submit()
    .catch((err) => {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    })
    .finally(() => setBusy(false));
}
