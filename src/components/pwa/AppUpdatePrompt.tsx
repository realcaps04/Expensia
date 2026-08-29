import { Check, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { APP_VERSION, LATEST_UPDATES } from "../../lib/app-updates";
import { BottomSheet } from "../sheets/BottomSheet";

type AppUpdatePromptProps = {
  open: boolean;
  onDismiss: () => void;
  onUpdate: () => Promise<void>;
};

export function AppUpdatePrompt({ open, onDismiss, onUpdate }: AppUpdatePromptProps) {
  const [busy, setBusy] = useState(false);

  const handleUpdate = async () => {
    setBusy(true);
    try {
      await onUpdate();
    } finally {
      setBusy(false);
    }
  };

  return (
    <BottomSheet
      open={open}
      onClose={onDismiss}
      title="Update Available"
      footer={
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleUpdate()}
            className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-teal-brand to-teal-deep py-3.5 text-[0.9375rem] font-semibold text-white shadow-[0_10px_24px_rgba(13,148,136,0.28)] transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Check className="h-5 w-5" strokeWidth={2.5} />
                Update now
              </>
            )}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onDismiss}
            className="w-full rounded-[16px] border border-surface-border py-3 text-[0.875rem] font-semibold text-ink-secondary transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            Later
          </button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-teal-brand">
          <Sparkles className="h-8 w-8" strokeWidth={1.75} />
        </div>
        <h3 className="font-display text-[1.125rem] font-bold text-ink">A new version is ready</h3>
        <p className="mt-1 text-[0.8125rem] text-ink-secondary">
          Expensia v{APP_VERSION} — update inside the app to get the latest features.
        </p>
      </div>

      <div className="mt-6 rounded-[20px] bg-white px-4 py-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
        <p className="text-[0.75rem] font-semibold uppercase tracking-wide text-ink-muted">
          What&apos;s new
        </p>
        <ul className="mt-3 space-y-2.5">
          {LATEST_UPDATES.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-left">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-brand" />
              <span className="text-[0.8125rem] leading-relaxed text-ink-secondary">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </BottomSheet>
  );
}
