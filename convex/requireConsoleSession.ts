import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";

export async function requireConsoleSession(ctx: QueryCtx | MutationCtx, token: string) {
  const session = await ctx.db.query("consoleSessions").withIndex("by_token", (q) => q.eq("token", token)).unique();
  if (!session || session.expiresAt <= Date.now()) throw new ConvexError("Unauthorised Console request");
}
