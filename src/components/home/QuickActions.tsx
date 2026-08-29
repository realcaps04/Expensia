import { CreditCard, PieChart, Receipt, Wallet } from "lucide-react";
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
  {
    label: "Credit",
    icon: CreditCard,
    bg: "bg-sky-50",
    color: "text-sky-600",
    to: "/home",
  },
] as const;

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {ACTIONS.map(({ label, icon: Icon, bg, color, to }) => (
        <Link
          key={label}
          to={to}
          className="flex flex-col items-center gap-2 rounded-[18px] bg-white px-1.5 py-3.5 shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition-transform active:scale-[0.98]"
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${bg} ${color}`}>
            <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
          </div>
          <span className="text-center text-[0.6875rem] font-semibold leading-tight text-ink">{label}</span>
        </Link>
      ))}
    </div>
  );
}
