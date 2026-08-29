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
    eventId: v.optional(v.id("events")),
    occurredAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_time", ["userId", "occurredAt"])
    .index("by_user_and_type", ["userId", "type"])
    .index("by_user_and_event", ["userId", "eventId"]),

  events: defineTable({
    userId: v.id("users"),
    name: v.string(),
    note: v.optional(v.string()),
    isArchived: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_archived", ["userId", "isArchived"]),

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
    startDate: v.optional(v.number()),
    tenureMonths: v.optional(v.number()),
    emiPaidCount: v.optional(v.number()),
    linkedIncomeId: v.optional(v.id("transactions")),
    eventId: v.optional(v.id("events")),
    isArchived: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_archived", ["userId", "isArchived"]),

  passwordResetOtps: defineTable({
    email: v.string(),
    userId: v.id("users"),
    codeHash: v.string(),
    expiresAt: v.number(),
    attempts: v.number(),
    verifiedAt: v.optional(v.number()),
    resetTokenHash: v.optional(v.string()),
    resetTokenExpiresAt: v.optional(v.number()),
    consumedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),
});
