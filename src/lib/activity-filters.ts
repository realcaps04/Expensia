import type { ActivityItem } from "./activity-types";
import {
  activityCategoryKey,
  activityCategoryLabel,
  activityItemTotal,
  activityItemType,
  activityTimestamp,
} from "./activity-types";
import { monthKeyFromMs } from "./datetime";

export type ActivityGroupBy = "date" | "month" | "category" | "type";
export type ActivityTypeFilter = "all" | "income" | "expense" | "credit";

export type ActivityFilterState = {
  groupBy: ActivityGroupBy;
  typeFilter: ActivityTypeFilter;
  categoryFilter: string;
  monthFilter: string;
};

export const DEFAULT_ACTIVITY_FILTERS: ActivityFilterState = {
  groupBy: "date",
  typeFilter: "all",
  categoryFilter: "all",
  monthFilter: "all",
};

export type ActivityGroup = {
  key: string;
  label: string;
  items: ActivityItem[];
  total: number;
};

export function filterActivityItems(
  rows: ActivityItem[],
  filters: ActivityFilterState,
): ActivityItem[] {
  return rows.filter((item) => {
    const type = activityItemType(item);
    if (filters.typeFilter !== "all" && type !== filters.typeFilter) return false;
    if (filters.categoryFilter !== "all" && activityCategoryKey(item) !== filters.categoryFilter) {
      return false;
    }
    if (
      filters.monthFilter !== "all" &&
      monthKeyFromMs(activityTimestamp(item)) !== filters.monthFilter
    ) {
      return false;
    }
    return true;
  });
}

export function groupActivityItems(
  rows: ActivityItem[],
  groupBy: ActivityGroupBy,
): ActivityGroup[] {
  const map = new Map<string, ActivityItem[]>();

  for (const item of rows) {
    let key: string;
    switch (groupBy) {
      case "month":
        key = monthKeyFromMs(activityTimestamp(item));
        break;
      case "category":
        key = activityCategoryKey(item);
        break;
      case "type":
        key = activityItemType(item);
        break;
      default:
        key = new Date(activityTimestamp(item)).toDateString();
    }
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }

  const groups = [...map.entries()].map(([key, items]) => {
    const sorted = [...items].sort(
      (a, b) => activityTimestamp(b) - activityTimestamp(a),
    );
    let label = key;
    if (groupBy === "category") {
      label = activityCategoryLabel(sorted[0]!);
    } else if (groupBy === "type") {
      if (key === "income") label = "Income";
      else if (key === "expense") label = "Expenses";
      else label = "Credit";
    }
    return {
      key,
      label,
      items: sorted,
      total: sorted.reduce((sum, item) => sum + activityItemTotal(item), 0),
    };
  });

  if (groupBy === "month") {
    return groups.sort((a, b) => b.key.localeCompare(a.key));
  }
  if (groupBy === "category") {
    return groups.sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
  }
  if (groupBy === "type") {
    const order = { income: 0, expense: 1, credit: 2 };
    return groups.sort(
      (a, b) =>
        (order[a.key as keyof typeof order] ?? 99) -
        (order[b.key as keyof typeof order] ?? 99),
    );
  }
  return groups.sort(
    (a, b) => activityTimestamp(b.items[0]!) - activityTimestamp(a.items[0]!),
  );
}

export function getAvailableMonths(rows: ActivityItem[]) {
  const months = new Set(rows.map((item) => monthKeyFromMs(activityTimestamp(item))));
  return [...months].sort((a, b) => b.localeCompare(a));
}

export function getAvailableCategories(rows: ActivityItem[]) {
  const seen = new Map<string, string>();
  for (const item of rows) {
    const key = activityCategoryKey(item);
    if (!seen.has(key)) {
      seen.set(key, activityCategoryLabel(item));
    }
  }
  return [...seen.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
