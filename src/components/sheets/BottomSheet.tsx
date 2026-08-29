import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function BottomSheet({ open, onClose, title, children, footer }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-slate-900/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative flex max-h-[92dvh] w-full max-w-shell flex-col overflow-hidden rounded-t-[28px] bg-[#F4F6F8] shadow-[0_-8px_40px_rgba(15,23,42,0.12)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-surface-border/80 bg-white px-5 py-4">
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-slate-100 hover:text-ink"
                aria-label="Close sheet"
              >
                <X className="h-5 w-5" />
              </button>
              <h2 className="font-display text-[1rem] font-semibold text-ink">{title}</h2>
              <div className="h-9 w-9" aria-hidden />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4 pt-5">
              {children}
            </div>

            {footer ? (
              <div className="shrink-0 border-t border-surface-border/80 bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
