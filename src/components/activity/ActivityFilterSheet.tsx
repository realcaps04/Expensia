import { SlidersHorizontal } from "lucide-react";
import { MenuSelect } from "../ui/MenuSelect";
import { BottomSheet } from "../sheets/BottomSheet";
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

type ActivityFilterSheetProps = {
  open: boolean;
  onClose: () => void;
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

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative block">
      <span className="mb-1.5 block px-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-ink-muted">
        {label}
      </span>
      <MenuSelect value={value} onChange={onChange} options={options} ariaLabel={label} />
    </div>
  );
}

export function hasActiveActivityFilters(filters: ActivityFilterState) {
  return (
    filters.groupBy !== DEFAULT_ACTIVITY_FILTERS.groupBy ||
    filters.typeFilter !== DEFAULT_ACTIVITY_FILTERS.typeFilter ||
    filters.categoryFilter !== DEFAULT_ACTIVITY_FILTERS.categoryFilter ||
    filters.monthFilter !== DEFAULT_ACTIVITY_FILTERS.monthFilter
  );
}

export function ActivityFilterButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Filter activity"
      className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-colors ${
        active
          ? "border-teal-brand/40 bg-teal-brand/10 text-teal-brand"
          : "border-surface-border bg-white text-ink-secondary hover:text-ink"
      }`}
    >
      <SlidersHorizontal className="h-[18px] w-[18px]" strokeWidth={2} />
      {active ? (
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-teal-brand" />
      ) : null}
    </button>
  );
}

export function ActivityFilterSheet({
  open,
  onClose,
  filters,
  onChange,
  months,
  categories,
}: ActivityFilterSheetProps) {
  const set = (patch: Partial<ActivityFilterState>) => {
    onChange({ ...filters, ...patch });
  };

  const resetFilters = () => onChange(DEFAULT_ACTIVITY_FILTERS);
  const canReset = hasActiveActivityFilters(filters);

  const monthOptions = [
    { value: "all", label: "All months" },
    ...months.map((month) => ({ value: month, label: formatMonthHeader(month) })),
  ];

  const categoryOptions = [
    { value: "all", label: "All categories" },
    ...categories,
  ];

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Filters"
      footer={
        <div className="flex gap-2">
          {canReset ? (
            <button
              type="button"
              onClick={resetFilters}
              className="flex-1 rounded-[16px] border border-surface-border bg-white py-3.5 text-[0.9375rem] font-semibold text-ink transition-colors hover:bg-slate-50"
            >
              Reset
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[16px] bg-gradient-to-r from-teal-brand to-teal-deep py-3.5 text-[0.9375rem] font-semibold text-white shadow-[0_10px_24px_rgba(196,94,18,0.28)] transition-transform active:scale-[0.98]"
          >
            Done
          </button>
        </div>
      }
    >
      <div className="space-y-5 pb-2">
        <div>
          <p className="mb-2 px-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-ink-muted">
            Group by
          </p>
          <div className="flex flex-wrap gap-2">
            {GROUP_OPTIONS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => set({ groupBy: id })}
                className={`rounded-pill px-4 py-2 text-[0.8125rem] font-semibold transition-colors ${chipClass(filters.groupBy === id)}`}
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
          <div className="flex flex-wrap gap-2">
            {TYPE_OPTIONS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => set({ typeFilter: id })}
                className={`rounded-pill px-4 py-2 text-[0.8125rem] font-semibold transition-colors ${chipClass(filters.typeFilter === id)}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FilterSelect
            label="Month"
            value={filters.monthFilter}
            options={monthOptions}
            onChange={(monthFilter) => set({ monthFilter })}
          />
          <FilterSelect
            label="Category"
            value={filters.categoryFilter}
            options={categoryOptions}
            onChange={(categoryFilter) => set({ categoryFilter })}
          />
        </div>
      </div>
    </BottomSheet>
  );
}
