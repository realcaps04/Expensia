import type { FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleSignInButton } from "../components/auth/GoogleSignInButton";
import { AuthBackground } from "../components/brand/AuthBackground";
import { BrandLockup } from "../components/brand/ExpensiaLogo";
import { TextField } from "../components/ui/TextField";
import { useAuth } from "../context/AuthProvider";

export function SignUpScreen() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [googleError, setGoogleError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await signUp({ firstName, lastName, email, password });
      navigate("/home", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account.");
    }
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-surface">
      <AuthBackground />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-[360px]"
        >
          <BrandLockup markSize={76} compact />

          <div className="mt-8 text-center">
            <h2 className="font-display text-[1.625rem] font-semibold tracking-tight text-ink">
              Create your account
            </h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-secondary">
              Start tracking your money in minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="First Name"
                name="firstName"
                autoComplete="given-name"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                icon={<User className="h-[18px] w-[18px]" strokeWidth={1.75} />}
              />
              <TextField
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <TextField
              label="Email Address"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-[18px] w-[18px]" strokeWidth={1.75} />}
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="new-password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="h-[18px] w-[18px]" strokeWidth={1.75} />}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
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

            <TextField
              label="Confirm Password"
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock className="h-[18px] w-[18px]" strokeWidth={1.75} />}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="rounded-lg p-1.5 text-ink-muted transition-colors hover:text-ink-secondary"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? (
                    <EyeOff className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  ) : (
                    <Eye className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  )}
                </button>
              }
            />

            {error ? (
              <p className="rounded-[12px] bg-red-50 px-3 py-2.5 text-[0.8125rem] font-medium text-red-600">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="gradient-btn mt-1 flex w-full items-center justify-center gap-2 rounded-[14px] py-3.5 text-[0.9375rem] font-semibold text-white shadow-btn transition-transform active:scale-[0.98]"
            >
              Create Account
              <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.25} aria-hidden />
            </button>
          </form>

          <div className="mt-8 flex items-center gap-3">
            <span className="h-px flex-1 bg-surface-border" aria-hidden />
            <span className="text-[0.8125rem] text-ink-muted">or continue with</span>
            <span className="h-px flex-1 bg-surface-border" aria-hidden />
          </div>

          <div className="mt-5">
            <GoogleSignInButton onError={setGoogleError} />
          </div>

          {googleError ? (
            <p className="mt-3 rounded-[12px] bg-amber-50 px-3 py-2.5 text-[0.8125rem] font-medium text-amber-800">
              {googleError}
            </p>
          ) : null}

          <p className="mt-8 pb-2 text-center text-[0.9375rem] text-ink-secondary">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-teal-brand transition-colors hover:text-teal-deep"
            >
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
