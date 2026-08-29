import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { QUICK_ACTION_ITEMS, type QuickActionSheet } from "../../lib/quick-actions";
import { BottomSheet } from "./BottomSheet";

type AddActionMenuSheetProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (sheet: QuickActionSheet) => void;
};

export function AddActionMenuSheet({ open, onClose, onSelect }: AddActionMenuSheetProps) {
  const navigate = useNavigate();

  const handleSelect = (item: (typeof QUICK_ACTION_ITEMS)[number]) => {
    onClose();
    if (item.kind === "route") {
      navigate(item.to);
      return;
    }
    onSelect(item.id);
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Quick Add">
      <div className="space-y-2 pb-2">
        {QUICK_ACTION_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item)}
              className="flex w-full items-center gap-4 rounded-[18px] bg-white px-4 py-3.5 text-left shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition-transform active:scale-[0.99]"
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] ${item.bg} ${item.color}`}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[0.9375rem] font-semibold text-ink">{item.label}</p>
                <p className="mt-0.5 text-[0.8125rem] text-ink-secondary">{item.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-ink-muted" strokeWidth={2} />
            </button>
          );
        })}
      </div>
    </BottomSheet>
  );
}
