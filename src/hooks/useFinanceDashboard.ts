import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../context/AuthProvider";
import { getConvexUserId } from "../lib/session";

export function useFinanceDashboard() {
  const { user } = useAuth();
  const userId = getConvexUserId(user);

  const dashboard = useQuery(api.finance.getDashboard, userId ? { userId } : "skip");
  const transactions = useQuery(api.transactions.listRecent, userId ? { userId, limit: 10 } : "skip");
  const balanceTrend = useQuery(api.finance.getBalanceTrend, userId ? { userId, days: 14 } : "skip");

  return {
    userId,
    dashboard,
    transactions,
    balanceSparkline: balanceTrend?.map((point) => point.balance),
    isLoading:
      userId !== null &&
      (dashboard === undefined || transactions === undefined || balanceTrend === undefined),
  };
}
