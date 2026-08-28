import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

declare const process: {
  env: Record<string, string | undefined>;
};

const SESSION_DURATION_MS = 1000 * 60 * 60 * 12;

export const login = mutation({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, { username, password }) => {
    const configuredUsername = process.env.CONSOLE_USERNAME;
    const configuredPassword = process.env.CONSOLE_PASSWORD;
    if (!configuredUsername || !configuredPassword || username !== configuredUsername || password !== configuredPassword) {
      throw new ConvexError("Invalid console credentials");
    }
    const now = Date.now();
    const token = crypto.randomUUID();
    await ctx.db.insert("consoleSessions", { token, expiresAt: now + SESSION_DURATION_MS });
    return { token, expiresAt: now + SESSION_DURATION_MS };
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db.query("consoleSessions").withIndex("by_token", (q) => q.eq("token", token)).unique();
    if (session) await ctx.db.delete(session._id);
  },
});

export const validateSession = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const session = await ctx.db.query("consoleSessions").withIndex("by_token", (q) => q.eq("token", token)).unique();
    return Boolean(session && session.expiresAt > Date.now());
  },
});
