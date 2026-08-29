import { ChevronDown, Eye, EyeOff, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { BALANCE_SPARKLINE } from "../../data/mock";
import type { DashboardSummary } from "../../lib/types";
import { formatCurrency } from "../../lib/format";

function BalanceSparkline() {
  const points = BALANCE_SPARKLINE;
  const width = 120;
  const height = 48;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const coords = points.map((value, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });

  const linePath = `M ${coords.join(" L ")}`;
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;
  const last = coords[coords.length - 1].split(",");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-12 w-[7.5rem] shrink-0" aria-hidden>
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#14B8A6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkFill)" />
      <path d={linePath} fill="none" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="4" fill="#14B8A6" />
    </svg>
  );
}

type BalanceCardProps = {
  summary: DashboardSummary;
};

export function BalanceCard({ summary }: BalanceCardProps) {
  const [hidden, setHidden] = useState(false);
  const changePct =
    summary.transactionCount > 0
      ? Math.min(Math.abs(Math.round((summary.todayNet / Math.max(summary.totalBalance, 1)) * 100)), 99)
      : 0;

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
          {summary.transactionCount > 0 ? (
            <p className="mt-1 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-income">
              <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.5} />
              {changePct}% vs yesterday
            </p>
          ) : (
            <p className="mt-1 text-[0.8125rem] text-ink-muted">No activity yet</p>
          )}
        </div>
        {!hidden && summary.transactionCount > 0 ? <BalanceSparkline /> : null}
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
