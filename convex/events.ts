import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";

async function assertEventOwner(ctx: { db: { get: (id: Id<"events">) => Promise<Doc<"events"> | null> } }, userId: Id<"users">, eventId: Id<"events">) {
  const event = await ctx.db.get(eventId);
  if (!event || event.userId !== userId) {
    throw new Error("Event not found.");
  }
  return event;
}

function totalsForEvent(
  eventId: Id<"events">,
  transactions: Doc<"transactions">[],
  credits: Doc<"credits">[],
) {
  let incomeTotal = 0;
  let expenseTotal = 0;
  let creditTotal = 0;
  let transactionCount = 0;
  let creditCount = 0;

  for (const tx of transactions) {
    if (tx.eventId !== eventId) continue;
    transactionCount += 1;
    if (tx.type === "income") incomeTotal += tx.amount;
    else expenseTotal += tx.amount;
  }

  for (const credit of credits) {
    if (credit.eventId !== eventId || credit.isArchived) continue;
    creditCount += 1;
    creditTotal += credit.balance;
  }

  return {
    incomeTotal,
    expenseTotal,
    creditTotal,
    net: incomeTotal - expenseTotal - creditTotal,
    transactionCount,
    creditCount,
    itemCount: transactionCount + creditCount,
  };
}

export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    if (!name) throw new Error("Enter an event name.");

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found.");

    const now = Date.now();
    const eventId = await ctx.db.insert("events", {
      userId: args.userId,
      name,
      note: args.note?.trim() || undefined,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(args.userId, { updatedAt: now, lastSeenAt: now });
    return eventId;
  },
});

export const update = mutation({
  args: {
    userId: v.id("users"),
    eventId: v.id("events"),
    name: v.optional(v.string()),
    note: v.optional(v.string()),
    isArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await assertEventOwner(ctx, args.userId, args.eventId);

    const now = Date.now();
    const patch: Partial<Doc<"events">> = { updatedAt: now };

    if (args.name !== undefined) {
      const name = args.name.trim();
      if (!name) throw new Error("Enter an event name.");
      patch.name = name;
    }
    if (args.note !== undefined) {
      patch.note = args.note.trim() || undefined;
    }
    if (args.isArchived !== undefined) {
      patch.isArchived = args.isArchived;
    }

    await ctx.db.patch(args.eventId, patch);
    await ctx.db.patch(args.userId, { updatedAt: now, lastSeenAt: now });
    return args.eventId;
  },
});

export const remove = mutation({
  args: {
    userId: v.id("users"),
    eventId: v.id("events"),
  },
  handler: async (ctx, args) => {
    await assertEventOwner(ctx, args.userId, args.eventId);

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_event", (q) =>
        q.eq("userId", args.userId).eq("eventId", args.eventId),
      )
      .collect();

    for (const tx of transactions) {
      await ctx.db.patch(tx._id, { eventId: undefined, updatedAt: Date.now() });
    }

    const credits = await ctx.db
      .query("credits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const credit of credits) {
      if (credit.eventId !== args.eventId) continue;
      await ctx.db.patch(credit._id, { eventId: undefined, updatedAt: Date.now() });
    }

    await ctx.db.delete(args.eventId);
    return args.eventId;
  },
});

export const list = query({
  args: {
    userId: v.id("users"),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("events")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const includeArchived = args.includeArchived ?? false;
    const filtered = includeArchived ? rows : rows.filter((row) => !row.isArchived);

    return filtered.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const listWithTotals = query({
  args: {
    userId: v.id("users"),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const includeArchived = args.includeArchived ?? false;
    const filtered = includeArchived ? events : events.filter((row) => !row.isArchived);

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const credits = await ctx.db
      .query("credits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return filtered
      .map((event) => ({
        ...event,
        ...totalsForEvent(event._id, transactions, credits),
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },
});
