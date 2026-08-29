import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { category } from "./validators";
import {
  endOfDayMs,
  endOfMonthMs,
  monthKeyFromDate,
  startOfDayMs,
  startOfMonthMs,
} from "./lib/helpers";

function sumByType(transactions: { type: "income" | "expense"; amount: number }[]) {
  let income = 0;
  let expenses = 0;
  for (const tx of transactions) {
    if (tx.type === "income") income += tx.amount;
    else expenses += tx.amount;
  }
  return { income, expenses, net: income - expenses };
}

export const getDashboard = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const now = new Date();
    const monthStart = startOfMonthMs(now);
    const monthEnd = endOfMonthMs(now);
    const dayStart = startOfDayMs(now);
    const dayEnd = endOfDayMs(now);

    const monthTx = all.filter((tx) => tx.occurredAt >= monthStart && tx.occurredAt <= monthEnd);
    const todayTx = all.filter((tx) => tx.occurredAt >= dayStart && tx.occurredAt <= dayEnd);

    const lifetime = sumByType(all);
    const month = sumByType(monthTx);
    const today = sumByType(todayTx);

    const budget = await ctx.db
      .query("budgets")
      .withIndex("by_user_and_month", (q) =>
        q.eq("userId", args.userId).eq("monthKey", monthKeyFromDate(now)),
      )
      .unique();

    return {
      totalBalance: lifetime.net,
      monthIncome: month.income,
      monthExpenses: month.expenses,
      monthNet: month.net,
      todayIncome: today.income,
      todayExpenses: today.expenses,
      todayNet: today.net,
      transactionCount: all.length,
      monthlyBudget: budget?.totalLimit,
    };
  },
});

export const getSpendingByCategory = query({
  args: {
    userId: v.id("users"),
    start: v.number(),
    end: v.number(),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const expenses = rows.filter(
      (tx) => tx.type === "expense" && tx.occurredAt >= args.start && tx.occurredAt <= args.end,
    );

    const totals = new Map<string, number>();
    for (const tx of expenses) {
      totals.set(tx.category, (totals.get(tx.category) ?? 0) + tx.amount);
    }

    const total = [...totals.values()].reduce((a, b) => a + b, 0);
    return [...totals.entries()]
      .map(([cat, amount]) => ({
        category: cat,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  },
});

export const upsertMonthlyBudget = mutation({
  args: {
    userId: v.id("users"),
    monthKey: v.optional(v.string()),
    totalLimit: v.number(),
  },
  handler: async (ctx, args) => {
    const monthKey = args.monthKey ?? monthKeyFromDate();
    const existing = await ctx.db
      .query("budgets")
      .withIndex("by_user_and_month", (q) =>
        q.eq("userId", args.userId).eq("monthKey", monthKey),
      )
      .unique();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { totalLimit: args.totalLimit, updatedAt: now });
      return existing._id;
    }

    return await ctx.db.insert("budgets", {
      userId: args.userId,
      monthKey,
      totalLimit: args.totalLimit,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const upsertCategoryBudget = mutation({
  args: {
    userId: v.id("users"),
    monthKey: v.optional(v.string()),
    category,
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const monthKey = args.monthKey ?? monthKeyFromDate();
    const existing = await ctx.db
      .query("categoryBudgets")
      .withIndex("by_user_month_category", (q) =>
        q.eq("userId", args.userId).eq("monthKey", monthKey).eq("category", args.category),
      )
      .unique();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { limit: args.limit, updatedAt: now });
      return existing._id;
    }

    return await ctx.db.insert("categoryBudgets", {
      userId: args.userId,
      monthKey,
      category: args.category,
      limit: args.limit,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getBudgetOverview = query({
  args: {
    userId: v.id("users"),
    monthKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const monthKey = args.monthKey ?? monthKeyFromDate();
    const [year, month] = monthKey.split("-").map(Number);
    const start = startOfMonthMs(new Date(year, month - 1, 1));
    const end = endOfMonthMs(new Date(year, month - 1, 1));

    const budget = await ctx.db
      .query("budgets")
      .withIndex("by_user_and_month", (q) =>
        q.eq("userId", args.userId).eq("monthKey", monthKey),
      )
      .unique();

    const categoryBudgets = await ctx.db
      .query("categoryBudgets")
      .withIndex("by_user_and_month", (q) =>
        q.eq("userId", args.userId).eq("monthKey", monthKey),
      )
      .collect();

    const monthTx = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const expenses = monthTx.filter(
      (tx) => tx.type === "expense" && tx.occurredAt >= start && tx.occurredAt <= end,
    );

    const spent = expenses.reduce((sum, tx) => sum + tx.amount, 0);
    const spentByCategory = new Map<string, number>();
    for (const tx of expenses) {
      spentByCategory.set(tx.category, (spentByCategory.get(tx.category) ?? 0) + tx.amount);
    }

    return {
      monthKey,
      totalLimit: budget?.totalLimit ?? 0,
      spent,
      remaining: Math.max((budget?.totalLimit ?? 0) - spent, 0),
      categoryBudgets: categoryBudgets.map((row) => ({
        category: row.category,
        limit: row.limit,
        spent: spentByCategory.get(row.category) ?? 0,
      })),
    };
  },
});
