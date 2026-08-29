import type { Doc } from "../../convex/_generated/dataModel";

export type PublicUser = {
  _id: Doc<"users">["_id"];
  provider: Doc<"users">["provider"];
  email: string;
  firstName: string;
  lastName: string;
  pictureUrl?: string;
  contactNumber?: string;
  settings: Doc<"users">["settings"];
  createdAt: number;
  updatedAt: number;
  lastSeenAt: number;
};

export function convexUserToProfile(user: PublicUser) {
  return {
    id: user._id,
    convexId: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    picture: user.pictureUrl,
    provider: user.provider,
  };
}

export function googleProfileToUpsertArgs(profile: {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}) {
  return {
    googleSub: profile.sub,
    email: profile.email,
    googleName: profile.name,
    firstName: profile.given_name,
    lastName: profile.family_name,
    pictureUrl: profile.picture,
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  food: "Food & Dining",
  transport: "Transport",
  shopping: "Shopping",
  bills: "Bills",
  entertainment: "Entertainment",
  health: "Health",
  salary: "Salary",
  freelance: "Freelance",
  other: "Other",
};

export function categoryLabel(category: string) {
  return CATEGORY_LABELS[category] ?? category;
}

export type TransactionIcon = "briefcase" | "food" | "transport" | "shopping";

export function categoryIcon(category: string): TransactionIcon {
  switch (category) {
    case "food":
      return "food";
    case "transport":
      return "transport";
    case "shopping":
      return "shopping";
    default:
      return "briefcase";
  }
}

export function formatTransactionTime(ms: number) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(ms));
}

export function mapTransactionRow(tx: Doc<"transactions">) {
  const typeLabel = tx.type === "income" ? "Income" : categoryLabel(tx.category);
  return {
    id: tx._id,
    title: tx.title,
    category: typeLabel,
    categoryKey: tx.category,
    type: tx.type,
    amount: tx.amount,
    paymentMethod: tx.paymentMethod,
    note: tx.note,
    eventId: tx.eventId,
    occurredAt: tx.occurredAt,
    time: formatTransactionTime(tx.occurredAt),
    icon: categoryIcon(tx.category),
  };
}

export function mapCreditRow(credit: Doc<"credits">) {
  return {
    id: credit._id,
    name: credit.name,
    type: credit.type,
    issuer: credit.issuer,
    creditLimit: credit.creditLimit,
    balance: credit.balance,
    available: Math.max(credit.creditLimit - credit.balance, 0),
    minimumPayment: credit.minimumPayment,
    dueDay: credit.dueDay,
    apr: credit.apr,
    lastFour: credit.lastFour,
    note: credit.note,
    startDate: credit.startDate,
    tenureMonths: credit.tenureMonths,
    emiPaidCount: credit.emiPaidCount,
    isArchived: credit.isArchived,
    eventId: credit.eventId,
    createdAt: credit.createdAt,
  };
}

const CREDIT_TYPE_LABELS: Record<string, string> = {
  credit_card: "Credit Card",
  personal_loan: "Personal Loan",
  line_of_credit: "Line of Credit",
  other: "Credit",
};

export function creditTypeLabel(type: string) {
  return CREDIT_TYPE_LABELS[type] ?? "Credit";
}

export function mapCreditActivityRow(credit: Doc<"credits">) {
  const occurredAt = credit.startDate ?? credit.createdAt;
  return {
    id: credit._id,
    name: credit.name,
    type: credit.type,
    typeLabel: creditTypeLabel(credit.type),
    balance: credit.balance,
    creditLimit: credit.creditLimit,
    issuer: credit.issuer,
    note: credit.note,
    occurredAt,
    time: formatTransactionTime(occurredAt),
    lastFour: credit.lastFour,
    minimumPayment: credit.minimumPayment,
    dueDay: credit.dueDay,
    apr: credit.apr,
    startDate: credit.startDate,
    tenureMonths: credit.tenureMonths,
    emiPaidCount: credit.emiPaidCount,
    eventId: credit.eventId,
  };
}
