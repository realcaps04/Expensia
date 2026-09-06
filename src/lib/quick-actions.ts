import type { LucideIcon } from "lucide-react";
import { ArrowDownFromLine, CalendarRange, CreditCard, Wallet } from "lucide-react";

export type QuickActionSheet = "income" | "expense" | "credit";

export type QuickActionItem =
  | {
      id: QuickActionSheet;
      label: string;
      shortLabel: string;
      description: string;
      icon: LucideIcon;
      bg: string;
      color: string;
      kind: "sheet";
    }
  | {
      id: "events";
      label: string;
      shortLabel: string;
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
    shortLabel: "Income",
    description: "Salary, refunds, and other inflows",
    icon: Wallet,
    bg: "bg-transparent",
    color: "text-income",
  },
  {
    id: "expense",
    kind: "sheet",
    label: "Add Expense",
    shortLabel: "Expense",
    description: "Bills, shopping, and daily spending",
    icon: ArrowDownFromLine,
    bg: "bg-transparent",
    color: "text-expense",
  },
  {
    id: "credit",
    kind: "sheet",
    label: "Add Credit",
    shortLabel: "Credit",
    description: "Cards, loans, and credit lines",
    icon: CreditCard,
    bg: "bg-transparent",
    color: "text-credit",
  },
  {
    id: "events",
    kind: "route",
    label: "Events",
    shortLabel: "Events",
    description: "Group income, expenses & credit by occasion",
    icon: CalendarRange,
    bg: "bg-transparent",
    color: "text-violet-brand",
    to: "/home/events",
  },
];
