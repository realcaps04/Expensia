import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { hashPassword, verifyPassword } from "./lib/helpers";
import { DEFAULT_SETTINGS, userSettings } from "./validators";

export type PublicUser = ReturnType<typeof toPublicUser>;

function toPublicUser(user: Doc<"users">) {
  return {
    _id: user._id,
    provider: user.provider,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    pictureUrl: user.pictureUrl,
    contactNumber: user.contactNumber,
    settings: user.settings,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastSeenAt: user.lastSeenAt,
  };
}

async function findByEmail(ctx: QueryCtx | MutationCtx, email: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email.trim().toLowerCase()))
    .unique();
}

async function findByGoogleSub(ctx: QueryCtx | MutationCtx, googleSub: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_google_sub", (q) => q.eq("googleSub", googleSub))
    .unique();
}

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return toPublicUser(user);
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await findByEmail(ctx, args.email);
    if (!user) return null;
    return toPublicUser(user);
  },
});

export const registerEmailUser = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    if (!email || !args.password) {
      throw new Error("Email and password are required.");
    }
    if (args.password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    const existing = await findByEmail(ctx, email);
    if (existing) {
      throw new Error("An account with this email already exists.");
    }

    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      provider: "email",
      email,
      passwordHash: hashPassword(args.password),
      firstName: args.firstName.trim(),
      lastName: args.lastName.trim(),
      settings: DEFAULT_SETTINGS,
      createdAt: now,
      updatedAt: now,
      lastSeenAt: now,
    });

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Could not create user.");
    return toPublicUser(user);
  },
});

export const signInEmailUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await findByEmail(ctx, args.email);
    if (!user || user.provider !== "email" || !user.passwordHash) {
      throw new Error("Invalid email or password.");
    }
    if (!verifyPassword(args.password, user.passwordHash)) {
      throw new Error("Invalid email or password.");
    }

    const now = Date.now();
    await ctx.db.patch(user._id, { lastSeenAt: now, updatedAt: now });
    return toPublicUser({ ...user, lastSeenAt: now, updatedAt: now });
  },
});

export const upsertGoogleUser = mutation({
  args: {
    googleSub: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    googleName: v.string(),
    pictureUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const nameParts = args.googleName.trim().split(/\s+/);
    const firstName = args.firstName?.trim() || nameParts[0] || "User";
    const lastName = args.lastName?.trim() || nameParts.slice(1).join(" ") || "";
    const email = args.email.trim().toLowerCase();

    let user = await findByGoogleSub(ctx, args.googleSub);

    if (!user) {
      const byEmail = await findByEmail(ctx, email);
      if (byEmail) {
        await ctx.db.patch(byEmail._id, {
          provider: "google",
          googleSub: args.googleSub,
          email,
          firstName: byEmail.firstName || firstName,
          lastName: byEmail.lastName || lastName,
          pictureUrl: args.pictureUrl ?? byEmail.pictureUrl,
          passwordHash: undefined,
          lastSeenAt: now,
          updatedAt: now,
        });
        user = (await ctx.db.get(byEmail._id))!;
      }
    }

    if (user) {
      await ctx.db.patch(user._id, {
        email,
        firstName,
        lastName,
        pictureUrl: args.pictureUrl ?? user.pictureUrl,
        lastSeenAt: now,
        updatedAt: now,
      });
      const updated = await ctx.db.get(user._id);
      if (!updated) throw new Error("User not found.");
      return toPublicUser(updated);
    }

    const userId = await ctx.db.insert("users", {
      provider: "google",
      googleSub: args.googleSub,
      email,
      firstName,
      lastName,
      pictureUrl: args.pictureUrl,
      settings: DEFAULT_SETTINGS,
      createdAt: now,
      updatedAt: now,
      lastSeenAt: now,
    });

    const created = await ctx.db.get(userId);
    if (!created) throw new Error("Could not create user.");
    return toPublicUser(created);
  },
});

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    contactNumber: v.optional(v.string()),
    pictureUrl: v.optional(v.string()),
    settings: v.optional(userSettings),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found.");

    const now = Date.now();
    await ctx.db.patch(args.userId, {
      ...(args.firstName !== undefined ? { firstName: args.firstName.trim() } : {}),
      ...(args.lastName !== undefined ? { lastName: args.lastName.trim() } : {}),
      ...(args.contactNumber !== undefined
        ? { contactNumber: args.contactNumber.trim() || undefined }
        : {}),
      ...(args.pictureUrl !== undefined ? { pictureUrl: args.pictureUrl } : {}),
      ...(args.settings !== undefined ? { settings: args.settings } : {}),
      updatedAt: now,
      lastSeenAt: now,
    });

    const updated = await ctx.db.get(args.userId);
    if (!updated) throw new Error("User not found.");
    return toPublicUser(updated);
  },
});
