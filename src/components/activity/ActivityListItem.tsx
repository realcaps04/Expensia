import type { ActivityItem } from "../../lib/activity-types";
import type { CreditActivityRowData } from "../../lib/activity-types";
import type { TransactionRowData } from "../../lib/transaction-types";
import { CreditListItem } from "./CreditListItem";
import { TransactionListItem } from "../transactions/TransactionListItem";

type ActivityListItemProps = {
  item: ActivityItem;
  onEditTransaction: (tx: TransactionRowData) => void;
  onEditCredit?: (credit: CreditActivityRowData) => void;
  onDeleteTransaction?: (tx: TransactionRowData) => void;
  onDeleteCredit?: (credit: CreditActivityRowData) => void;
  showActions?: boolean;
};

export function ActivityListItem({
  item,
  onEditTransaction,
  onEditCredit,
  onDeleteTransaction,
  onDeleteCredit,
  showActions = false,
}: ActivityListItemProps) {
  if (item.kind === "credit") {
    return (
      <CreditListItem
        credit={item.data}
        showActions={showActions}
        onEdit={onEditCredit}
        onDelete={onDeleteCredit}
      />
    );
  }

  return (
    <TransactionListItem
      tx={item.data}
      showActions={showActions}
      onEdit={onEditTransaction}
      onDelete={onDeleteTransaction}
    />
  );
}
