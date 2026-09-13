import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useEffect, useRef } from "react";

type ActivitySearchToggleProps = {
  open: boolean;
  query: string;
  onOpen: () => void;
  onClose: () => void;
  onQueryChange: (value: string) => void;
};

export function ActivitySearchToggle({
  open,
  query,
  onOpen,
  onClose,
  onQueryChange,
}: ActivitySearchToggleProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  return (
    <div className="flex min-w-0 items-center justify-end">
      <AnimatePresence initial={false} mode="wait">
        {open ? (
          <motion.div
            key="activity-search-field"
            initial={{ width: 40, opacity: 0.6 }}
            animate={{ width: "100%", opacity: 1 }}
            exit={{ width: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            className="min-w-0 overflow-hidden"
          >
            <div className="flex h-10 items-center rounded-full border border-surface-border bg-white pl-3 pr-1.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <Search className="h-4 w-4 shrink-0 text-ink-muted" strokeWidth={2} />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Search activity…"
                aria-label="Search activity"
                className="min-w-0 flex-1 bg-transparent px-2 text-[0.8125rem] text-ink placeholder:text-ink-muted/70 focus:outline-none"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close search"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-slate-100 hover:text-ink"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="activity-search-icon"
            type="button"
            onClick={onOpen}
            aria-label="Search activity"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-surface-border bg-white text-ink-secondary shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-colors hover:text-ink"
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={2} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
