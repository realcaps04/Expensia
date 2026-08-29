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
  transactionCount: number;
  monthlyBudget?: number;
};
