import { CalendarDays } from "lucide-react";
import type { DashboardSummary } from "../../lib/types";
import { formatCurrency, formatTodayDate } from "../../lib/format";

function MetricBar({
  label,
  value,
  fillClass,
  textClass,
  pct,
}: {
  label: string;
  value: string;
  fillClass: string;
  textClass: string;
  pct: number;
}) {
  return (
    <div className="min-w-0">
      <p className={`text-[0.8125rem] font-semibold ${textClass}`}>
        <span className="inline-flex max-w-full items-baseline overflow-hidden whitespace-nowrap">
          {value}
        </span>
      </p>
      <p className="mt-0.5 text-[0.6875rem] font-medium text-ink-muted">{label}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-pill bg-slate-100">
        <div className={`h-full rounded-pill ${fillClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

type TodayOverviewProps = {
  summary: DashboardSummary;
};

export function TodayOverview({ summary }: TodayOverviewProps) {
  const max = Math.max(summary.todayIncome, summary.todayExpenses, summary.todayCredit, 1);

  return (
    <section className="rounded-card bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-[1rem] font-semibold text-ink">Today Overview</h2>
        <div className="inline-flex items-center gap-1.5 text-[0.75rem] font-medium text-ink-muted">
          <CalendarDays className="h-3.5 w-3.5" strokeWidth={2} />
          {formatTodayDate()}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <MetricBar
          label="Income"
          value={formatCurrency(summary.todayIncome, { signed: true })}
          fillClass="bg-income"
          textClass="text-income"
          pct={(summary.todayIncome / max) * 100}
        />
        <MetricBar
          label="Expenses"
          value={formatCurrency(-summary.todayExpenses, { signed: true })}
          fillClass="bg-expense"
          textClass="text-expense"
          pct={(summary.todayExpenses / max) * 100}
        />
        <MetricBar
          label="Credit"
          value={formatCurrency(summary.todayCredit)}
          fillClass="bg-sky-500"
          textClass="text-sky-600"
          pct={(summary.todayCredit / max) * 100}
        />
      </div>
    </section>
  );
}
