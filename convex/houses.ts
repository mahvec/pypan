import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireConsoleSession } from "./requireConsoleSession";

export const list = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    await requireConsoleSession(ctx, sessionToken);
    const houses = await ctx.db.query("houses").collect();
    return await Promise.all(houses.map(async (house) => ({ ...house, participantCount: (await ctx.db.query("participants").withIndex("by_house", (q) => q.eq("houseId", house._id)).collect()).length })));
  },
});

export const create = mutation({
  args: { sessionToken: v.string(), name: v.string(), namesake: v.string(), food: v.string(), colour: v.string() },
  handler: async (ctx, { sessionToken, name, namesake, food, colour }) => {
    await requireConsoleSession(ctx, sessionToken);
    const houses = await ctx.db.query("houses").collect();
    if (houses.length >= 4) throw new ConvexError("This event can have no more than four houses");
    if (houses.some((house) => house.name.toLocaleLowerCase() === name.trim().toLocaleLowerCase())) throw new ConvexError("A house with this name already exists");
    const houseId = await ctx.db.insert("houses", { name: name.trim(), namesake: namesake.trim(), food: food.trim(), colour: colour.trim() });
    await ctx.db.insert("auditLog", { action: "create", detail: `Created ${name.trim()}`, createdAt: Date.now() });
    return houseId;
  },
});

export const update = mutation({
  args: { sessionToken: v.string(), houseId: v.id("houses"), name: v.string(), namesake: v.string(), food: v.string(), colour: v.string() },
  handler: async (ctx, { sessionToken, houseId, name, namesake, food, colour }) => {
    await requireConsoleSession(ctx, sessionToken);
    const house = await ctx.db.get(houseId);
    if (!house) throw new ConvexError("House not found");
    await ctx.db.patch(houseId, { name: name.trim(), namesake: namesake.trim(), food: food.trim(), colour: colour.trim() });
    await ctx.db.insert("auditLog", { action: "edit", detail: `Updated ${name.trim()}`, createdAt: Date.now() });
  },
});

export const setLeadership = mutation({
  args: { sessionToken: v.string(), houseId: v.id("houses"), captainId: v.id("participants"), viceCaptainId: v.id("participants") },
  handler: async (ctx, { sessionToken, houseId, captainId, viceCaptainId }) => {
    await requireConsoleSession(ctx, sessionToken);
    if (captainId === viceCaptainId) throw new ConvexError("Captain and vice captain must be different people");
    const [house, captain, viceCaptain] = await Promise.all([ctx.db.get(houseId), ctx.db.get(captainId), ctx.db.get(viceCaptainId)]);
    if (!house || !captain || !viceCaptain || captain.houseId !== houseId || viceCaptain.houseId !== houseId || !captain.phone || !viceCaptain.phone) throw new ConvexError("Leaders must be house members with telephone numbers");
    await ctx.db.patch(houseId, { captainId, viceCaptainId });
    await ctx.db.insert("auditLog", { action: "edit", detail: `Updated leaders for ${house.name}`, createdAt: Date.now() });
  },
});
