import { CreditCard, PieChart, Receipt, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

export type QuickActionSheet = "income" | "expense" | "credit";

type QuickActionsProps = {
  onOpenSheet: (sheet: QuickActionSheet) => void;
};

const ACTIONS = [
  {
    id: "income" as const,
    label: "Add Income",
    icon: Wallet,
    bg: "bg-emerald-50",
    color: "text-income",
  },
  {
    id: "expense" as const,
    label: "Add Expense",
    icon: Receipt,
    bg: "bg-rose-50",
    color: "text-expense",
  },
  {
    id: "insights" as const,
    label: "Insights",
    icon: PieChart,
    bg: "bg-violet-50",
    color: "text-violet-brand",
    to: "/home/insights",
  },
  {
    id: "credit" as const,
    label: "Credit",
    icon: CreditCard,
    bg: "bg-sky-50",
    color: "text-sky-600",
  },
] as const;

export function QuickActions({ onOpenSheet }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {ACTIONS.map((action) => {
        const { label, icon: Icon, bg, color } = action;

        if ("to" in action) {
          return (
            <Link
              key={action.id}
              to={action.to}
              className="flex flex-col items-center gap-2 rounded-[18px] bg-white px-1.5 py-3.5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition-transform active:scale-[0.98]"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${bg} ${color}`}>
                <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
              </div>
              <span className="text-center text-[0.6875rem] font-semibold leading-tight text-ink">
                {label}
              </span>
            </Link>
          );
        }

        return (
          <button
            key={action.id}
            type="button"
            onClick={() => onOpenSheet(action.id)}
            className="flex flex-col items-center gap-2 rounded-[18px] bg-white px-1.5 py-3.5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition-transform active:scale-[0.98]"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${bg} ${color}`}>
              <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
            </div>
            <span className="text-center text-[0.6875rem] font-semibold leading-tight text-ink">
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
