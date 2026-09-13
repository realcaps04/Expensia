import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";

const purchaseItemInput = v.object({
  name: v.string(),
  quantity: v.number(),
  unitPrice: v.number(),
  note: v.optional(v.string()),
});

async function assertListOwner(
  ctx: { db: { get: (id: Id<"purchaseLists">) => Promise<Doc<"purchaseLists"> | null> } },
  userId: Id<"users">,
  listId: Id<"purchaseLists">,
) {
  const list = await ctx.db.get(listId);
  if (!list || list.userId !== userId) {
    throw new Error("Purchase list not found.");
  }
  return list;
}

function normalizeItems(
  items: Array<{ name: string; quantity: number; unitPrice: number; note?: string }>,
) {
  if (items.length === 0) {
    throw new Error("Add at least one purchase item.");
  }

  const seen = new Set<string>();

  return items.map((item, index) => {
    const name = item.name.trim();
    if (!name) throw new Error(`Enter a name for item ${index + 1}.`);

    const key = name.toLowerCase();
    if (seen.has(key)) {
      throw new Error(`"${name}" is already on this list. Duplicate items are not allowed.`);
    }
    seen.add(key);

    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      throw new Error(`Enter a valid quantity for "${name}".`);
    }
    if (!Number.isFinite(item.unitPrice) || item.unitPrice < 0) {
      throw new Error(`Enter a valid price for "${name}".`);
    }
    return {
      name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      note: item.note?.trim() || undefined,
    };
  });
}

function totalsForItems(items: Doc<"purchaseItems">[]) {
  let itemCount = 0;
  let totalQuantity = 0;
  let totalAmount = 0;

  for (const item of items) {
    itemCount += 1;
    totalQuantity += item.quantity;
    totalAmount += item.quantity * item.unitPrice;
  }

  return { itemCount, totalQuantity, totalAmount };
}

export const create = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    note: v.optional(v.string()),
    purchasedAt: v.optional(v.number()),
    items: v.array(purchaseItemInput),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    if (!name) throw new Error("Enter a list name.");

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found.");

    const items = normalizeItems(args.items);
    const now = Date.now();
    const purchasedAt = args.purchasedAt ?? now;

    const listId = await ctx.db.insert("purchaseLists", {
      userId: args.userId,
      name,
      note: args.note?.trim() || undefined,
      purchasedAt,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    });

    for (const item of items) {
      await ctx.db.insert("purchaseItems", {
        userId: args.userId,
        listId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        note: item.note,
        createdAt: now,
        updatedAt: now,
      });
    }

    await ctx.db.patch(args.userId, { updatedAt: now, lastSeenAt: now });
    return listId;
  },
});

export const update = mutation({
  args: {
    userId: v.id("users"),
    listId: v.id("purchaseLists"),
    name: v.optional(v.string()),
    note: v.optional(v.string()),
    purchasedAt: v.optional(v.number()),
    isArchived: v.optional(v.boolean()),
    items: v.optional(v.array(purchaseItemInput)),
  },
  handler: async (ctx, args) => {
    await assertListOwner(ctx, args.userId, args.listId);

    const now = Date.now();
    const patch: Partial<Doc<"purchaseLists">> = { updatedAt: now };

    if (args.name !== undefined) {
      const name = args.name.trim();
      if (!name) throw new Error("Enter a list name.");
      patch.name = name;
    }
    if (args.note !== undefined) {
      patch.note = args.note.trim() || undefined;
    }
    if (args.purchasedAt !== undefined) {
      patch.purchasedAt = args.purchasedAt;
    }
    if (args.isArchived !== undefined) {
      patch.isArchived = args.isArchived;
    }

    await ctx.db.patch(args.listId, patch);

    if (args.items !== undefined) {
      const items = normalizeItems(args.items);
      const existing = await ctx.db
        .query("purchaseItems")
        .withIndex("by_list", (q) => q.eq("listId", args.listId))
        .collect();

      for (const row of existing) {
        await ctx.db.delete(row._id);
      }

      for (const item of items) {
        await ctx.db.insert("purchaseItems", {
          userId: args.userId,
          listId: args.listId,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          note: item.note,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    await ctx.db.patch(args.userId, { updatedAt: now, lastSeenAt: now });
    return args.listId;
  },
});

export const remove = mutation({
  args: {
    userId: v.id("users"),
    listId: v.id("purchaseLists"),
  },
  handler: async (ctx, args) => {
    await assertListOwner(ctx, args.userId, args.listId);

    const items = await ctx.db
      .query("purchaseItems")
      .withIndex("by_list", (q) => q.eq("listId", args.listId))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }

    await ctx.db.delete(args.listId);
    return args.listId;
  },
});

export const listWithTotals = query({
  args: {
    userId: v.id("users"),
    includeArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const lists = await ctx.db
      .query("purchaseLists")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const includeArchived = args.includeArchived ?? false;
    const filtered = includeArchived ? lists : lists.filter((row) => !row.isArchived);

    const allItems = await ctx.db
      .query("purchaseItems")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const itemsByList = new Map<Id<"purchaseLists">, Doc<"purchaseItems">[]>();
    for (const item of allItems) {
      const bucket = itemsByList.get(item.listId) ?? [];
      bucket.push(item);
      itemsByList.set(item.listId, bucket);
    }

    return filtered
      .map((list) => {
        const items = (itemsByList.get(list._id) ?? []).sort((a, b) => a.createdAt - b.createdAt);
        return {
          ...list,
          ...totalsForItems(items),
          items,
        };
      })
      .sort((a, b) => b.purchasedAt - a.purchasedAt);
  },
});

export const get = query({
  args: {
    userId: v.id("users"),
    listId: v.id("purchaseLists"),
  },
  handler: async (ctx, args) => {
    const list = await assertListOwner(ctx, args.userId, args.listId);
    const items = await ctx.db
      .query("purchaseItems")
      .withIndex("by_user_and_list", (q) => q.eq("userId", args.userId).eq("listId", args.listId))
      .collect();

    const sorted = items.sort((a, b) => a.createdAt - b.createdAt);
    return {
      ...list,
      ...totalsForItems(sorted),
      items: sorted,
    };
  },
});
