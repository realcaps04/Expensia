import type { Doc } from "../../convex/_generated/dataModel";
import type { TransactionIcon } from "./convex-mappers";

export type TransactionRowData = {
  id: string;
  title: string;
  category: string;
  categoryKey: Doc<"transactions">["category"];
  type: "income" | "expense";
  amount: number;
  paymentMethod: Doc<"transactions">["paymentMethod"];
  note?: string;
  eventId?: string;
  occurredAt: number;
  time: string;
  icon: TransactionIcon;
};
