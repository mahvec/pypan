import { ArrowLeft } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { GET_REVEAL, isConvexConfigured, type PublicReveal, type PublicSearchResult } from "@/app/convex";
import { LeaderContact } from "@/modules/house-reveal/components/LeaderContact";
import type { House, Participant } from "@/modules/house-reveal/types";
import { BrandMark } from "@/shared/ui/BrandMark";
import { Button } from "@/shared/ui/Button";

export type RevealLoaderData = { participant: Participant; house: House };

export function RevealPage() {
  if (isConvexConfigured) return <ConnectedReveal />;
  return <PreviewReveal />;
}

function PreviewReveal() {
  const reveal = useLoaderData() as RevealLoaderData;
  return <RevealContent participant={reveal.participant} house={reveal.house} />;
}

function ConnectedReveal() {
  const { participantId } = useParams();
  const reveal = useQuery(GET_REVEAL, participantId ? { participantId: participantId as PublicSearchResult["id"] } : "skip");
  if (reveal === undefined) return <RevealStatus message="Finding your house..." />;
  if (reveal === null) return <RevealStatus message="We could not find a complete reveal. Please ask an organiser for assistance." />;
  return <LiveRevealContent reveal={reveal} />;
}

function LiveRevealContent({ reveal }: { reveal: PublicReveal }) {
  return <RevealContent participant={reveal.participant} house={reveal.house} isLive />;
}

type DisplayHouse = Pick<House, "name" | "namesake" | "food" | "captain" | "viceCaptain"> & { colour?: string; themeClass?: string; textClass?: string };

function RevealContent({ participant, house, isLive = false }: { participant: Pick<Participant, "id" | "name">; house: DisplayHouse; isLive?: boolean }) {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const animation = shouldReduceMotion ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: .45, ease: [0.16, 1, 0.3, 1] as const } };
  const classes = isLive ? "text-white" : `${house.themeClass} ${house.textClass}`;
  const style = isLive && house.colour ? { backgroundColor: house.colour } : undefined;
  return <main className={`relative flex min-h-[100dvh] flex-col overflow-hidden p-5 sm:p-6 ${classes}`} style={style}><div aria-hidden="true" className="pointer-events-none absolute bottom-[-.12em] right-[-.1em] text-[clamp(7rem,28vw,20rem)] font-extrabold leading-[.7] tracking-[-.1em] opacity-12">{house.namesake}</div><header className="z-10 flex items-start justify-between gap-4"><BrandMark /><Button variant="text" onClick={() => navigate("/")}><ArrowLeft size={18} />Search again</Button></header><motion.section className="z-10 my-auto max-w-170" {...animation}><p className="mb-3.5 text-[11px] font-bold uppercase tracking-[.14em]">You are in</p><h1 className="m-0 text-[clamp(3.75rem,11vw,8.25rem)] leading-[.9] tracking-[-.08em]">{house.name}</h1><p className="mt-4 text-lg font-bold">{participant.name}</p><p className="mt-3 text-base">Named for <strong>{house.namesake}</strong></p><div className="my-7 h-0.5 w-13 bg-current opacity-70" /><div className="flex flex-col gap-1"><span className="text-xs font-bold uppercase tracking-[.1em] opacity-75">Your house brings</span><strong className="max-w-155 text-[clamp(1.4rem,4vw,2.125rem)]">{house.food}</strong></div><div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6"><LeaderContact label="Captain" leader={house.captain} /><LeaderContact label="Vice captain" leader={house.viceCaptain} /></div></motion.section></main>;
}

function RevealStatus({ message }: { message: string }) {
  return <main className="flex min-h-[100dvh] items-center justify-center bg-paper p-5 text-center"><p className="max-w-sm leading-relaxed text-muted">{message}</p></main>;
}
