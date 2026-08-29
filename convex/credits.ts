import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { creditType } from "./validators";

async function insertLinkedIncome(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    name: string;
    amount: number;
    note?: string;
    occurredAt: number;
    now: number;
  },
) {
  if (args.amount <= 0) return undefined;

  return await ctx.db.insert("transactions", {
    userId: args.userId,
    type: "income",
    amount: args.amount,
    title: args.name.trim(),
    category: "other",
    paymentMethod: "bank_transfer",
    note: args.note?.trim() || "Added from credit account",
    occurredAt: args.occurredAt,
    createdAt: args.now,
    updatedAt: args.now,
  });
}

async function syncLinkedIncome(
  ctx: MutationCtx,
  linkedIncomeId: Id<"transactions"> | undefined,
  args: {
    userId: Id<"users">;
    name: string;
    amount: number;
    note?: string;
    occurredAt: number;
    now: number;
  },
) {
  if (!linkedIncomeId) return linkedIncomeId;

  const income = await ctx.db.get(linkedIncomeId);
  if (!income || income.userId !== args.userId) return linkedIncomeId;

  if (args.amount <= 0) {
    await ctx.db.delete(linkedIncomeId);
    return undefined;
  }

  await ctx.db.patch(linkedIncomeId, {
    amount: args.amount,
    title: args.name.trim(),
    note: args.note?.trim() || "Added from credit account",
    occurredAt: args.occurredAt,
    updatedAt: args.now,
  });

  return linkedIncomeId;
}

function assertValidCredit(args: {
  creditLimit: number;
  balance: number;
  dueDay?: number;
  minimumPayment?: number;
  apr?: number;
}) {
  if (args.creditLimit < 0) {
    throw new Error("Credit limit cannot be negative.");
  }
  if (args.balance < 0) {
    throw new Error("Balance cannot be negative.");
  }
  if (args.balance > args.creditLimit) {
    throw new Error("Balance cannot exceed the credit limit.");
  }
  if (args.dueDay !== undefined && (args.dueDay < 1 || args.dueDay > 31)) {
    throw new Error("Due day must be between 1 and 31.");
  }
  if (args.minimumPayment !== undefined && args.minimumPayment < 0) {
    throw new Error("Minimum payment cannot be negative.");
  }
  if (args.apr !== undefined && (args.apr < 0 || args.apr > 100)) {
    throw new Error("APR must be between 0 and 100.");
  }
}

export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    type: creditType,
    issuer: v.optional(v.string()),
    creditLimit: v.number(),
    balance: v.number(),
    minimumPayment: v.optional(v.number()),
    dueDay: v.optional(v.number()),
    apr: v.optional(v.number()),
    lastFour: v.optional(v.string()),
    note: v.optional(v.string()),
    startDate: v.optional(v.number()),
    tenureMonths: v.optional(v.number()),
    emiPaidCount: v.optional(v.number()),
    addAsIncome: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found.");

    assertValidCredit(args);

    const now = Date.now();
    const occurredAt = args.startDate ?? now;
    const linkedIncomeId = args.addAsIncome
      ? await insertLinkedIncome(ctx, {
          userId: args.userId,
          name: args.name,
          amount: args.creditLimit,
          note: args.note,
          occurredAt,
          now,
        })
      : undefined;

    const creditId = await ctx.db.insert("credits", {
      userId: args.userId,
      name: args.name.trim(),
      type: args.type,
      issuer: args.issuer?.trim() || undefined,
      creditLimit: args.creditLimit,
      balance: args.balance,
      minimumPayment: args.minimumPayment,
      dueDay: args.dueDay,
      apr: args.apr,
      lastFour: args.lastFour?.trim() || undefined,
      note: args.note?.trim() || undefined,
      startDate: args.startDate,
      tenureMonths: args.tenureMonths,
      emiPaidCount: args.emiPaidCount ?? (args.type === "personal_loan" ? 0 : undefined),
      linkedIncomeId,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(args.userId, { updatedAt: now, lastSeenAt: now });
    return creditId;
  },
});

