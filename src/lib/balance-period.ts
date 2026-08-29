import { formatDisplayDate, formatMonthHeader, parseDateInputToMs, toDateInputValue } from "./datetime";

export type BalancePeriod =
  | { kind: "today" }
  | { kind: "yesterday" }
  | { kind: "week" }
  | { kind: "month" }
  | { kind: "all" }
  | { kind: "date"; date: string }
  | { kind: "monthKey"; monthKey: string };

export const DEFAULT_BALANCE_PERIOD: BalancePeriod = { kind: "month" };

function startOfDayMs(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function endOfDayMs(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

function startOfMonthMs(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth(), 1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function endOfMonthMs(date: Date) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function monthKeyFromDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export type BalancePeriodRange = {
  start: number;
  end: number;
  label: string;
  creditLabel: string;
  compareLabel: string | null;
};

export function balancePeriodRange(period: BalancePeriod, now = new Date()): BalancePeriodRange {
  switch (period.kind) {
    case "today":
      return {
        start: startOfDayMs(now),
        end: endOfDayMs(now),
        label: "Today",
        creditLabel: "today",
        compareLabel: "yesterday",
      };
    case "yesterday": {
      const day = addDays(now, -1);
      return {
        start: startOfDayMs(day),
        end: endOfDayMs(day),
        label: "Yesterday",
        creditLabel: "yesterday",
        compareLabel: "the day before",
      };
    }
    case "week":
      return {
        start: startOfDayMs(addDays(now, -6)),
        end: endOfDayMs(now),
        label: "Last 7 Days",
        creditLabel: "in the last 7 days",
        compareLabel: "prior 7 days",
      };
    case "month":
      return {
        start: startOfMonthMs(now),
        end: endOfMonthMs(now),
        label: "This Month",
        creditLabel: "this month",
        compareLabel: "last month",
      };
    case "all":
      return {
        start: 0,
        end: endOfDayMs(now),
        label: "All Time",
        creditLabel: "all time",
        compareLabel: null,
      };
    case "date":
      return {
        start: startOfDayMs(new Date(parseDateInputToMs(period.date))),
        end: endOfDayMs(new Date(parseDateInputToMs(period.date))),
        label: formatDisplayDate(period.date),
        creditLabel: `on ${formatDisplayDate(period.date)}`,
        compareLabel: "previous day",
      };
    case "monthKey": {
      const [year, month] = period.monthKey.split("-").map(Number);
      const anchor = new Date(year, month - 1, 1);
      const monthLabel = formatMonthHeader(period.monthKey);
      return {
        start: startOfMonthMs(anchor),
        end: endOfMonthMs(anchor),
        label: monthLabel,
        creditLabel: `in ${monthLabel}`,
        compareLabel: "prior month",
      };
    }
  }
}

export const BALANCE_PERIOD_PRESETS: { id: BalancePeriod["kind"]; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "week", label: "Last 7 Days" },
  { id: "month", label: "This Month" },
  { id: "all", label: "All Time" },
];

export function isSameBalancePeriod(a: BalancePeriod, b: BalancePeriod) {
  if (a.kind !== b.kind) return false;
  if (a.kind === "date" && b.kind === "date") return a.date === b.date;
  if (a.kind === "monthKey" && b.kind === "monthKey") return a.monthKey === b.monthKey;
  return true;
}

export function presetFromKind(kind: BalancePeriod["kind"]): BalancePeriod {
  if (kind === "date") return { kind: "date", date: toDateInputValue() };
  if (kind === "monthKey") return { kind: "monthKey", monthKey: monthKeyFromDate(new Date()) };
  return { kind };
}
