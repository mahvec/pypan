import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  houses: defineTable({
    name: v.string(),
    namesake: v.string(),
    food: v.string(),
    colour: v.string(),
    captainId: v.optional(v.id("participants")),
    viceCaptainId: v.optional(v.id("participants")),
  }),
  participants: defineTable({
    name: v.string(),
    normalizedName: v.string(),
    houseId: v.id("houses"),
    phone: v.optional(v.string()),
    origin: v.union(v.literal("uploaded"), v.literal("manual")),
    firstVerifiedAt: v.optional(v.number()),
    revealCount: v.number(),
  }).index("by_normalized_name", ["normalizedName"]).index("by_house", ["houseId"]),
  auditLog: defineTable({
    action: v.union(v.literal("create"), v.literal("edit"), v.literal("reassign"), v.literal("delete"), v.literal("bulk_upload"), v.literal("verify")),
    participantId: v.optional(v.id("participants")),
    detail: v.optional(v.string()),
    createdAt: v.number(),
  }),
  consoleSessions: defineTable({
    token: v.string(),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),
});
