import {
  DEFAULT_ACTIVITY_FILTERS,
  type ActivityFilterState,
  type ActivityGroupBy,
  type ActivityTypeFilter,
} from "../../lib/activity-filters";
import { formatMonthHeader } from "../../lib/datetime";

const GROUP_OPTIONS: { id: ActivityGroupBy; label: string }[] = [
  { id: "date", label: "Date" },
  { id: "month", label: "Month" },
  { id: "category", label: "Category" },
  { id: "type", label: "Type" },
];

const TYPE_OPTIONS: { id: ActivityTypeFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "income", label: "Income" },
  { id: "expense", label: "Expense" },
  { id: "credit", label: "Credit" },
];

type ActivityFilterBarProps = {
  filters: ActivityFilterState;
  onChange: (filters: ActivityFilterState) => void;
  months: string[];
  categories: { value: string; label: string }[];
};

function chipClass(active: boolean) {
  return active
    ? "bg-teal-brand text-white shadow-sm"
    : "bg-white text-ink-secondary shadow-[0_1px_4px_rgba(15,23,42,0.06)]";
}

export function ActivityFilterBar({
  filters,
  onChange,
  months,
  categories,
}: ActivityFilterBarProps) {
  const set = (patch: Partial<ActivityFilterState>) => {
    onChange({ ...filters, ...patch });
  };

  const resetFilters = () => onChange(DEFAULT_ACTIVITY_FILTERS);

  const hasExtraFilters =
    filters.typeFilter !== "all" ||
    filters.categoryFilter !== "all" ||
    filters.monthFilter !== "all";

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-2 px-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-ink-muted">
          Group by
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {GROUP_OPTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => set({ groupBy: id })}
              className={`shrink-0 rounded-pill px-4 py-2 text-[0.8125rem] font-semibold transition-colors ${chipClass(filters.groupBy === id)}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 px-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-ink-muted">
          Type
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TYPE_OPTIONS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => set({ typeFilter: id })}
              className={`shrink-0 rounded-pill px-4 py-2 text-[0.8125rem] font-semibold transition-colors ${chipClass(filters.typeFilter === id)}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block px-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-ink-muted">
            Month
          </span>
          <select
            value={filters.monthFilter}
            onChange={(e) => set({ monthFilter: e.target.value })}
            className="w-full rounded-[12px] border border-surface-border bg-white px-3 py-2.5 text-[0.8125rem] font-medium text-ink focus:border-teal-brand/40 focus:outline-none focus:ring-2 focus:ring-teal-brand/15"
          >
            <option value="all">All months</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {formatMonthHeader(month)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block px-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-ink-muted">
            Category
          </span>
          <select
            value={filters.categoryFilter}
            onChange={(e) => set({ categoryFilter: e.target.value })}
            className="w-full rounded-[12px] border border-surface-border bg-white px-3 py-2.5 text-[0.8125rem] font-medium text-ink focus:border-teal-brand/40 focus:outline-none focus:ring-2 focus:ring-teal-brand/15"
          >
            <option value="all">All categories</option>
            {categories.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {hasExtraFilters || filters.groupBy !== "date" ? (
        <button
          type="button"
          onClick={resetFilters}
          className="px-1 text-[0.8125rem] font-semibold text-teal-brand transition-colors hover:text-teal-deep"
        >
          Reset filters
        </button>
      ) : null}
    </div>
  );
}
