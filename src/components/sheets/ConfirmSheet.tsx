import { AlertTriangle, Loader2 } from "lucide-react";
import { BottomSheet } from "./BottomSheet";

type ConfirmSheetProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
};

export function ConfirmSheet({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  busy = false,
}: ConfirmSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={title}
      elevated
      footer={
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void onConfirm()}
            className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-expense py-3.5 text-[0.9375rem] font-semibold text-white shadow-[0_10px_24px_rgba(248,113,113,0.28)] transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : confirmLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="w-full rounded-[16px] border border-surface-border py-3 text-[0.875rem] font-semibold text-ink-secondary transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
        </div>
      }
    >
      <div className="flex flex-col items-center pb-2 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-expense">
          <AlertTriangle className="h-7 w-7" strokeWidth={2} />
        </div>
        <p className="text-[0.9375rem] leading-relaxed text-ink-secondary">{message}</p>
      </div>
    </BottomSheet>
  );
}

export function deleteItemMessage(name: string) {
  return (
    <>
      Delete <span className="font-semibold text-ink">&quot;{name}&quot;</span>? This cannot be
      undone.
    </>
  );
}
