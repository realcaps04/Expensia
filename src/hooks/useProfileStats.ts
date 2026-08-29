import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getConvexUserId } from "../lib/session";
import { useAuth } from "../context/AuthProvider";

export function useProfileStats() {
  const { user } = useAuth();
  const userId = getConvexUserId(user);
  const stats = useQuery(api.finance.getProfileStats, userId ? { userId } : "skip");
  const convexUser = useQuery(api.users.getUser, userId ? { userId } : "skip");

  return {
    userId,
    stats,
    convexUser,
    isLoading: userId !== null && (stats === undefined || convexUser === undefined),
  };
}
