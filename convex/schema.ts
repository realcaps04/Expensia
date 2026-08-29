import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { category, creditType, paymentMethod, provider, transactionType, userSettings } from "./validators";

export default defineSchema({
  users: defineTable({
    provider,
    googleSub: v.optional(v.string()),
    email: v.string(),
    passwordHash: v.optional(v.string()),
    firstName: v.string(),
    lastName: v.string(),
    pictureUrl: v.optional(v.string()),
    contactNumber: v.optional(v.string()),
    settings: userSettings,
    createdAt: v.number(),
    updatedAt: v.number(),
    lastSeenAt: v.number(),
  })
    .index("by_google_sub", ["googleSub"])
    .index("by_email", ["email"]),

  transactions: defineTable({
    userId: v.id("users"),
    type: transactionType,
    amount: v.number(),
    title: v.string(),
    category,
    paymentMethod,
    note: v.optional(v.string()),
    occurredAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_time", ["userId", "occurredAt"])
    .index("by_user_and_type", ["userId", "type"]),

  budgets: defineTable({
    userId: v.id("users"),
    monthKey: v.string(),
    totalLimit: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_month", ["userId", "monthKey"]),

  categoryBudgets: defineTable({
    userId: v.id("users"),
    monthKey: v.string(),
    category,
    limit: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_and_month", ["userId", "monthKey"])
    .index("by_user_month_category", ["userId", "monthKey", "category"]),

  credits: defineTable({
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
    isArchived: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_archived", ["userId", "isArchived"]),
});
