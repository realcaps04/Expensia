import { PieChart, Receipt, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

const ACTIONS = [
  {
    label: "Add Income",
    icon: Wallet,
    bg: "bg-emerald-50",
    color: "text-income",
    to: "/home",
  },
  {
    label: "Add Expense",
    icon: Receipt,
    bg: "bg-rose-50",
    color: "text-expense",
    to: "/home",
  },
  {
    label: "Insights",
    icon: PieChart,
    bg: "bg-violet-50",
    color: "text-violet-brand",
    to: "/home/insights",
  },
] as const;

export function QuickActions() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {ACTIONS.map(({ label, icon: Icon, bg, color, to }) => (
        <Link
          key={label}
          to={to}
          className="flex flex-col items-center gap-2.5 rounded-[18px] bg-white px-2 py-4 shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition-transform active:scale-[0.98]"
        >
          <div className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${bg} ${color}`}>
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
          <span className="text-center text-[0.75rem] font-semibold text-ink">{label}</span>
        </Link>
      ))}
    </div>
  );
}
