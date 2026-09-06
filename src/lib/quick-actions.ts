import type { LucideIcon } from "lucide-react";
import { CalendarRange, CreditCard, Receipt, Wallet } from "lucide-react";

export type QuickActionSheet = "income" | "expense" | "credit";

export type QuickActionItem =
  | {
      id: QuickActionSheet;
      label: string;
      description: string;
      icon: LucideIcon;
      bg: string;
      color: string;
      kind: "sheet";
    }
  | {
      id: "events";
      label: string;
      description: string;
      icon: LucideIcon;
      bg: string;
      color: string;
      kind: "route";
      to: string;
    };

export const QUICK_ACTION_ITEMS: QuickActionItem[] = [
  {
    id: "income",
    kind: "sheet",
    label: "Add Income",
    description: "Salary, refunds, and other inflows",
    icon: Wallet,
    bg: "bg-transparent",
    color: "text-income",
  },
  {
    id: "expense",
    kind: "sheet",
    label: "Add Expense",
    description: "Bills, shopping, and daily spending",
    icon: Receipt,
    bg: "bg-transparent",
    color: "text-expense",
  },
  {
    id: "credit",
    kind: "sheet",
    label: "Add Credit",
    description: "Cards, loans, and credit lines",
    icon: CreditCard,
    bg: "bg-transparent",
    color: "text-sky-600",
  },
  {
    id: "events",
    kind: "route",
    label: "Events",
    description: "Group income, expenses & credit by occasion",
    icon: CalendarRange,
    bg: "bg-transparent",
    color: "text-violet-brand",
    to: "/home/events",
  },
];
