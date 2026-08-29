export type ProfileAchievement = {
  id: string;
  title: string;
  description: string;
  emoji: string;
};

type ProfileStatsInput = {
  transactionCount: number;
  creditCount: number;
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  incomeCount: number;
  expenseCount: number;
};

export function getProfileAchievements(stats: ProfileStatsInput | undefined): ProfileAchievement[] {
  if (!stats) return [];

  const items: ProfileAchievement[] = [];

  if (stats.transactionCount >= 1) {
    items.push({
      id: "first-transaction",
      title: "First Step",
      description: "Recorded your first transaction",
      emoji: "✨",
    });
  }

  if (stats.incomeCount >= 1) {
    items.push({
      id: "first-income",
      title: "Income Tracker",
      description: "Logged income in Expensia",
      emoji: "💰",
    });
  }

  if (stats.expenseCount >= 5) {
    items.push({
      id: "expense-tracker",
      title: "Expense Tracker",
      description: "Tracked 5 or more expenses",
      emoji: "📊",
    });
  }

  if (stats.creditCount >= 1) {
    items.push({
      id: "credit-tracker",
      title: "Credit Tracker",
      description: "Added a credit or loan account",
      emoji: "💳",
    });
  }

  if (stats.savings > 0) {
    items.push({
      id: "positive-savings",
      title: "In the Green",
      description: "Your income exceeds expenses overall",
      emoji: "🎯",
    });
  }

  if (stats.transactionCount >= 10) {
    items.push({
      id: "active-user",
      title: "Active User",
      description: "Logged 10 or more transactions",
      emoji: "🔥",
    });
  }

  return items;
}

export function providerLabel(provider: "email" | "google" | undefined) {
  if (provider === "google") return "Google account";
  if (provider === "email") return "Email account";
  return "Expensia member";
}

export function formatLastSeen(ms: number | undefined) {
  if (!ms) return "Unknown";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(ms));
}
