import type { FormEvent } from "react";
import { MailOpen } from "lucide-react";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import {
  AuthFlowLayout,
  AuthFormError,
  AuthPrimaryButton,
  handleAuthSubmit,
} from "../components/auth/AuthFlowLayout";
import { AuthIllustration } from "../components/auth/AuthIllustration";
import { OtpInput } from "../components/auth/OtpInput";
import {
  loadPasswordResetSession,
  savePasswordResetSession,
} from "../lib/password-reset-session";

type VerifyLocationState = {
  email: string;
  expiresAt: number;
};

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function VerifyResetCodeScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as VerifyLocationState | null;
  const stored = loadPasswordResetSession();
  const email = routeState?.email ?? stored?.email ?? "";
  const verifyCode = useMutation(api.passwordReset.verifyPasswordResetCode);
  const requestReset = useMutation(api.passwordReset.requestPasswordReset);

  const [code, setCode] = useState("");
  const [expiresAt, setExpiresAt] = useState(routeState?.expiresAt ?? stored?.expiresAt ?? 0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);

  useEffect(() => {
    const tick = () => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleSubmit = (event: FormEvent) => {
    handleAuthSubmit(
      event,
      async () => {
        const result = await verifyCode({ email, code });
        savePasswordResetSession({
          email,
          resetToken: result.resetToken,
        });
        navigate("/forgot-password/new-password", {
          replace: true,
          state: {
            email,
            resetToken: result.resetToken,
          },
        });
      },
      setError,
      setBusy,
    );
  };

  const handleResend = async () => {
    setError("");
    setResendBusy(true);
    try {
      const result = await requestReset({ email });
      setExpiresAt(result.expiresAt);
      savePasswordResetSession({ email, expiresAt: result.expiresAt });
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend code.");
    } finally {
      setResendBusy(false);
    }
  };

  return (
    <AuthFlowLayout backTo="/forgot-password">
      <AuthIllustration icon={MailOpen} accent="sky" />

      <div className="mt-8 text-center">
        <h2 className="font-display text-[1.625rem] font-semibold tracking-tight text-ink">
          Check Your Email
        </h2>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-secondary">
          We&apos;ve sent a 6-digit verification code to{" "}
          <span className="font-semibold text-teal-brand">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <OtpInput value={code} onChange={setCode} disabled={busy} />

        <p className="text-center text-[0.8125rem] text-ink-secondary">
          Code expires in{" "}
          <span className="font-semibold text-teal-brand">{formatCountdown(secondsLeft)}</span>
        </p>

        {error ? <AuthFormError message={error} /> : null}

        <AuthPrimaryButton disabled={busy || code.length !== 6 || secondsLeft === 0}>
          Verify Code
        </AuthPrimaryButton>
      </form>

      <p className="mt-8 pb-2 text-center text-[0.9375rem] text-ink-secondary">
        Didn&apos;t receive the code?{" "}
        <button
          type="button"
          disabled={resendBusy}
          onClick={() => void handleResend()}
          className="font-semibold text-teal-brand transition-colors hover:text-teal-deep disabled:opacity-50"
        >
          {resendBusy ? "Sending…" : "Resend Code"}
        </button>
      </p>

      {secondsLeft === 0 ? (
        <p className="pb-2 text-center text-[0.8125rem] text-ink-muted">
          Code expired.{" "}
          <Link to="/forgot-password" className="font-semibold text-teal-brand">
            Request a new one
          </Link>
        </p>
      ) : null}
    </AuthFlowLayout>
  );
}
