import type { FormEvent } from "react";
import { Eye, EyeOff, Lock, RotateCcw } from "lucide-react";
import { useMutation } from "convex/react";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import {
  AuthFlowLayout,
  AuthFormError,
  AuthPrimaryButton,
  handleAuthSubmit,
} from "../components/auth/AuthFlowLayout";
import { AuthIllustration } from "../components/auth/AuthIllustration";
import { PasswordStrengthMeter } from "../components/auth/PasswordStrengthMeter";
import { TextField } from "../components/ui/TextField";
import { validateNewPassword } from "../lib/password-strength";
import {
  clearPasswordResetSession,
  loadPasswordResetSession,
} from "../lib/password-reset-session";

type ResetLocationState = {
  email: string;
  resetToken: string;
};

export function ResetPasswordScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as ResetLocationState | null;
  const stored = loadPasswordResetSession();
  const email = routeState?.email ?? stored?.email ?? "";
  const resetToken = routeState?.resetToken ?? stored?.resetToken ?? "";
  const completeReset = useMutation(api.passwordReset.completePasswordReset);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!email || !resetToken) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleSubmit = (event: FormEvent) => {
    handleAuthSubmit(
      event,
      async () => {
        validateNewPassword(password);
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        await completeReset({
          email,
          resetToken,
          newPassword: password,
        });
        clearPasswordResetSession();
        navigate("/login", {
          replace: true,
          state: { resetSuccess: true },
        });
      },
      setError,
      setBusy,
    );
  };

  return (
    <AuthFlowLayout backTo="/forgot-password/verify">
      <AuthIllustration icon={RotateCcw} accent="violet" />

      <div className="mt-8 text-center">
        <h2 className="font-display text-[1.625rem] font-semibold tracking-tight text-ink">
          Create New Password
        </h2>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-secondary">
          Your new password must be different from previous used passwords.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <div>
          <TextField
            label="New Password"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="new-password"
            placeholder="Enter new password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            icon={<Lock className="h-[18px] w-[18px]" strokeWidth={1.75} />}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="rounded-lg p-1.5 text-ink-muted transition-colors hover:text-ink-secondary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-[18px] w-[18px]" strokeWidth={1.75} />
                ) : (
                  <Eye className="h-[18px] w-[18px]" strokeWidth={1.75} />
                )}
              </button>
            }
          />
          <PasswordStrengthMeter password={password} />
        </div>

        <TextField
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          icon={<Lock className="h-[18px] w-[18px]" strokeWidth={1.75} />}
          trailing={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="rounded-lg p-1.5 text-ink-muted transition-colors hover:text-ink-secondary"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-[18px] w-[18px]" strokeWidth={1.75} />
              ) : (
                <Eye className="h-[18px] w-[18px]" strokeWidth={1.75} />
              )}
            </button>
          }
        />

        {error ? <AuthFormError message={error} /> : null}

        <AuthPrimaryButton disabled={busy || !password || !confirmPassword}>
          Reset Password
        </AuthPrimaryButton>
      </form>
    </AuthFlowLayout>
  );
}
