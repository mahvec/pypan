import { ConvexReactClient } from "convex/react";
import type { Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";
import type { Leader } from "@/modules/house-reveal/types";

export type PublicSearchResult = { id: Id<"participants">; name: string };
export type PublicReveal = { participant: PublicSearchResult; house: { id: Id<"houses">; name: string; namesake: string; food: string; colour: string; captain: Leader; viceCaptain: Leader } };

export const isConvexConfigured = Boolean(import.meta.env.VITE_CONVEX_URL);
export const convexClient = isConvexConfigured ? new ConvexReactClient(import.meta.env.VITE_CONVEX_URL) : null;
export const SEARCH_PARTICIPANTS = api.participants.search;
export const GET_REVEAL = api.participants.getReveal;
export const RECORD_REVEAL = api.participants.recordReveal;
