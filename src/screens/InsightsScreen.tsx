import { ArrowDown, ArrowUp, CreditCard, Landmark, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { categoryColor, DonutChart } from "../components/charts/DonutChart";
import { TrendAreaChart, type TrendSeriesPoint } from "../components/charts/TrendAreaChart";
import { useAuth } from "../context/AuthProvider";
import { categoryLabel, mapCreditRow } from "../lib/convex-mappers";
import { formatCurrency } from "../lib/format";
import { getConvexUserId } from "../lib/session";

type Timeframe = "7D" | "30D" | "3M" | "1Y";
type TrendTone = "income" | "expense";

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

function vsPriorPercent(current: number, previous: number) {
  return previous > 0 ? ((current - previous) / previous) * 100 : current > 0 ? 100 : 0;
}

function TrendCard({
  title,
  total,
  previousTotal,
  vsPriorLabel,
  dailyAverage,
  points,
  tone,
}: {
  title: string;
  total: number;
  previousTotal: number;
  vsPriorLabel: string;
  dailyAverage: number;
  points: TrendSeriesPoint[];
  tone: TrendTone;
}) {
  const vsPriorPct = vsPriorPercent(total, previousTotal);
  const up = vsPriorPct > 0.05;
  const down = vsPriorPct < -0.05;
  const changeClass = up
    ? tone === "expense"
      ? "text-expense"
      : "text-income"
    : down
      ? tone === "expense"
        ? "text-income"
        : "text-expense"
      : "text-ink-muted";
  const averageClass = tone === "income" ? "text-income" : "text-expense";

  return (
    <section className="rounded-card bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.8125rem] font-medium text-ink-muted">{title}</p>
          <p className="mt-1 font-display text-[1.5rem] font-bold tracking-tight text-ink">
            {formatCurrency(total)}
          </p>
          {previousTotal > 0 || total > 0 ? (
            <p className={`mt-1 inline-flex items-center gap-1 text-[0.75rem] font-semibold ${changeClass}`}>
              {up ? (
                <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
              ) : down ? (
                <ArrowDown className="h-3.5 w-3.5" strokeWidth={2.5} />
              ) : null}
              {Math.abs(vsPriorPct).toFixed(1)}% {vsPriorLabel}
            </p>
          ) : null}
        </div>
        <div className="shrink-0 rounded-[16px] bg-[var(--bg-muted)] px-3 py-2.5">
          <div className={`flex items-center gap-1.5 text-[0.6875rem] font-medium ${averageClass}`}>
            <Wallet className="h-3.5 w-3.5" strokeWidth={2.25} />
            Daily Average
          </div>
          <p className="mt-1 text-right font-display text-[0.9375rem] font-bold text-ink">
            {formatCurrency(dailyAverage)}
          </p>
        </div>
      </div>
      <div className="mt-5">
        <TrendAreaChart points={points} tone={tone} height={196} />
      </div>
    </section>
  );
}

export function InsightsScreen() {
  const { user } = useAuth();
  const userId = getConvexUserId(user);
  const [timeframe, setTimeframe] = useState<Timeframe>("30D");
  const days = TIMEFRAMES.find((t) => t.id === timeframe)?.days ?? 30;
  const range = useMemo(() => rangeForDays(days), [days]);
  const prevRange = useMemo(() => {
    const duration = range.end - range.start;
    return { start: range.start - duration - 1, end: range.start - 1 };
  }, [range]);

  const byCategory = useQuery(
    api.finance.getSpendingByCategory,
    userId ? { userId, ...range } : "skip",
  );
  const dailyTrends = useQuery(
    api.finance.getDailyTypeTrends,
    userId ? { userId, ...range } : "skip",
  );
  const prevDailyTrends = useQuery(
    api.finance.getDailyTypeTrends,
    userId ? { userId, ...prevRange } : "skip",
  );
  const creditSummary = useQuery(api.credits.getSummary, userId ? { userId } : "skip");
  const creditAccounts = useQuery(api.credits.list, userId ? { userId } : "skip");

  const isLoading =
    userId !== null &&
    (byCategory === undefined ||
      dailyTrends === undefined ||
      prevDailyTrends === undefined ||
      creditSummary === undefined ||
      creditAccounts === undefined);

  const credits = (creditAccounts ?? []).map(mapCreditRow);
  const creditTotal = creditSummary?.totalBalance ?? 0;
  const totalSpent = (byCategory ?? []).reduce((sum, row) => sum + row.amount, 0);
  const overviewTotal = totalSpent + creditTotal;

  const expenseSegments = (byCategory ?? []).map((row) => ({
    label: row.category,
    amount: row.amount,
    percentage:
      overviewTotal > 0 ? Math.round((row.amount / overviewTotal) * 100) : row.percentage,
    color: categoryColor(row.category),
  }));

  const creditSegment =
    creditTotal > 0
      ? [
          {
            label: "credit",
            amount: creditTotal,
            percentage:
              overviewTotal > 0 ? Math.round((creditTotal / overviewTotal) * 100) : 100,
            color: categoryColor("credit"),
          },
        ]
      : [];

  const donutSegments = [...expenseSegments, ...creditSegment];

  const expensePoints = (dailyTrends?.expenses ?? []).map((d) => ({ date: d.date, value: d.amount }));
  const incomePoints = (dailyTrends?.income ?? []).map((d) => ({ date: d.date, value: d.amount }));
  const totalExpenses = (dailyTrends?.expenses ?? []).reduce((sum, row) => sum + row.amount, 0);
  const totalIncome = (dailyTrends?.income ?? []).reduce((sum, row) => sum + row.amount, 0);
  const prevExpenses = (prevDailyTrends?.expenses ?? []).reduce((sum, row) => sum + row.amount, 0);
  const prevIncome = (prevDailyTrends?.income ?? []).reduce((sum, row) => sum + row.amount, 0);
  const expenseDailyAverage = days > 0 ? Math.round(totalExpenses / days) : 0;
  const incomeDailyAverage = days > 0 ? Math.round(totalIncome / days) : 0;
  const vsPriorLabel =
    timeframe === "7D"
      ? "vs last week"
      : timeframe === "30D"
        ? "vs last month"
        : timeframe === "1Y"
          ? "vs last year"
          : "vs prior period";

  return (
    <div className="px-5 pb-6 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="mx-auto flex max-w-[390px] flex-col gap-5">
        <div>
          <h1 className="font-display text-[1.375rem] font-bold text-ink">Insights</h1>
          <p className="mt-1 text-[0.8125rem] text-ink-secondary">
            Understand where your money goes
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {TIMEFRAMES.map(({ id }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTimeframe(id)}
              className={`shrink-0 rounded-pill px-4 py-2 text-[0.8125rem] font-semibold transition-colors ${
                timeframe === id
                  ? "bg-slate-800 text-white shadow-sm dark:bg-[#1a1a1a]"
                  : "bg-white text-ink-secondary shadow-[0_1px_4px_rgba(15,23,42,0.06)]"
              }`}
            >
              {id}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
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
                  {(byCategory ?? []).length === 0 && creditTotal === 0 ? (
                    <li className="text-[0.8125rem] text-ink-muted">No expenses recorded yet.</li>
                  ) : (
                    <>
                      {(byCategory ?? []).map((row) => (
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
                            <p className="text-[0.6875rem] text-ink-muted">
                              {overviewTotal > 0
                                ? Math.round((row.amount / overviewTotal) * 100)
                                : row.percentage}
                              %
                            </p>
                          </div>
                        </li>
                      ))}
                      {creditTotal > 0 ? (
                        <>
                          <li className="flex items-center justify-between gap-3 border-t border-surface-border pt-2.5">
                            <div className="flex min-w-0 items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: categoryColor("credit") }}
                              />
                              <span className="truncate text-[0.8125rem] font-medium text-ink">
                                Credit
                              </span>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-[0.8125rem] font-semibold text-credit">
                                {formatCurrency(-creditTotal, { signed: true })}
                              </p>
                              <p className="text-[0.6875rem] text-ink-muted">
                                {overviewTotal > 0
                                  ? Math.round((creditTotal / overviewTotal) * 100)
                                  : 100}
                                %
                              </p>
                            </div>
                          </li>
                          {credits.map((account) => (
                            <li
                              key={account.id}
                              className="flex items-center justify-between gap-3 pl-4"
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                {account.type === "personal_loan" ? (
                                  <Landmark className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                                ) : (
                                  <CreditCard className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                                )}
                                <span className="truncate text-[0.75rem] text-ink-secondary">
                                  {account.name}
                                </span>
                              </div>
                              <p className="shrink-0 text-[0.75rem] font-medium text-credit">
                                {formatCurrency(-account.balance, { signed: true })}
                              </p>
                            </li>
                          ))}
                        </>
                      ) : null}
                    </>
                  )}
                </ul>
              </div>
            </section>

            <TrendCard
              title="Total Expenses"
              total={totalExpenses}
              previousTotal={prevExpenses}
              vsPriorLabel={vsPriorLabel}
              dailyAverage={expenseDailyAverage}
              points={expensePoints}
              tone="expense"
            />
            <TrendCard
              title="Total Income"
              total={totalIncome}
              previousTotal={prevIncome}
              vsPriorLabel={vsPriorLabel}
              dailyAverage={incomeDailyAverage}
              points={incomePoints}
              tone="income"
            />
          </>
        )}
      </div>
    </div>
  );
}
