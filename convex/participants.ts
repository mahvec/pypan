import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireConsoleSession } from "./requireConsoleSession";

const normalizeName = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
const uploadRow = v.object({ rowNumber: v.number(), name: v.string(), phone: v.optional(v.string()) });

export const search = query({
  args: { term: v.string() },
  handler: async (ctx, { term }) => {
    const normalizedTerm = normalizeName(term);
    if (normalizedTerm.length < 3) return [];
    const participants = await ctx.db.query("participants").collect();
    return participants.filter((participant) => participant.normalizedName.includes(normalizedTerm)).slice(0, 10).map(({ _id, name }) => ({ id: _id, name }));
  },
});

export const getReveal = query({
  args: { participantId: v.id("participants") },
  handler: async (ctx, { participantId }) => {
    const participant = await ctx.db.get(participantId);
    if (!participant) return null;
    const house = await ctx.db.get(participant.houseId);
    if (!house || !house.captainId || !house.viceCaptainId) return null;
    const [captain, viceCaptain] = await Promise.all([ctx.db.get(house.captainId), ctx.db.get(house.viceCaptainId)]);
    if (!captain?.phone || !viceCaptain?.phone) return null;
    return { participant: { id: participant._id, name: participant.name, houseId: participant.houseId }, house: { id: house._id, name: house.name, namesake: house.namesake, food: house.food, colour: house.colour, captain: { name: captain.name, phone: captain.phone }, viceCaptain: { name: viceCaptain.name, phone: viceCaptain.phone } } };
  },
});

export const recordReveal = mutation({
  args: { participantId: v.id("participants") },
  handler: async (ctx, { participantId }) => {
    const participant = await ctx.db.get(participantId);
    if (!participant) return;
    const now = Date.now();
    await ctx.db.patch(participantId, { revealCount: participant.revealCount + 1, firstVerifiedAt: participant.firstVerifiedAt ?? now });
    await ctx.db.insert("auditLog", { action: "verify", participantId, createdAt: now });
  },
});

export const previewUpload = query({
  args: { sessionToken: v.string(), houseId: v.id("houses"), rows: v.array(uploadRow) },
  handler: async (ctx, { sessionToken, houseId, rows }) => {
    await requireConsoleSession(ctx, sessionToken);
    if (!await ctx.db.get(houseId)) throw new Error("House not found");
    const existing = new Set((await ctx.db.query("participants").collect()).map((participant) => participant.normalizedName));
    const seen = new Set<string>();
    return rows.map((row) => {
      const normalizedName = normalizeName(row.name);
      const reason = !normalizedName ? "Name is blank" : existing.has(normalizedName) ? "Name already exists in the roster" : seen.has(normalizedName) ? "Duplicate in this upload" : undefined;
      seen.add(normalizedName);
      return { ...row, accepted: !reason, reason };
    });
  },
});

export const commitUpload = mutation({
  args: { sessionToken: v.string(), houseId: v.id("houses"), rows: v.array(uploadRow) },
  handler: async (ctx, { sessionToken, houseId, rows }) => {
    await requireConsoleSession(ctx, sessionToken);
    if (!await ctx.db.get(houseId)) throw new Error("House not found");
    const existing = new Set((await ctx.db.query("participants").collect()).map((participant) => participant.normalizedName));
    const seen = new Set<string>();
    let accepted = 0;
    let rejected = 0;
    for (const row of rows) {
      const normalizedName = normalizeName(row.name);
      if (!normalizedName || existing.has(normalizedName) || seen.has(normalizedName)) { rejected += 1; continue; }
      seen.add(normalizedName);
      existing.add(normalizedName);
      await ctx.db.insert("participants", { name: row.name.trim(), normalizedName, houseId, phone: row.phone?.trim() || undefined, origin: "uploaded", revealCount: 0 });
      accepted += 1;
    }
    await ctx.db.insert("auditLog", { action: "bulk_upload", detail: `${accepted} accepted, ${rejected} rejected`, createdAt: Date.now() });
    return { accepted, rejected };
  },
});

export const listForConsole = query({
  args: { sessionToken: v.string(), search: v.optional(v.string()), houseId: v.optional(v.id("houses")), verified: v.optional(v.boolean()) },
  handler: async (ctx, { sessionToken, search, houseId, verified }) => {
    await requireConsoleSession(ctx, sessionToken);
    const term = search ? normalizeName(search) : "";
    return (await ctx.db.query("participants").collect()).filter((participant) => (!term || participant.normalizedName.includes(term)) && (!houseId || participant.houseId === houseId) && (verified === undefined || Boolean(participant.firstVerifiedAt) === verified));
  },
});

export const update = mutation({
  args: { sessionToken: v.string(), participantId: v.id("participants"), name: v.string(), phone: v.optional(v.string()), houseId: v.id("houses") },
  handler: async (ctx, { sessionToken, participantId, name, phone, houseId }) => {
    await requireConsoleSession(ctx, sessionToken);
    const participant = await ctx.db.get(participantId);
    if (!participant || !await ctx.db.get(houseId)) throw new Error("Participant or house not found");
    const normalizedName = normalizeName(name);
    const duplicate = (await ctx.db.query("participants").withIndex("by_normalized_name", (q) => q.eq("normalizedName", normalizedName)).collect()).find((item) => item._id !== participantId);
    if (duplicate) throw new Error("A participant with this name already exists");
    await ctx.db.patch(participantId, { name: name.trim(), normalizedName, phone: phone?.trim() || undefined, houseId });
    await ctx.db.insert("auditLog", { action: participant.houseId === houseId ? "edit" : "reassign", participantId, createdAt: Date.now() });
  },
});

export const remove = mutation({
  args: { sessionToken: v.string(), participantId: v.id("participants") },
  handler: async (ctx, { sessionToken, participantId }) => {
    await requireConsoleSession(ctx, sessionToken);
    const participant = await ctx.db.get(participantId);
    if (!participant) return;
    const house = await ctx.db.get(participant.houseId);
    if (house?.captainId === participantId || house?.viceCaptainId === participantId) await ctx.db.patch(house._id, { captainId: house.captainId === participantId ? undefined : house.captainId, viceCaptainId: house.viceCaptainId === participantId ? undefined : house.viceCaptainId });
    await ctx.db.delete(participantId);
    await ctx.db.insert("auditLog", { action: "delete", detail: participant.name, createdAt: Date.now() });
  },
});
