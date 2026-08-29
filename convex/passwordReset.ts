import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { MutationCtx } from "./_generated/server";
import { internalAction, mutation } from "./_generated/server";
import {
  generateOtp,
  generateResetToken,
  hashOtp,
  hashPassword,
  hashToken,
  validateNewPassword,
  verifyOtp,
  verifyToken,
} from "./lib/helpers";

const OTP_TTL_MS = 5 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function findEmailUser(ctx: MutationCtx, email: string) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .unique();
  if (!user || user.provider !== "email" || !user.passwordHash) return null;
  return user;
}

async function latestOtpForEmail(ctx: MutationCtx, email: string) {
  const rows = await ctx.db
    .query("passwordResetOtps")
    .withIndex("by_email", (q) => q.eq("email", email))
    .collect();
  return rows.sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;
}

export const requestPasswordReset = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    if (!email) throw new Error("Email is required.");

    const now = Date.now();
    const expiresAt = now + OTP_TTL_MS;
    const user = await findEmailUser(ctx, email);

    if (user) {
      const recent = await latestOtpForEmail(ctx, email);
      if (recent && !recent.consumedAt && now - recent.createdAt < RESEND_COOLDOWN_MS) {
        throw new Error("Please wait a minute before requesting another code.");
      }

      const activeRows = await ctx.db
        .query("passwordResetOtps")
        .withIndex("by_email", (q) => q.eq("email", email))
        .collect();

      for (const row of activeRows) {
        if (!row.consumedAt) {
          await ctx.db.patch(row._id, { consumedAt: now });
        }
      }

      const code = generateOtp();
      await ctx.db.insert("passwordResetOtps", {
        email,
        userId: user._id,
        codeHash: hashOtp(code),
        expiresAt,
        attempts: 0,
        createdAt: now,
      });

      await ctx.scheduler.runAfter(0, internal.passwordReset.sendResetEmail, {
        email,
        code,
      });
    }

    return {
      expiresAt,
      message: "If an account exists for this email, we sent a verification code.",
    };
  },
});

export const verifyPasswordResetCode = mutation({
  args: {
    email: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    const code = args.code.trim();

    if (!/^\d{6}$/.test(code)) {
      throw new Error("Enter a valid 6-digit code.");
    }

    const otp = await latestOtpForEmail(ctx, email);
    const now = Date.now();

    if (!otp || otp.consumedAt) {
      throw new Error("Invalid or expired code.");
    }
    if (now > otp.expiresAt) {
      throw new Error("This code has expired. Request a new one.");
    }
    if (otp.attempts >= MAX_VERIFY_ATTEMPTS) {
      throw new Error("Too many attempts. Request a new code.");
    }

    if (!verifyOtp(code, otp.codeHash)) {
      await ctx.db.patch(otp._id, { attempts: otp.attempts + 1 });
      throw new Error("Incorrect verification code.");
    }

    const resetToken = generateResetToken();
    await ctx.db.patch(otp._id, {
      verifiedAt: now,
      resetTokenHash: hashToken(resetToken),
      resetTokenExpiresAt: now + RESET_TOKEN_TTL_MS,
    });

    return {
      resetToken,
      resetTokenExpiresAt: now + RESET_TOKEN_TTL_MS,
    };
  },
});

export const completePasswordReset = mutation({
  args: {
    email: v.string(),
    resetToken: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const email = normalizeEmail(args.email);
    validateNewPassword(args.newPassword);

    const otp = await latestOtpForEmail(ctx, email);
    const now = Date.now();

    if (!otp?.verifiedAt || !otp.resetTokenHash || !otp.resetTokenExpiresAt) {
      throw new Error("Reset session expired. Start again.");
    }
    if (otp.consumedAt) {
      throw new Error("This reset has already been used.");
    }
    if (now > otp.resetTokenExpiresAt) {
      throw new Error("Reset session expired. Start again.");
    }
    if (!verifyToken(args.resetToken, otp.resetTokenHash)) {
      throw new Error("Reset session expired. Start again.");
    }

    const user = await ctx.db.get(otp.userId);
    if (!user) throw new Error("Account not found.");

    await ctx.db.patch(user._id, {
      passwordHash: hashPassword(args.newPassword),
      updatedAt: now,
    });
    await ctx.db.patch(otp._id, { consumedAt: now });

    return { success: true };
  },
});

export const sendResetEmail = internalAction({
  args: {
    email: v.string(),
    code: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL ?? "Expensia <onboarding@resend.dev>";

    if (apiKey) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [args.email],
          subject: "Your Expensia password reset code",
          html: `
            <div style="font-family:Inter,sans-serif;line-height:1.6;color:#1e293b">
              <h2 style="margin:0 0 12px">Reset your Expensia password</h2>
              <p>Use this verification code to continue:</p>
              <p style="font-size:28px;font-weight:700;letter-spacing:0.2em;color:#0d9488">${args.code}</p>
              <p style="color:#64748b">This code expires in 5 minutes. If you didn't request this, you can ignore this email.</p>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        console.error("[Expensia] Failed to send reset email:", await response.text());
      }
      return;
    }

    console.log(`[Expensia dev] Password reset code for ${args.email}: ${args.code}`);
  },
});
