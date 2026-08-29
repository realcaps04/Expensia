export const INCOME_CATEGORIES = [
  { value: "salary", label: "Salary" },
  { value: "freelance", label: "Freelance" },
  { value: "other", label: "Other" },
] as const;

export const EXPENSE_CATEGORIES = [
  { value: "food", label: "Food & Dining" },
  { value: "transport", label: "Transport" },
  { value: "shopping", label: "Shopping" },
  { value: "bills", label: "Bills" },
  { value: "entertainment", label: "Entertainment" },
  { value: "health", label: "Health" },
  { value: "other", label: "Other" },
] as const;

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "other", label: "Other" },
] as const;

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number]["value"];
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]["value"];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

export function paymentMethodLabel(value: string) {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value;
}

export function categoryLabelFor(value: string, type: "income" | "expense") {
  const list = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return list.find((c) => c.value === value)?.label ?? value;
}
