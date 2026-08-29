import { useQuery } from "convex/react";
import { ChevronDown, Eye, EyeOff, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { BalanceTrendChart } from "../charts/BalanceTrendChart";
import { useAuth } from "../../context/AuthProvider";
import {
  balancePeriodRange,
  DEFAULT_BALANCE_PERIOD,
  type BalancePeriod,
} from "../../lib/balance-period";
import { formatCurrency } from "../../lib/format";
import { getConvexUserId } from "../../lib/session";
import { BalancePeriodMenu } from "./BalancePeriodMenu";

type BalanceCardProps = {
  userId?: Id<"users"> | null;
};

export function BalanceCard({ userId: userIdProp }: BalanceCardProps) {
  const { user } = useAuth();
  const userId = userIdProp ?? getConvexUserId(user);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [period, setPeriod] = useState<BalancePeriod>(DEFAULT_BALANCE_PERIOD);

  const range = useMemo(() => balancePeriodRange(period), [period]);
  const periodData = useQuery(
    api.finance.getPeriodDashboard,
    userId ? { userId, start: range.start, end: range.end } : "skip",
  );

  const net = periodData?.net ?? 0;
  const income = periodData?.income ?? 0;
  const expenses = periodData?.expenses ?? 0;
  const creditTotal = periodData?.creditTotal ?? 0;
  const isLoading = userId !== null && periodData === undefined;

  const sparkline = (() => {
    const values = periodData?.trend.map((point) => point.balance) ?? [];
    if (values.length >= 2) return values;
    if (values.length === 1) return [0, values[0]];
    return [];
  })();

  const showSparkline = !hidden && sparkline.length >= 2;
  const hasActivity = income > 0 || expenses > 0 || creditTotal > 0;

  return (
    <section className="rounded-card bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[0.8125rem] font-medium text-ink-secondary">Net Balance</span>
          <button
            type="button"
            onClick={() => setHidden((v) => !v)}
            className="rounded-lg p-1 text-ink-muted transition-colors hover:text-ink-secondary active:text-ink"
            aria-label={hidden ? "Show balance" : "Hide balance"}
            aria-pressed={hidden}
          >
            {hidden ? (
              <EyeOff className="h-4 w-4" strokeWidth={2} />
            ) : (
              <Eye className="h-4 w-4" strokeWidth={2} />
            )}
          </button>
        </div>
        <div className="relative">
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex items-center gap-1 rounded-pill border border-surface-border bg-surface px-3 py-1.5 text-[0.75rem] font-medium text-ink-secondary transition-colors hover:border-teal-brand/30 hover:text-ink"
          >
            {range.label}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${menuOpen ? "rotate-180" : ""}`}
              strokeWidth={2.5}
            />
          </button>
          <BalancePeriodMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            period={period}
            onChange={setPeriod}
          />
        </div>
      </div>

      <div className="mt-3">
        {isLoading ? (
          <div className="h-9 w-36 animate-pulse rounded-lg bg-slate-100" />
        ) : (
          <p
            className={`font-display text-[1.75rem] font-bold tracking-tight ${
              net >= 0 ? "text-ink" : "text-expense"
            }`}
          >
            {formatCurrency(net, { signed: true, hide: hidden })}
          </p>
        )}

        {isLoading ? (
          <div className="mt-2 h-4 w-28 animate-pulse rounded bg-slate-100" />
        ) : creditTotal > 0 ? (
          <p className="mt-1 text-[0.75rem] text-ink-muted">
            <span className="font-medium text-sky-600">
              {formatCurrency(creditTotal, { hide: hidden })}
            </span>{" "}
            credit {range.creditLabel}
          </p>
        ) : !hasActivity ? (
          <p className="mt-1 text-[0.8125rem] text-ink-muted">No activity in this period</p>
        ) : net !== 0 ? (
          <p
            className={`mt-1 text-[0.8125rem] font-semibold ${
              net >= 0 ? "text-income" : "text-expense"
            }`}
          >
            {formatCurrency(net, { signed: true, hide: hidden })} net {range.creditLabel}
          </p>
        ) : (
          <p className="mt-1 text-[0.8125rem] text-ink-muted">
            {formatCurrency(income, { signed: true, hide: hidden })} in ·{" "}
            {formatCurrency(-expenses, { signed: true, hide: hidden })} out
          </p>
        )}
      </div>

      {showSparkline ? (
        <div className="mt-4 -mx-1">
          <BalanceTrendChart
            points={sparkline}
            stroke={net >= 0 ? "#14B8A6" : "#F87171"}
          />
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-surface-border pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-income">
            <TrendingDown className="h-4 w-4 rotate-180" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[0.75rem] text-ink-muted">Income</p>
            <p className="text-[0.9375rem] font-semibold text-income">
              {formatCurrency(income, { signed: true, hide: hidden })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-expense">
            <TrendingUp className="h-4 w-4 rotate-180" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[0.75rem] text-ink-muted">Expenses</p>
            <p className="text-[0.9375rem] font-semibold text-expense">
              {formatCurrency(-expenses, { signed: true, hide: hidden })}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
