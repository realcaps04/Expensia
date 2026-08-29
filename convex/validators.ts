import { v } from "convex/values";

export const provider = v.union(v.literal("email"), v.literal("google"));

export const transactionType = v.union(v.literal("income"), v.literal("expense"));

export const category = v.union(
  v.literal("food"),
  v.literal("transport"),
  v.literal("shopping"),
  v.literal("bills"),
  v.literal("entertainment"),
  v.literal("health"),
  v.literal("salary"),
  v.literal("freelance"),
  v.literal("other"),
);

export const paymentMethod = v.union(
  v.literal("cash"),
  v.literal("upi"),
  v.literal("card"),
  v.literal("bank_transfer"),
  v.literal("other"),
);

export const userSettings = v.object({
  currency: v.string(),
  theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
  notifications: v.boolean(),
});

export const DEFAULT_SETTINGS = {
  currency: "INR",
  theme: "light" as const,
  notifications: true,
};
