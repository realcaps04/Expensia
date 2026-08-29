import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../context/AuthProvider";
import { mapCreditRow } from "../lib/convex-mappers";
import { getConvexUserId } from "../lib/session";

export function useCredits() {
  const { user } = useAuth();
  const userId = getConvexUserId(user);

  const credits = useQuery(api.credits.list, userId ? { userId } : "skip");
  const summary = useQuery(api.credits.getSummary, userId ? { userId } : "skip");

  return {
    userId,
    credits: credits?.map(mapCreditRow),
    summary,
    isLoading: userId !== null && (credits === undefined || summary === undefined),
  };
}
