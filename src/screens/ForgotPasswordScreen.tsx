import type { FormEvent } from "react";
import { ArrowRight, KeyRound, Mail } from "lucide-react";
import { useMutation } from "convex/react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import {
  AuthFlowLayout,
  AuthFormError,
  AuthPrimaryButton,
  handleAuthSubmit,
} from "../components/auth/AuthFlowLayout";
import { AuthIllustration } from "../components/auth/AuthIllustration";
import { TextField } from "../components/ui/TextField";
import { savePasswordResetSession } from "../lib/password-reset-session";

export function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const requestReset = useMutation(api.passwordReset.requestPasswordReset);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    handleAuthSubmit(
      event,
      async () => {
        const result = await requestReset({ email });
        const normalizedEmail = email.trim().toLowerCase();
        savePasswordResetSession({ email: normalizedEmail, expiresAt: result.expiresAt });
        navigate("/forgot-password/verify", {
          replace: true,
          state: { email: normalizedEmail, expiresAt: result.expiresAt },
        });
      },
      setError,
      setBusy,
    );
  };

  return (
    <AuthFlowLayout backTo="/login">
      <AuthIllustration icon={KeyRound} />

      <div className="mt-8 text-center">
        <h2 className="font-display text-[1.625rem] font-semibold tracking-tight text-ink">
          Forgot Password?
        </h2>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-secondary">
          No worries! Enter your registered email address and we&apos;ll send you instructions to
          reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <TextField
          label="Email Address"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          icon={<Mail className="h-[18px] w-[18px]" strokeWidth={1.75} />}
        />

        {error ? <AuthFormError message={error} /> : null}

        <AuthPrimaryButton disabled={busy || !email.trim()}>
          Send Reset Link
          <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.25} aria-hidden />
        </AuthPrimaryButton>
      </form>

      <p className="mt-8 pb-2 text-center text-[0.9375rem] text-ink-secondary">
        Remember your password?{" "}
        <Link
          to="/login"
          className="font-semibold text-teal-brand transition-colors hover:text-teal-deep"
        >
          Back to Login
        </Link>
      </p>
    </AuthFlowLayout>
  );
}
