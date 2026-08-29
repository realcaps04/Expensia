import type { CreditType } from "./types";
import type { TransactionRowData } from "./transaction-types";

export type CreditActivityRowData = {
  id: string;
  name: string;
  type: CreditType;
  typeLabel: string;
  balance: number;
  creditLimit: number;
  issuer?: string;
  note?: string;
  occurredAt: number;
  time: string;
  lastFour?: string;
};

export type ActivityItem =
  | { kind: "transaction"; data: TransactionRowData }
  | { kind: "credit"; data: CreditActivityRowData };

export function activityTimestamp(item: ActivityItem) {
  return item.kind === "transaction" ? item.data.occurredAt : item.data.occurredAt;
}

export function activityItemTotal(item: ActivityItem) {
  if (item.kind === "transaction") {
    return item.data.type === "income" ? item.data.amount : -item.data.amount;
  }
  return -item.data.balance;
}

export type ActivityItemType = "income" | "expense" | "credit";

export function activityItemType(item: ActivityItem): ActivityItemType {
  if (item.kind === "credit") return "credit";
  return item.data.type;
}

export function activityCategoryKey(item: ActivityItem) {
  if (item.kind === "credit") return "credit";
  return item.data.categoryKey;
}

export function activityCategoryLabel(item: ActivityItem) {
  if (item.kind === "credit") return "Credit";
  return item.data.category;
}
