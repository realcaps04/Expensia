import { motion } from "framer-motion";
import { HomeHeader } from "../components/home/HomeHeader";
import { BalanceCard } from "../components/home/BalanceCard";
import { QuickActions } from "../components/home/QuickActions";
import { TodayOverview } from "../components/home/TodayOverview";
import { RecentTransactions } from "../components/home/RecentTransactions";
import { useFinanceDashboard } from "../hooks/useFinanceDashboard";
import { mapTransactionRow } from "../lib/convex-mappers";
import type { DashboardSummary } from "../lib/types";

const EMPTY_SUMMARY: DashboardSummary = {
  totalBalance: 0,
  monthIncome: 0,
  monthExpenses: 0,
  monthNet: 0,
  todayIncome: 0,
  todayExpenses: 0,
  todayNet: 0,
  transactionCount: 0,
};

export function HomeScreen() {
  const { dashboard, transactions, isLoading } = useFinanceDashboard();
  const summary = dashboard ?? EMPTY_SUMMARY;
  const rows = (transactions ?? []).map(mapTransactionRow);

  return (
    <div className="px-5 pb-6 pt-[max(1rem,env(safe-area-inset-top))]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto flex max-w-[390px] flex-col gap-5"
      >
        <HomeHeader />
        {isLoading ? (
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-card bg-white/80 shadow-soft" />
            ))}
          </div>
        ) : (
          <>
            <BalanceCard summary={summary} />
            <QuickActions />
            <TodayOverview summary={summary} />
            <RecentTransactions transactions={rows} />
          </>
        )}
      </motion.div>
    </div>
  );
}
