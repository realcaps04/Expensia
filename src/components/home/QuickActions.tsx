import { Link } from "react-router-dom";
import { QUICK_ACTION_ITEMS, type QuickActionSheet } from "../../lib/quick-actions";
import { useQuickAdd } from "../../context/QuickAddProvider";

type QuickActionsProps = {
  onOpenSheet?: (sheet: QuickActionSheet) => void;
};

export function QuickActions({ onOpenSheet }: QuickActionsProps) {
  const quickAdd = useQuickAdd();

  const handleSheet = (sheet: QuickActionSheet) => {
    if (onOpenSheet) {
      onOpenSheet(sheet);
      return;
    }
    quickAdd.openSheet(sheet);
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      {QUICK_ACTION_ITEMS.map((action) => {
        const { shortLabel, icon: Icon, bg, color } = action;

        if (action.kind === "route") {
          return (
            <Link
              key={action.id}
              to={action.to}
              className="flex flex-col items-center gap-2 rounded-[18px] bg-white px-1.5 py-3.5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition-transform active:scale-[0.98]"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${bg} ${color}`}>
                <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
              </div>
              <span className="w-full px-0.5 text-center text-[0.6875rem] font-semibold leading-tight text-ink">
                {shortLabel}
              </span>
            </Link>
          );
        }

        return (
          <button
            key={action.id}
            type="button"
            onClick={() => handleSheet(action.id)}
            className="flex flex-col items-center gap-2 rounded-[18px] bg-white px-1.5 py-3.5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition-transform active:scale-[0.98]"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${bg} ${color}`}>
              <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
            </div>
            <span className="w-full px-0.5 text-center text-[0.6875rem] font-semibold leading-tight text-ink">
              {shortLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export type { QuickActionSheet };
