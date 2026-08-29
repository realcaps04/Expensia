import type { Id } from "../../convex/_generated/dataModel";

export type GoogleProfile = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
};

export type UserProfile = {
  id: string;
  convexId: Id<"users">;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  provider: "email" | "google";
};

export type DashboardSummary = {
  totalBalance: number;
  monthIncome: number;
  monthExpenses: number;
  monthNet: number;
  todayIncome: number;
  todayExpenses: number;
  todayNet: number;
  todayCredit: number;
  yesterdayNet: number;
  transactionCount: number;
  monthlyBudget?: number;
};

export type CreditType = "credit_card" | "personal_loan" | "line_of_credit" | "other";

export type CreditAccount = {
  id: string;
  name: string;
  type: CreditType;
  issuer?: string;
  creditLimit: number;
  balance: number;
  available: number;
  minimumPayment?: number;
  dueDay?: number;
  apr?: number;
  lastFour?: string;
  note?: string;
  isArchived: boolean;
};

export type CreditSummary = {
  accountCount: number;
  totalLimit: number;
  totalBalance: number;
  totalAvailable: number;
  utilization: number;
};
