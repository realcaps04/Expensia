import { CreditCard, Landmark } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { categoryColor, DonutChart } from "../components/charts/DonutChart";
import { LineChart } from "../components/charts/LineChart";
import { useAuth } from "../context/AuthProvider";
import { categoryLabel, mapCreditRow } from "../lib/convex-mappers";
import { formatCurrency } from "../lib/format";
import { getConvexUserId } from "../lib/session";

type Timeframe = "7D" | "30D" | "3M" | "1Y";

const TIMEFRAMES: { id: Timeframe; days: number }[] = [
  { id: "7D", days: 7 },
  { id: "30D", days: 30 },
  { id: "3M", days: 90 },
  { id: "1Y", days: 365 },
];

function rangeForDays(days: number) {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);
  return { start: start.getTime(), end: end.getTime() };
}

function formatShortDate(dateKey: string) {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(
    new Date(y, m - 1, d),
  );
}

export function InsightsScreen() {
  const { user } = useAuth();
  const userId = getConvexUserId(user);
  const [timeframe, setTimeframe] = useState<Timeframe>("30D");
  const days = TIMEFRAMES.find((t) => t.id === timeframe)?.days ?? 30;
  const range = useMemo(() => rangeForDays(days), [days]);

  const byCategory = useQuery(
    api.finance.getSpendingByCategory,
    userId ? { userId, ...range } : "skip",
  );
  const dailyTrend = useQuery(
    api.finance.getDailyExpenseTrend,
    userId ? { userId, ...range } : "skip",
  );
  const creditSummary = useQuery(api.credits.getSummary, userId ? { userId } : "skip");
  const creditAccounts = useQuery(api.credits.list, userId ? { userId } : "skip");

  const isLoading =
    userId !== null &&
    (byCategory === undefined ||
      dailyTrend === undefined ||
      creditSummary === undefined ||
      creditAccounts === undefined);

  const credits = (creditAccounts ?? []).map(mapCreditRow);

  const totalSpent = (byCategory ?? []).reduce((sum, row) => sum + row.amount, 0);
  const donutSegments = (byCategory ?? []).map((row) => ({
    label: row.category,
    amount: row.amount,
    percentage: row.percentage,
    color: categoryColor(row.category),
  }));

  const trendPoints = (dailyTrend ?? []).map((d) => d.amount);
  const trendLabels = (dailyTrend ?? []).map((d) => formatShortDate(d.date));

  return (
    <div className="px-5 pb-6 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="mx-auto flex max-w-[390px] flex-col gap-5">
        <div>
          <h1 className="font-display text-[1.375rem] font-bold text-ink">Insights</h1>
          <p className="mt-1 text-[0.8125rem] text-ink-secondary">
            Understand where your money goes
          </p>
        </div>

        <section className="rounded-card bg-gradient-to-br from-violet-brand to-violet-deep p-5 text-white shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[0.8125rem] font-medium text-white/80">Credit</p>
              <p className="mt-2 font-display text-[1.75rem] font-bold tracking-tight">
                {formatCurrency(-(creditSummary?.totalBalance ?? 0), { signed: true })}
              </p>
              <p className="mt-1.5 text-[0.8125rem] text-white/75">
                {creditSummary?.accountCount
                  ? `Across ${creditSummary.accountCount} account${creditSummary.accountCount === 1 ? "" : "s"}`
                  : "No credit or loan accounts yet"}
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-white/15">
              <CreditCard className="h-6 w-6" strokeWidth={1.75} />
            </div>
          </div>

          {credits.length > 0 ? (
            <ul className="mt-5 space-y-3 border-t border-white/15 pt-4">
              {credits.map((account) => {
                const Icon = account.type === "personal_loan" ? Landmark : CreditCard;
                const utilization =
                  account.creditLimit > 0
                    ? Math.round((account.balance / account.creditLimit) * 100)
                    : 0;

                return (
                  <li key={account.id} className="rounded-[14px] bg-white/10 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                          <Icon className="h-4 w-4" strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[0.9375rem] font-semibold">{account.name}</p>
                          <p className="mt-0.5 truncate text-[0.75rem] text-white/70">
                            {account.issuer ?? (account.type === "personal_loan" ? "Loan" : "Credit card")}
                          </p>
                        </div>
                      </div>
                      <p className="shrink-0 text-[0.9375rem] font-semibold">
                        {formatCurrency(-account.balance, { signed: true })}
                      </p>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-pill bg-white/15">
                      <div
                        className="h-full rounded-pill bg-white/85"
                        style={{ width: `${Math.min(utilization, 100)}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-[0.6875rem] text-white/70">
                      {account.type === "personal_loan" && account.tenureMonths
                        ? `${account.emiPaidCount ?? 0} of ${account.tenureMonths} EMIs`
                        : `${utilization}% utilization`}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </section>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {TIMEFRAMES.map(({ id }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTimeframe(id)}
              className={`shrink-0 rounded-pill px-4 py-2 text-[0.8125rem] font-semibold transition-colors ${
                timeframe === id
                  ? "bg-teal-brand text-white shadow-sm"
                  : "bg-white text-ink-secondary shadow-[0_1px_4px_rgba(15,23,42,0.06)]"
              }`}
            >
              {id}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 animate-pulse rounded-card bg-white/80 shadow-soft" />
            ))}
          </div>
        ) : (
          <>
            <section className="rounded-card bg-white p-5 shadow-soft">
              <h2 className="font-display text-[1rem] font-semibold text-ink">Spending Overview</h2>
              <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                <DonutChart
                  segments={donutSegments}
                  totalLabel={formatCurrency(totalSpent)}
                />
                <ul className="w-full flex-1 space-y-2.5">
                  {(byCategory ?? []).length === 0 ? (
                    <li className="text-[0.8125rem] text-ink-muted">No expenses recorded yet.</li>
                  ) : (
                    (byCategory ?? []).map((row) => (
                      <li key={row.category} className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: categoryColor(row.category) }}
                          />
                          <span className="truncate text-[0.8125rem] font-medium text-ink">
                            {categoryLabel(row.category)}
                          </span>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-[0.8125rem] font-semibold text-ink">
                            {formatCurrency(row.amount)}
                          </p>
                          <p className="text-[0.6875rem] text-ink-muted">{row.percentage}%</p>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </section>

            <section className="rounded-card bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-[1rem] font-semibold text-ink">Spending Trend</h2>
                <span className="text-[0.75rem] font-medium text-ink-muted">{timeframe}</span>
              </div>
              <div className="mt-5">
                <LineChart points={trendPoints} labels={trendLabels} />
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
