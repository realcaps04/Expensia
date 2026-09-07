import { useQuery } from "convex/react";
import { ChevronDown, CreditCard, Eye, EyeOff, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
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

function PeriodStat({
  label,
  amount,
  hide,
  valueClass,
  iconWrapClass,
  icon,
}: {
  label: string;
  amount: number;
  hide?: boolean;
  valueClass: string;
  iconWrapClass: string;
  icon: ReactNode;
}) {
  const sign = amount > 0 ? "+" : amount < 0 ? "−" : "";

  return (
    <div className="min-w-0 text-center">
      <div className="flex items-center justify-center gap-1">
        <p className="text-[0.75rem] leading-4 text-ink-muted">{label}</p>
        <span className={`inline-flex shrink-0 items-center justify-center ${iconWrapClass}`}>
          {icon}
        </span>
      </div>
      <div className="mt-0.5 flex items-center justify-center">
        {hide ? (
          <p className={`truncate text-[0.875rem] font-semibold leading-5 ${valueClass}`}>••••••</p>
        ) : (
          <p className={`truncate text-[0.875rem] font-semibold leading-5 ${valueClass}`}>
            {sign}
            {formatCurrency(Math.abs(amount))}
          </p>
        )}
      </div>
    </div>
  );
}

export function BalanceCard({ userId: userIdProp }: BalanceCardProps) {
  const { user } = useAuth();
  const userId = userIdProp ?? getConvexUserId(user);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [period, setPeriod] = useState<BalancePeriod>(DEFAULT_BALANCE_PERIOD);

  const range = useMemo(() => balancePeriodRange(period), [period]);
  const tzOffsetMinutes = useMemo(() => new Date().getTimezoneOffset(), []);
  const periodData = useQuery(
    api.finance.getPeriodDashboard,
    userId ? { userId, start: range.start, end: range.end, tzOffsetMinutes } : "skip",
  );

  // Net / trend stay income − expenses only. Credit is display-only for the period.
  const net = periodData?.net ?? 0;
  const income = periodData?.income ?? 0;
  const expenses = periodData?.expenses ?? 0;
  const creditTotal = periodData?.creditTotal ?? 0;
  const isLoading = userId !== null && periodData === undefined;

  const sparkline = (() => {
    const rows = periodData?.trend ?? [];
    if (rows.length >= 2) {
      return rows.map((point) => ({ date: point.date, value: point.balance }));
    }
    if (rows.length === 1) {
      return [
        { date: rows[0].date, value: 0 },
        { date: rows[0].date, value: rows[0].balance },
      ];
    }
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
            {hidden ? (
              "••••••"
            ) : (
              <span className="inline-flex items-baseline whitespace-nowrap">
                {net > 0 ? <span>+</span> : net < 0 ? <span>−</span> : null}
                <span>{formatCurrency(Math.abs(net))}</span>
              </span>
            )}
          </p>
        )}

        {isLoading ? (
          <div className="mt-2 h-4 w-28 animate-pulse rounded bg-slate-100" />
        ) : !hasActivity ? (
          <p className="mt-1 text-[0.8125rem] text-ink-muted">No activity in this period</p>
        ) : net !== 0 ? (
          <p
            className={`mt-1 text-[0.8125rem] font-semibold ${
              net >= 0 ? "text-income" : "text-expense"
            }`}
          >
            {formatCurrency(net, { signed: true, hide: hidden })}
            <span className="font-medium"> net {range.creditLabel}</span>
          </p>
        ) : (
          <p className="mt-1 text-[0.8125rem] text-ink-muted">
            {formatCurrency(income, { signed: true, hide: hidden })} in ·{" "}
            {formatCurrency(-expenses, { signed: true, hide: hidden })} out
          </p>
        )}
      </div>

      {showSparkline ? (
        <div className="mt-4">
          <BalanceTrendChart points={sparkline} expenseLed={expenses > income} />
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-3 items-center gap-2 border-t border-surface-border pt-4 sm:gap-3">
        <PeriodStat
          label="Income"
          amount={income}
          hide={hidden}
          valueClass="text-income"
          iconWrapClass="bg-transparent text-income"
          icon={<TrendingUp className="h-4 w-4" strokeWidth={2.5} />}
        />
        <PeriodStat
          label="Expenses"
          amount={-expenses}
          hide={hidden}
          valueClass="text-expense"
          iconWrapClass="bg-transparent text-expense"
          icon={<TrendingDown className="h-4 w-4" strokeWidth={2.5} />}
        />
        <PeriodStat
          label="Credit"
          amount={creditTotal > 0 ? -creditTotal : 0}
          hide={hidden}
          valueClass="text-credit"
          iconWrapClass="bg-transparent text-credit"
          icon={<CreditCard className="h-4 w-4 fill-none" strokeWidth={2.5} />}
        />
      </div>
    </section>
  );
}
