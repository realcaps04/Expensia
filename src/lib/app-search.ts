import type { CreditActivityRowData } from "./activity-types";
import { categoryLabel, creditTypeLabel } from "./convex-mappers";
import type { TransactionRowData } from "./transaction-types";

export type AppSearchResult =
  | { kind: "transaction"; data: TransactionRowData; score: number }
  | { kind: "credit"; data: CreditActivityRowData; score: number };

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function haystackParts(parts: Array<string | undefined | null>) {
  return parts.filter(Boolean).join(" ").toLowerCase();
}

function scoreMatch(haystack: string, query: string) {
  if (!query) return 0;
  if (haystack === query) return 100;
  if (haystack.startsWith(query)) return 80;
  if (haystack.includes(query)) return 50;
  return 0;
}

export function searchAppItems(
  query: string,
  transactions: TransactionRowData[],
  credits: CreditActivityRowData[],
  limit = 8,
): AppSearchResult[] {
  const q = normalize(query);
  if (!q) return [];

  const results: AppSearchResult[] = [];

  for (const tx of transactions) {
    const haystack = haystackParts([
      tx.title,
      tx.note,
      tx.category,
      categoryLabel(tx.categoryKey),
      tx.type,
      String(tx.amount),
    ]);
    const score = scoreMatch(haystack, q);
    if (score > 0) results.push({ kind: "transaction", data: tx, score });
  }

  for (const credit of credits) {
    const haystack = haystackParts([
      credit.name,
      credit.note,
      credit.issuer,
      credit.typeLabel,
      creditTypeLabel(credit.type),
      credit.lastFour,
      String(credit.balance),
      String(credit.creditLimit),
    ]);
    const score = scoreMatch(haystack, q);
    if (score > 0) results.push({ kind: "credit", data: credit, score });
  }

  return results
    .sort((a, b) => b.score - a.score || b.data.occurredAt - a.data.occurredAt)
    .slice(0, limit);
}
