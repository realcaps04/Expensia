import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../context/AuthProvider";
import { getConvexUserId } from "../lib/session";

export function useFinanceDashboard() {
  const { user } = useAuth();
  const userId = getConvexUserId(user);

  const dashboard = useQuery(api.finance.getDashboard, userId ? { userId } : "skip");
  const transactions = useQuery(api.transactions.listRecent, userId ? { userId, limit: 7 } : "skip");

  return {
    userId,
    dashboard,
    transactions,
    isLoading: userId !== null && (dashboard === undefined || transactions === undefined),
  };
}
