import type { FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleSignInButton } from "../components/auth/GoogleSignInButton";
import { AuthBackground } from "../components/brand/AuthBackground";
import { BrandLockup } from "../components/brand/ExpensiaLogo";
import { TextField } from "../components/ui/TextField";
import { useAuth } from "../context/AuthProvider";

export function LoginScreen() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [googleError, setGoogleError] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      signIn(email, password);
      navigate("/home", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-surface">
      <AuthBackground />

      <div className="relative z-10 flex min-h-dvh flex-col overflow-y-auto px-6 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-[360px]"
        >
          <BrandLockup markSize={76} compact />

          <div className="mt-8 text-center">
            <h2 className="font-display text-[1.625rem] font-semibold tracking-tight text-ink">
              Welcome back
            </h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-secondary">
              Log in to continue managing your finances.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
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

            <div>
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
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
              <div className="mt-2.5 flex justify-end">
                <button
                  type="button"
                  className="text-[0.8125rem] font-semibold text-teal-brand transition-colors hover:text-teal-deep"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {error ? (
              <p className="rounded-[12px] bg-red-50 px-3 py-2.5 text-[0.8125rem] font-medium text-red-600">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="gradient-btn mt-1 flex w-full items-center justify-center gap-2 rounded-[14px] py-3.5 text-[0.9375rem] font-semibold text-white shadow-btn transition-transform active:scale-[0.98]"
            >
              Log In
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
            New to Expensia?{" "}
            <Link
              to="/signup"
              className="font-semibold text-teal-brand transition-colors hover:text-teal-deep"
            >
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