export const list = query({
  args: {
    userId: v.id("users"),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("credits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const includeArchived = args.includeArchived ?? false;
    const filtered = includeArchived ? rows : rows.filter((row) => !row.isArchived);

    return filtered.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const getSummary = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("credits")
      .withIndex("by_user_and_archived", (q) =>
        q.eq("userId", args.userId).eq("isArchived", false),
      )
      .collect();

    let totalLimit = 0;
    let totalBalance = 0;
    let totalAvailable = 0;

    for (const row of rows) {
      totalLimit += row.creditLimit;
      totalBalance += row.balance;
      totalAvailable += Math.max(row.creditLimit - row.balance, 0);
    }

    return {
      accountCount: rows.length,
      totalLimit,
      totalBalance,
      totalAvailable,
      utilization: totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0,
    };
  },
});

export const update = mutation({
  args: {
    userId: v.id("users"),
    creditId: v.id("credits"),
    name: v.optional(v.string()),
    type: v.optional(creditType),
    issuer: v.optional(v.string()),
    creditLimit: v.optional(v.number()),
    balance: v.optional(v.number()),
    minimumPayment: v.optional(v.number()),
    dueDay: v.optional(v.number()),
    apr: v.optional(v.number()),
    lastFour: v.optional(v.string()),
    note: v.optional(v.string()),
    startDate: v.optional(v.number()),
    tenureMonths: v.optional(v.number()),
    emiPaidCount: v.optional(v.number()),
    isArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const credit = await ctx.db.get(args.creditId);
    if (!credit || credit.userId !== args.userId) {
      throw new Error("Credit account not found.");
    }

    const next = {
      creditLimit: args.creditLimit ?? credit.creditLimit,
      balance: args.balance ?? credit.balance,
      dueDay: args.dueDay ?? credit.dueDay,
      minimumPayment: args.minimumPayment ?? credit.minimumPayment,
      apr: args.apr ?? credit.apr,
    };
    assertValidCredit(next);

    const now = Date.now();
    const nextName = args.name !== undefined ? args.name.trim() : credit.name;
    const nextLimit = args.creditLimit ?? credit.creditLimit;
    const nextNote = args.note !== undefined ? args.note.trim() || undefined : credit.note;
    const nextStartDate = args.startDate !== undefined ? args.startDate : credit.startDate;
    const occurredAt = nextStartDate ?? credit.createdAt;

    let linkedIncomeId = credit.linkedIncomeId;
    if (linkedIncomeId) {
      linkedIncomeId = await syncLinkedIncome(ctx, linkedIncomeId, {
        userId: args.userId,
        name: nextName,
        amount: nextLimit,
        note: nextNote,
        occurredAt,
        now,
      });
    }

    await ctx.db.patch(args.creditId, {
      ...(args.name !== undefined ? { name: nextName } : {}),
      ...(args.type !== undefined ? { type: args.type } : {}),
      ...(args.issuer !== undefined ? { issuer: args.issuer.trim() || undefined } : {}),
      ...(args.creditLimit !== undefined ? { creditLimit: args.creditLimit } : {}),
      ...(args.balance !== undefined ? { balance: args.balance } : {}),
      ...(args.minimumPayment !== undefined ? { minimumPayment: args.minimumPayment } : {}),
      ...(args.dueDay !== undefined ? { dueDay: args.dueDay } : {}),
      ...(args.apr !== undefined ? { apr: args.apr } : {}),
      ...(args.lastFour !== undefined ? { lastFour: args.lastFour.trim() || undefined } : {}),
      ...(args.note !== undefined ? { note: nextNote } : {}),
      ...(args.startDate !== undefined ? { startDate: args.startDate } : {}),
      ...(args.tenureMonths !== undefined ? { tenureMonths: args.tenureMonths } : {}),
      ...(args.emiPaidCount !== undefined ? { emiPaidCount: args.emiPaidCount } : {}),
      ...(args.isArchived !== undefined ? { isArchived: args.isArchived } : {}),
      linkedIncomeId,
      updatedAt: now,
    });

    await ctx.db.patch(args.userId, { updatedAt: now, lastSeenAt: now });
    return args.creditId;
  },
});

export const remove = mutation({
  args: {
    userId: v.id("users"),
    creditId: v.id("credits"),
  },
  handler: async (ctx, args) => {
    const credit = await ctx.db.get(args.creditId);
    if (!credit || credit.userId !== args.userId) {
      throw new Error("Credit account not found.");
    }
    if (credit.linkedIncomeId) {
      const income = await ctx.db.get(credit.linkedIncomeId);
      if (income && income.userId === args.userId) {
        await ctx.db.delete(credit.linkedIncomeId);
      }
    }
    await ctx.db.delete(args.creditId);
    return args.creditId;
  },
});
