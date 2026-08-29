import { ChevronDown, Eye, EyeOff, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Sparkline } from "../charts/Sparkline";
import type { DashboardSummary } from "../../lib/types";
import { formatCurrency } from "../../lib/format";

function dayChangeLabel(todayNet: number, yesterdayNet: number) {
  if (todayNet === 0 && yesterdayNet === 0) return null;

  const diff = todayNet - yesterdayNet;
  if (yesterdayNet === 0) {
    const pct = todayNet === 0 ? 0 : todayNet > 0 ? 100 : -100;
    return { pct, positive: diff >= 0 };
  }

  const pct = Math.round((diff / Math.abs(yesterdayNet)) * 100);
  return { pct, positive: diff >= 0 };
}

type BalanceCardProps = {
  summary: DashboardSummary;
  sparkline?: number[];
};

export function BalanceCard({ summary, sparkline = [] }: BalanceCardProps) {
  const [hidden, setHidden] = useState(false);
  const change = dayChangeLabel(summary.todayNet, summary.yesterdayNet ?? 0);
  const showSparkline = !hidden && sparkline.length >= 2;

  return (
    <section className="rounded-card bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[0.8125rem] font-medium text-ink-secondary">Total Balance</span>
          <button
            type="button"
            onClick={() => setHidden((v) => !v)}
            className="rounded-lg p-1 text-ink-muted transition-colors hover:text-ink-secondary"
            aria-label={hidden ? "Show balance" : "Hide balance"}
          >
            {hidden ? (
              <EyeOff className="h-4 w-4" strokeWidth={2} />
            ) : (
              <Eye className="h-4 w-4" strokeWidth={2} />
            )}
          </button>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-pill border border-surface-border bg-surface px-3 py-1.5 text-[0.75rem] font-medium text-ink-secondary"
        >
          This Month
          <ChevronDown className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <p className="font-display text-[1.75rem] font-bold tracking-tight text-ink">
            {formatCurrency(summary.totalBalance, { hide: hidden })}
          </p>
          {change ? (
            <p
              className={`mt-1 inline-flex items-center gap-1 text-[0.8125rem] font-semibold ${
                change.positive ? "text-income" : "text-expense"
              }`}
            >
              {change.positive ? (
                <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.5} />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" strokeWidth={2.5} />
              )}
              {change.pct > 0 ? "+" : ""}
              {change.pct}% vs yesterday
            </p>
          ) : (
            <p className="mt-1 text-[0.8125rem] text-ink-muted">No activity yet</p>
          )}
        </div>
        {showSparkline ? (
          <Sparkline
            points={sparkline}
            stroke={summary.todayNet >= 0 ? "#14B8A6" : "#F87171"}
          />
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-surface-border pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-income">
            <TrendingDown className="h-4 w-4 rotate-180" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[0.75rem] text-ink-muted">Income</p>
            <p className="text-[0.9375rem] font-semibold text-income">
              {formatCurrency(summary.monthIncome, { signed: true, hide: hidden })}
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
              {formatCurrency(-summary.monthExpenses, { signed: true, hide: hidden })}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
