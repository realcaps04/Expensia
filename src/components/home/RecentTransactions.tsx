import { Link } from "react-router-dom";
import type { TransactionRowData } from "../../lib/transaction-types";
import { TransactionListItem } from "../transactions/TransactionListItem";

type RecentTransactionsProps = {
  transactions: TransactionRowData[];
  onEditTransaction: (tx: TransactionRowData) => void;
};

export function RecentTransactions({ transactions, onEditTransaction }: RecentTransactionsProps) {
  return (
    <section>
      <div className="mb-1 flex items-center justify-between gap-3 px-1">
        <h2 className="font-display text-[1rem] font-semibold text-ink">Recent Transactions</h2>
        <Link
          to="/home/activity"
          className="text-[0.8125rem] font-semibold text-teal-brand transition-colors hover:text-teal-deep"
        >
          View all
        </Link>
      </div>

      <div className="rounded-card bg-white px-3 py-1 shadow-soft">
        {transactions.length === 0 ? (
          <div className="px-2 py-8 text-center">
            <p className="text-sm font-medium text-ink">Nothing here yet</p>
            <p className="mt-1 text-[0.8125rem] text-ink-secondary">
              Start tracking your money and your financial story will appear here.
            </p>
          </div>
        ) : (
          transactions.map((tx) => (
            <TransactionListItem key={tx.id} tx={tx} onEdit={onEditTransaction} />
          ))
        )}
      </div>
    </section>
  );
}
