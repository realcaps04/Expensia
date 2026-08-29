import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { category, paymentMethod, transactionType } from "./validators";

export const create = mutation({
  args: {
    userId: v.id("users"),
    type: transactionType,
    amount: v.number(),
    title: v.string(),
    category,
    paymentMethod,
    note: v.optional(v.string()),
    occurredAt: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.amount <= 0) {
      throw new Error("Amount must be greater than zero.");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found.");

    const now = Date.now();
    const transactionId = await ctx.db.insert("transactions", {
      userId: args.userId,
      type: args.type,
      amount: args.amount,
      title: args.title.trim(),
      category: args.category,
      paymentMethod: args.paymentMethod,
      note: args.note?.trim() || undefined,
      occurredAt: args.occurredAt,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(args.userId, { updatedAt: now, lastSeenAt: now });
    return transactionId;
  },
});

export const listRecent = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    return await ctx.db
      .query("transactions")
      .withIndex("by_user_and_time", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

export const listByDay = query({
  args: {
    userId: v.id("users"),
    dayStart: v.number(),
    dayEnd: v.number(),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_time", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return rows.filter((tx) => tx.occurredAt >= args.dayStart && tx.occurredAt <= args.dayEnd);
  },
});

export const listByRange = query({
  args: {
    userId: v.id("users"),
    start: v.number(),
    end: v.number(),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_time", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return rows.filter((tx) => tx.occurredAt >= args.start && tx.occurredAt <= args.end);
  },
});

export const update = mutation({
  args: {
    userId: v.id("users"),
    transactionId: v.id("transactions"),
    type: transactionType,
    amount: v.number(),
    title: v.string(),
    category,
    paymentMethod,
    note: v.optional(v.string()),
    occurredAt: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.amount <= 0) {
      throw new Error("Amount must be greater than zero.");
    }

    const tx = await ctx.db.get(args.transactionId);
    if (!tx || tx.userId !== args.userId) {
      throw new Error("Transaction not found.");
    }

    const now = Date.now();
    await ctx.db.patch(args.transactionId, {
      type: args.type,
      amount: args.amount,
      title: args.title.trim(),
      category: args.category,
      paymentMethod: args.paymentMethod,
      note: args.note?.trim() || undefined,
      occurredAt: args.occurredAt,
      updatedAt: now,
    });

    await ctx.db.patch(args.userId, { updatedAt: now, lastSeenAt: now });
    return args.transactionId;
  },
});

export const remove = mutation({
  args: {
    userId: v.id("users"),
    transactionId: v.id("transactions"),
  },
  handler: async (ctx, args) => {
    const tx = await ctx.db.get(args.transactionId);
    if (!tx || tx.userId !== args.userId) {
      throw new Error("Transaction not found.");
    }
    await ctx.db.delete(args.transactionId);
    return args.transactionId;
  },
});
