import { useGoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import { fetchGoogleProfile } from "../../lib/google-auth";
import { GoogleIcon } from "./GoogleIcon";

type GoogleSignInButtonProps = {
  onError?: (message: string) => void;
  redirectTo?: string;
};

export function GoogleSignInButton({
  onError,
  redirectTo = "/home",
}: GoogleSignInButtonProps) {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const login = useGoogleLogin({
    scope: "openid profile email",
    onSuccess: async (response) => {
      setBusy(true);
      try {
        const profile = await fetchGoogleProfile(response.access_token);
        await signInWithGoogle(profile);
        navigate(redirectTo, { replace: true });
      } catch {
        onError?.("Google sign-in failed. Please try again.");
      } finally {
        setBusy(false);
      }
    },
    onError: () => {
      onError?.(
        `Google sign-in blocked. Add ${window.location.origin} under Authorized JavaScript origins in Google Cloud Console.`,
      );
    },
  });

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => login()}
      className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-surface-border bg-white py-3 text-[0.8125rem] font-medium text-ink shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:border-slate-200 hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {busy ? (
        <Loader2 className="h-[18px] w-[18px] animate-spin text-ink-muted" aria-hidden />
      ) : (
        <GoogleIcon size={18} />
      )}
      Google
    </button>
  );
}
