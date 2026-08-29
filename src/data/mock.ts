export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  title: string;
  category: string;
  type: TransactionType;
  amount: number;
  time: string;
  icon: "briefcase" | "food" | "transport" | "shopping";
};

export const FINANCE_SUMMARY = {
  totalBalance: 24850,
  balanceChangePct: 12.5,
  monthIncome: 8500,
  monthExpenses: 3240,
  todayIncome: 3500,
  todayExpenses: 1240,
  todayNet: 2260,
};

export const RECENT_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    title: "Freelance Payment",
    category: "Income",
    type: "income",
    amount: 3500,
    time: "09:30 AM",
    icon: "briefcase",
  },
  {
    id: "2",
    title: "Food & Dining",
    category: "Expense",
    type: "expense",
    amount: 320,
    time: "12:45 PM",
    icon: "food",
  },
  {
    id: "3",
    title: "Uber",
    category: "Transport",
    type: "expense",
    amount: 180,
    time: "02:15 PM",
    icon: "transport",
  },
  {
    id: "4",
    title: "Shopping",
    category: "Expense",
    type: "expense",
    amount: 740,
    time: "06:20 PM",
    icon: "shopping",
  },
];

export const BALANCE_SPARKLINE = [42, 48, 44, 52, 50, 58, 55, 62, 68, 72, 70, 78];
